from fastapi import FastAPI, HTTPException, Depends
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import ollama
from typing import Optional, List
import uuid
from fastapi.security import OAuth2PasswordBearer, OAuth2PasswordRequestForm
from datetime import datetime, timedelta
import jwt
from passlib.context import CryptContext
import wikipedia
import requests
from bs4 import BeautifulSoup

# You would need to set up a database in a real application
# This is just a simple in-memory store for demonstration
users_db = {}
chats_db = {}
SECRET_KEY = "your-secret-key"
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 30

app = FastAPI()

# Make sure your CORS settings in the server include credentials and proper headers

# Add these imports if not already present
from fastapi.middleware.cors import CORSMiddleware

# Setup CORS with proper settings
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # In production, list specific domains
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
    expose_headers=["*"]
)

# Password hashing
pwd_context = CryptContext(schemes=["sha256_crypt"], deprecated="auto")
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="token")

# Models
class ChatRequest(BaseModel):
    message: str
    agentId: Optional[str] = "general"
    model: Optional[str] = "qwen2.5"

class User(BaseModel):
    email: str
    name: str
    password: str

class UserInDB(User):
    id: str
    hashed_password: str
    # Make password optional for UserInDB since we don't want to store it
    password: Optional[str] = None

class Token(BaseModel):
    access_token: str
    token_type: str

class TokenData(BaseModel):
    email: Optional[str] = None

class Chat(BaseModel):
    id: str
    name: str
    user_id: str
    agent_id: str
    messages: List[dict] = []

# Helper functions
def verify_password(plain_password, hashed_password):
    return pwd_context.verify(plain_password, hashed_password)

def get_password_hash(password):
    return pwd_context.hash(password)

def get_user(email: str):
    if email in users_db:
        user_dict = users_db[email]
        return UserInDB(**user_dict)
    return None

def authenticate_user(email: str, password: str):
    user = get_user(email)
    if not user:
        return False
    if not verify_password(password, user.hashed_password):
        return False
    return user

def create_access_token(data: dict, expires_delta: timedelta = None):
    to_encode = data.copy()
    if expires_delta:
        expire = datetime.utcnow() + expires_delta
    else:
        expire = datetime.utcnow() + timedelta(minutes=15)
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt

async def get_current_user(token: str = Depends(oauth2_scheme)):
    credentials_exception = HTTPException(
        status_code=401,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        email: str = payload.get("sub")
        if email is None:
            raise credentials_exception
        token_data = TokenData(email=email)
    except:
        raise credentials_exception
    user = get_user(email=token_data.email)
    if user is None:
        raise credentials_exception
    return user

def search_wikipedia(query: str):
    try:
        # Search for the query on Wikipedia
        search_results = wikipedia.search(query, results=3)
        
        if not search_results:
            return {
                "title": "No results found",
                "content": f"No Wikipedia results found for '{query}'."
            }
        
        # Get the first result and extract summary
        try:
            page = wikipedia.page(search_results[0])
            content = f"# {page.title}\n\n{page.summary}\n\nSource: {page.url}"
            return {"title": page.title, "content": content}
        except wikipedia.DisambiguationError as e:
            # If there's a disambiguation page, get the first option
            try:
                page = wikipedia.page(e.options[0])
                content = f"# {page.title}\n\n{page.summary}\n\nSource: {page.url}"
                return {"title": page.title, "content": content}
            except:
                return {
                    "title": "Disambiguation Error",
                    "content": f"Multiple entries found for '{query}'. Try to be more specific."
                }
    except Exception as e:
        return {
            "title": "Error",
            "content": f"Error while searching for '{query}': {str(e)}"
        }

# Routes
@app.post("/register")
async def register(user: User):
    try:
        if user.email in users_db:
            raise HTTPException(status_code=400, detail="Email already registered")
        
        user_id = str(uuid.uuid4())
        try:
            hashed_password = get_password_hash(user.password)
        except Exception as hash_error:
            print(f"Password hashing error: {str(hash_error)}")
            raise HTTPException(
                status_code=500, 
                detail="Password hashing error. Server configuration issue."
            )
        
        # Store user with all required fields
        users_db[user.email] = {
            "id": user_id,
            "email": user.email,
            "name": user.name,
            "hashed_password": hashed_password,
            # Store empty password to satisfy the model validation
            "password": None
        }
        
        return {"id": user_id, "email": user.email, "name": user.name}
    except HTTPException:
        raise
    except Exception as e:
        # Log the actual error for debugging
        print(f"Registration error: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/token", response_model=Token)
async def login_for_access_token(form_data: OAuth2PasswordRequestForm = Depends()):
    user = authenticate_user(form_data.username, form_data.password)
    if not user:
        raise HTTPException(
            status_code=401,
            detail="Incorrect email or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    access_token_expires = timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = create_access_token(
        data={"sub": user.email}, expires_delta=access_token_expires
    )
    return {"access_token": access_token, "token_type": "bearer"}

@app.get("/users/me")
async def read_users_me(current_user: UserInDB = Depends(get_current_user)):
    return {"id": current_user.id, "email": current_user.email, "name": current_user.name}

@app.get("/search/wiki")
async def wiki_search(query: str, current_user: UserInDB = Depends(get_current_user)):
    if not query:
        raise HTTPException(status_code=400, detail="Query parameter is required")
    
    result = search_wikipedia(query)
    return result

@app.post("/chat")
async def chat(request: ChatRequest, current_user: UserInDB = Depends(get_current_user)):
    try:
        # You can customize system prompts based on agent type
        system_prompt = "You are a helpful assistant."
        
        if request.agentId == "coding":
            system_prompt = "You are a coding assistant. Help with programming questions and code examples."
        elif request.agentId == "creative":
            system_prompt = "You are a creative writing assistant. Help with creative writing, ideas, and storytelling."
        
        response = ollama.chat(
            model=request.model,
            messages=[
                {"role": "system", "content": system_prompt},
                {"role": "user", "content": request.message}
            ]
        )
        return {"response": response["message"]["content"]}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/chats")
async def create_chat(chat_data: dict, current_user: UserInDB = Depends(get_current_user)):
    chat_id = str(uuid.uuid4())
    new_chat = Chat(
        id=chat_id,
        name=chat_data.get("name", "New Chat"),
        user_id=current_user.id,
        agent_id=chat_data.get("agent_id", "general"),
        messages=[]
    )
    
    if current_user.id not in chats_db:
        chats_db[current_user.id] = {}
    
    chats_db[current_user.id][chat_id] = new_chat.dict()
    return new_chat

@app.get("/chats")
async def get_chats(current_user: UserInDB = Depends(get_current_user)):
    if current_user.id not in chats_db:
        return []
    
    return list(chats_db[current_user.id].values())

@app.get("/chats/{chat_id}")
async def get_chat(chat_id: str, current_user: UserInDB = Depends(get_current_user)):
    if current_user.id not in chats_db or chat_id not in chats_db[current_user.id]:
        raise HTTPException(status_code=404, detail="Chat not found")
    
    return chats_db[current_user.id][chat_id]

@app.put("/chats/{chat_id}")
async def update_chat(chat_id: str, chat_data: dict, current_user: UserInDB = Depends(get_current_user)):
    if current_user.id not in chats_db or chat_id not in chats_db[current_user.id]:
        raise HTTPException(status_code=404, detail="Chat not found")
    
    chat = chats_db[current_user.id][chat_id]
    
    if "name" in chat_data:
        chat["name"] = chat_data["name"]
    
    if "messages" in chat_data:
        chat["messages"] = chat_data["messages"]
    
    if "agent_id" in chat_data:
        chat["agent_id"] = chat_data["agent_id"]
    
    return chat

@app.delete("/chats/{chat_id}")
async def delete_chat(chat_id: str, current_user: UserInDB = Depends(get_current_user)):
    if current_user.id not in chats_db or chat_id not in chats_db[current_user.id]:
        raise HTTPException(status_code=404, detail="Chat not found")
    
    del chats_db[current_user.id][chat_id]
    return {"status": "success"}

@app.get("/")
def home():
    return {"message": "Qwen 2.5 Chatbot API is running!"}
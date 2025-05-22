# Qwen Chatbot React App

A React web app with user authentication (login/register), a Qwen-powered chatbot with multiple roles, and image upload with preview.

## Features
- User authentication (login/register)
- Qwen chatbot with customizable roles
- Image upload with real-time preview
- Responsive UI with Tailwind CSS
- Real-time chat interactions

## Tech Stack
- **Frontend**: React, JSX, Tailwind CSS
- **Backend**: Node.js (assumed for auth and Qwen API integration)
- **CDN**: React and dependencies via cdn.jsdelivr.net
- **API**: Qwen API for chatbot functionality

## Preview
<img width="1508" alt="Screenshot 2025-05-22 at 21 55 10" src="https://github.com/user-attachments/assets/ab66da73-5d84-4d90-a53d-fc59554e9457" />

## Setup
1. Clone the repository:
   ```
   git clone https://github.com/longphu2308/QwenChatBot.git
   ```
2. Install dependencies:
   ```
   npm install
   ```
3. Configure environment variables:
   - Create `.env` file
   - Add Qwen API key and backend URL
   ```
   REACT_APP_QWEN_API_KEY=your_api_key
   REACT_APP_BACKEND_URL=http://localhost:5000
   ```
4. Run the app:
   ```
   npm start
   ```

## Usage
- **Register/Login**: Create an account or log in to access the chatbot.
- **Chatbot**: Select a role (e.g., assistant, expert) and interact with the Qwen chatbot.
- **Image Upload**: Upload images via the chat interface; preview displayed instantly.
- **Responsive Design**: Works on desktop and mobile browsers.

## Project Structure
- `src/components/`: Reusable React components (Login, Register, Chatbot, ImageUploader)
- `src/styles/`: Tailwind CSS configuration
- `src/App.jsx`: Main app component with routing

## Notes
- Ensure Qwen API is configured correctly.
- Avoid `<form>` onSubmit due to sandbox restrictions; use button handlers.
- Use `className` for JSX styling.
- Image uploads are processed client-side for preview; ensure backend supports image handling.

## License
MIT

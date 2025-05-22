import React from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

function Message({ message }) {
  // Function to process content and format markdown
  const formatContent = (content) => {
    // Replace triple backticks for code blocks with proper markdown
    let formattedContent = content;
    
    // Make lists work better by ensuring proper spacing
    formattedContent = formattedContent.replace(/\n- /g, '\n\n- ');
    
    // Ensure headers have proper spacing
    formattedContent = formattedContent.replace(/\n###/g, '\n\n###');
    formattedContent = formattedContent.replace(/\n##/g, '\n\n##');
    formattedContent = formattedContent.replace(/\n#/g, '\n\n#');
    
    return formattedContent;
  };

  return (
    <div className={`message ${message.role === 'user' ? 'user-message' : 'ai-message'}`}>
      <div className="message-bubble">
        {message.role === 'user' ? (
          <p>{message.content}</p>
        ) : (
          <div className="markdown-content">
            <ReactMarkdown 
              children={formatContent(message.content)} 
              remarkPlugins={[remarkGfm]}
              components={{
                h1: ({node, children, ...props}) => <h1 className="md-heading" {...props}>{children}</h1>,
                h2: ({node, children, ...props}) => <h2 className="md-heading" {...props}>{children}</h2>,
                h3: ({node, children, ...props}) => <h3 className="md-heading" {...props}>{children}</h3>,
                h4: ({node, children, ...props}) => <h4 className="md-heading" {...props}>{children}</h4>,
                ul: ({node, children, ...props}) => <ul className="md-list" {...props}>{children}</ul>,
                ol: ({node, children, ...props}) => <ol className="md-list" {...props}>{children}</ol>,
                li: ({node, children, ...props}) => <li className="md-list-item" {...props}>{children}</li>,
                p: ({node, children, ...props}) => <p className="md-paragraph" {...props}>{children}</p>,
                code: ({node, inline, className, children, ...props}) => {
                  const match = /language-(\w+)/.exec(className || '');
                  return !inline && match ? (
                    <div className="code-block-container">
                      <div className="code-header">
                        <span>{match[1]}</span>
                      </div>
                      <pre className="code-block">
                        <code className={className} {...props}>
                          {children}
                        </code>
                      </pre>
                    </div>
                  ) : (
                    <code className={inline ? "inline-code" : "code-block"} {...props}>
                      {children}
                    </code>
                  );
                }
              }}
            />
          </div>
        )}
      </div>
    </div>
  );
}

export default Message;
import { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { MessageCircle, X, Send } from 'lucide-react';
import { DatasetParser } from '@/utils/datasetParser';
import { AIService, AIResponse } from '@/utils/aiService';

interface Message {
  id: string;
  content: string;
  isUser: boolean;
  timestamp: Date;
}

const ChatBot = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const aiServiceRef = useRef<AIService | null>(null);

  useEffect(() => {
    // Initialize AI service with dataset
    const datasetContent = `M873 CHATBOT DATASET
Owner: Md. Mahfuzul Islam
Site: https://m-873.github.io/M873

Q1 (EN): What is M873?
A:
M873 is an easy AI platform for learning and building projects. You can explore AI, practice development, and create smart solutions with simple tools.

Q2 (EN): Who created M873?
A:
M873 was created by Md. Mahfuzul Islam, an Electrical & Electronic Engineering graduate from Northern University, Bangladesh.

Q3 (EN): Where is M873 based?
A:
M873 is operated from Dhaka, Bangladesh.

Q4 (EN): What are the main features of M873?
A:
M873 offers Modern Design with clean and intuitive interface, Secure Access with protected dashboard features, and Future Ready upcoming features in development.

Q5 (EN): How can I get started with M873?
A:
You can click the "Get Started" button on the homepage or navigate to the dashboard to explore the platform features.

Q6 (EN): Is M873 free to use?
A:
Yes, M873 is currently free to use for learning and development purposes.

Q7 (EN): What programming languages does M873 support?
A:
M873 supports multiple programming languages including JavaScript, TypeScript, Python, and more.

Q8 (EN): Can I deploy my projects on M873?
A:
M873 provides deployment capabilities for your AI projects and applications.

Q9 (EN): What is the goal of M873?
A:
The ultimate goal is to simplify daily operations and make life easier through intelligent automation and AI solutions.

Q10 (EN): How do I contact support?
A:
You can reach out through the contact information provided on the website or use this chatbot for assistance.`;

    const datasetParser = new DatasetParser(datasetContent);
    aiServiceRef.current = new AIService(datasetParser);
  }, []);

  const scrollContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isOpen && scrollContainerRef.current) {
      // Initial scroll
      scrollToBottom();

      // Observe changes in the container for various DOM updates
      const observer = new MutationObserver(() => {
        scrollToBottom();
      });

      observer.observe(scrollContainerRef.current, {
        childList: true,
        subtree: true,
        characterData: true
      });

      return () => observer.disconnect();
    }
  }, [isOpen, messages]); // Added messages dependency

  const scrollToBottom = () => {
    // requestAnimationFrame ensures the scroll happens AFTER the browser has finished layout
    requestAnimationFrame(() => {
      if (scrollContainerRef.current) {
        scrollContainerRef.current.scrollTo({
          top: scrollContainerRef.current.scrollHeight,
          behavior: 'auto'
        });
      }
      messagesEndRef.current?.scrollIntoView({ behavior: 'auto', block: 'end' });
    });
  };

  const handleSendMessage = async () => {
    if (!inputValue.trim() || !aiServiceRef.current) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      content: inputValue.trim(),
      isUser: true,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputValue('');
    setIsLoading(true);

    try {
      const response = await aiServiceRef.current.generateResponse(inputValue.trim());

      if (!response) {
        throw new Error('No response received from AI service');
      }

      const botMessage: Message = {
        id: (Date.now() + 1).toString(),
        content: response.content || "I'm sorry, I couldn't generate a response.",
        isUser: false,
        timestamp: new Date()
      };

      setMessages(prev => [...prev, botMessage]);
    } catch (error) {
      console.error('Error generating response:', error);
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        content: "I'm sorry, I encountered an error. Please try again.",
        isUser: false,
        timestamp: new Date()
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  return (
    <>
      {/* Floating Chat Button */}
      <Button
        onClick={() => setIsOpen(!isOpen)}
        className="fixed bottom-6 right-6 rounded-full w-14 h-14 shadow-lg z-50 bg-primary hover:bg-primary/90"
        size="icon"
      >
        {isOpen ? <X className="w-6 h-6" /> : <MessageCircle className="w-6 h-6" />}
      </Button>

      {/* Chat Window */}
      {isOpen && (
        <Card className="fixed bottom-24 right-6 w-80 h-96 shadow-xl z-50 flex flex-col overflow-hidden">
          <CardHeader className="py-3 px-4 border-b flex-shrink-0">
            <CardTitle className="text-sm font-semibold flex items-center gap-2">
              <MessageCircle className="w-4 h-4" />
              M873 Assistant
            </CardTitle>
          </CardHeader>

          <CardContent className="flex-1 min-h-0 p-0 flex flex-col overflow-hidden">
            {/* Messages */}
            <div
              ref={scrollContainerRef}
              className="flex-1 overflow-y-auto p-4 space-y-3 min-h-0"
            >
              {messages.map((message) => (
                <div
                  key={message.id}
                  className={`flex ${message.isUser ? 'justify-end' : 'justify-start'}`}
                >
                  {message.content && (
                    <div
                      className={`max-w-[85%] rounded-lg px-3 py-2 text-sm break-words ${message.isUser
                        ? 'bg-primary text-primary-foreground'
                        : 'bg-muted text-muted-foreground'
                        }`}
                    >
                      {message.content.split('\n').map((line, index) => (
                        <div key={index}>{line}</div>
                      ))}
                    </div>
                  )}
                </div>
              ))}
              {isLoading && (
                <div className="flex justify-start">
                  <div className="bg-muted text-muted-foreground rounded-lg px-3 py-2 text-sm">
                    Thinking...
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Input */}
            <div className="border-t p-3">
              <div className="flex gap-2">
                <Input
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder="Ask about M873..."
                  className="flex-1 text-sm"
                  disabled={isLoading}
                />
                <Button
                  onClick={handleSendMessage}
                  size="icon"
                  className="w-8 h-8"
                  disabled={isLoading || !inputValue.trim()}
                >
                  <Send className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </>
  );
};

export default ChatBot;
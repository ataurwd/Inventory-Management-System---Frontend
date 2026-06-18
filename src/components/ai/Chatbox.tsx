"use client";

import React, { useState, useRef, useEffect } from 'react';
import { Card, CardHeader, CardContent, CardFooter } from '../ui/card';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Bot, MessageSquare, X, Send, Loader2, MinusCircle, User } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import api from '../../services/api';

import { cn } from '@/lib/utils';

interface Message {
  role: 'user' | 'assistant' | 'system';
  content: string;
}
interface ChatboxProps {
  inline?: boolean;
}

export function Chatbox({ inline = false }: ChatboxProps) {
  const { user } = useAuth();
  const [isOpen, setIsOpen] = useState(inline ? true : false);
  const [messages, setMessages] = useState<Message[]>([
    { role: 'system', content: 'Hello! I am SmartStock AI. How can I help you manage inventory today?' }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isOpen]);

  // Only render for admins
  if (user?.role !== 'admin') {
    return null;
  }

  const handleSend = async () => {
    if (!input.trim()) return;

    const userMessage = input.trim();
    setInput('');
    const newMessages: Message[] = [...messages, { role: 'user', content: userMessage }];
    setMessages(newMessages);
    setIsLoading(true);

    try {
      const response = await api.post('/chat', { messages: newMessages });
      setMessages(response.data.data.messages);
    } catch (error) {
      console.error('Chat error:', error);
      setMessages([
        ...newMessages,
        { role: 'assistant', content: 'Sorry, I encountered an error. Please try again or check your API key.' }
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  if (!isOpen && !inline) {
    return (
      <div className="fixed bottom-6 right-6 z-50 flex items-center gap-3 animate-in fade-in slide-in-from-bottom-5">
        <div className="bg-background border shadow-md px-3 py-1.5 rounded-full text-sm font-medium text-foreground flex items-center gap-2">
          Ask AI Assistant
          <div className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-primary"></span>
          </div>
        </div>
        <Button
          onClick={() => setIsOpen(true)}
          className="h-14 w-14 rounded-full shadow-xl bg-primary hover:bg-primary/90 text-primary-foreground transition-transform hover:scale-105"
          size="icon"
        >
          <MessageSquare className="h-6 w-6" />
        </Button>
      </div>
    );
  }

  const containerClasses = inline 
    ? "w-full h-full flex flex-col shadow-sm border" 
    : "fixed bottom-6 right-6 w-[350px] sm:w-[400px] h-[550px] max-h-[80vh] flex flex-col shadow-2xl z-50 border-primary/20 animate-in slide-in-from-bottom-5";

  return (
    <Card className={containerClasses}>
      <CardHeader className="p-4 border-b bg-primary/5 flex flex-row items-center justify-between space-y-0">
        <div className="flex items-center space-x-2">
          <Bot className="h-5 w-5 text-primary" />
          <h3 className="font-semibold text-primary">SmartStock AI</h3>
        </div>
        <div className="flex items-center space-x-1">
          <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full" onClick={() => setMessages([{ role: 'system', content: 'Hello! I am SmartStock AI. How can I help you manage inventory today?' }])}>
            <MinusCircle className="h-4 w-4 text-muted-foreground" />
          </Button>
          {!inline && (
            <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full" onClick={() => setIsOpen(false)}>
              <X className="h-4 w-4 text-muted-foreground" />
            </Button>
          )}
        </div>
      </CardHeader>
      
      <CardContent className="flex-1 p-0 overflow-hidden flex flex-col relative">
        <div className="flex-1 p-4 overflow-y-auto" ref={scrollRef}>
          <div className="space-y-4">
            {messages.map((msg, idx) => (
              <div 
                key={idx} 
                className={cn(
                  "flex items-start gap-2 text-sm",
                  msg.role === 'user' ? "flex-row-reverse" : "flex-row"
                )}
              >
                <div className={cn(
                  "h-8 w-8 rounded-full flex items-center justify-center shrink-0",
                  msg.role === 'user' ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"
                )}>
                  {msg.role === 'user' ? <User className="h-4 w-4" /> : <Bot className="h-4 w-4" />}
                </div>
                <div className={cn(
                  "rounded-lg px-3 py-2 max-w-[80%]",
                  msg.role === 'user' ? "bg-primary text-primary-foreground" : "bg-muted"
                )}>
                  <p className="whitespace-pre-wrap">{msg.content}</p>
                </div>
              </div>
            ))}
            {isLoading && (
              <div className="flex items-start gap-2 text-sm">
                <div className="h-8 w-8 rounded-full bg-muted flex items-center justify-center shrink-0">
                  <Bot className="h-4 w-4 text-muted-foreground" />
                </div>
                <div className="rounded-lg px-3 py-2 bg-muted flex items-center">
                  <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
                </div>
              </div>
            )}
          </div>
        </div>
      </CardContent>

      <CardFooter className="p-3 border-t bg-background">
        <div className="flex w-full items-center space-x-2">
          <Input 
            value={input} 
            onChange={e => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Ask about stock or add products..." 
            className="flex-1"
            disabled={isLoading}
          />
          <Button size="icon" onClick={handleSend} disabled={!input.trim() || isLoading}>
            <Send className="h-4 w-4" />
          </Button>
        </div>
      </CardFooter>
    </Card>
  );
}

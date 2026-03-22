"use client";

import { Message, Chat } from '@/types/chat';
import MessageBubble from './MessageBubble';
import ChatInput from './ChatInput';
import { useEffect, useRef } from 'react';
import { Bot, Sparkles } from 'lucide-react';

interface ChatWindowProps {
    chat: Chat | null;
    onSendMessage: (message: string) => void;
    onStopGeneration: () => void;
    isLoading: boolean;
}

export default function ChatWindow({ chat, onSendMessage, onStopGeneration, isLoading }: ChatWindowProps) {
    const scrollRef = useRef<HTMLDivElement>(null);

    // Auto-scroll logic optimized for streaming
    useEffect(() => {
        if (scrollRef.current) {
            const isScrolledToBottom = scrollRef.current.scrollHeight - scrollRef.current.clientHeight <= scrollRef.current.scrollTop + 100;

            if (isScrolledToBottom || isLoading) {
                scrollRef.current.scrollTo({
                    top: scrollRef.current.scrollHeight,
                    behavior: 'smooth'
                });
            }
        }
    }, [chat?.messages, isLoading, chat?.messages[chat?.messages.length - 1]?.content]);

    if (!chat) {
        return (
            <div className="flex-1 flex flex-col items-center justify-center p-8 bg-zinc-950 text-center">
                <div className="mb-6 p-4 bg-blue-600/10 rounded-2xl ring-1 ring-blue-500/20">
                    <Bot size={48} className="text-blue-500" />
                </div>
                <h2 className="text-2xl font-bold text-zinc-100 mb-2">Welcome to Fintech AI</h2>
                <p className="text-zinc-500 max-w-md mx-auto mb-8">
                    Your intelligent assistant for banking, financial advice, and technical support. Start a new conversation to begin.
                </p>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-2xl w-full">
                    {[
                        "How do I open a savings account?",
                        "Explain blockchain in banking",
                        "What is a good credit score?",
                        "Help me write a business plan"
                    ].map((suggestion) => (
                        <button
                            key={suggestion}
                            onClick={() => onSendMessage(suggestion)}
                            className="p-4 bg-zinc-900/50 hover:bg-zinc-900 border border-zinc-800 rounded-xl text-left text-sm text-zinc-400 hover:text-zinc-200 transition-all flex items-center gap-3 group"
                        >
                            <Sparkles size={14} className="text-blue-500 group-hover:scale-110 transition-transform" />
                            {suggestion}
                        </button>
                    ))}
                </div>
            </div>
        );
    }

    return (
        <div className="flex-1 flex flex-col h-screen bg-zinc-950 relative overflow-hidden">
            {/* Messages Header */}
            <header className="fixed top-0 right-0 left-0 lg:left-72 z-30 h-14 bg-zinc-950/80 backdrop-blur-md border-b border-zinc-900 flex items-center px-6">
                <div className="flex items-center gap-3">
                    <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                    <h1 className="text-sm font-semibold text-zinc-200 truncate">{chat.title}</h1>
                </div>
            </header>

            {/* Chat Area */}
            <div
                ref={scrollRef}
                className="flex-1 overflow-y-auto chat-scroll pt-20 pb-32"
            >
                <div className="max-w-4xl mx-auto divide-y divide-zinc-900/50">
                    {chat.messages.map((msg) => (
                        <MessageBubble key={msg.id} message={msg} />
                    ))}

                    {isLoading && (
                        <div className="flex gap-4 p-6 bg-zinc-900/40">
                            <div className="flex-shrink-0 mt-1">
                                <div className="w-8 h-8 rounded-lg bg-blue-600/10 text-blue-400 flex items-center justify-center ring-1 ring-zinc-800">
                                    <Bot size={18} />
                                </div>
                            </div>
                            <div className="flex items-center gap-1.5 p-3 rounded-2xl bg-zinc-800/50 border border-zinc-700">
                                <div className="w-1.5 h-1.5 bg-blue-500 rounded-full animate-[bounce_1s_infinite_0ms]" />
                                <div className="w-1.5 h-1.5 bg-blue-500 rounded-full animate-[bounce_1s_infinite_200ms]" />
                                <div className="w-1.5 h-1.5 bg-blue-500 rounded-full animate-[bounce_1s_infinite_400ms]" />
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* Input UI */}
            <div className="absolute bottom-0 left-0 right-0">
                <ChatInput
                    onSend={onSendMessage}
                    onStop={onStopGeneration}
                    isLoading={isLoading}
                />
            </div>
        </div>
    );
}

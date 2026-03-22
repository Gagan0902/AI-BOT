"use client";

import { useState, useRef, useEffect } from 'react';
import { Send, ArrowDown } from 'lucide-react';

interface ChatInputProps {
    onSend: (message: string) => void;
    onStop: () => void;
    isLoading: boolean;
}

export default function ChatInput({ onSend, onStop, isLoading }: ChatInputProps) {
    const [input, setInput] = useState('');
    const textareaRef = useRef<HTMLTextAreaElement>(null);

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSubmit();
        }
    };

    const handleSubmit = () => {
        if (input.trim() && !isLoading) {
            onSend(input);
            setInput('');
            if (textareaRef.current) {
                textareaRef.current.style.height = 'auto';
            }
        }
    };

    useEffect(() => {
        if (textareaRef.current) {
            textareaRef.current.style.height = 'auto';
            textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
        }
    }, [input]);

    return (
        <div className="p-4 bg-gradient-to-t from-zinc-950 via-zinc-950 to-transparent">
            <div className="max-w-3xl mx-auto relative group">
                <textarea
                    ref={textareaRef}
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyDown={handleKeyDown}
                    placeholder="Ask something about banking or tech..."
                    rows={1}
                    className="w-full p-4 pr-24 bg-zinc-900 border border-zinc-800 rounded-2xl resize-none text-sm text-zinc-200 focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all chat-scroll"
                    style={{ maxHeight: '200px' }}
                />

                <div className="absolute right-3 bottom-3 flex gap-2">
                    {isLoading ? (
                        <button
                            onClick={onStop}
                            className="p-2 bg-zinc-800 text-zinc-400 rounded-xl hover:bg-zinc-700 hover:text-red-400 transition-all shadow-lg ring-1 ring-zinc-700"
                        >
                            <div className="w-4 h-4 bg-current rounded-sm" />
                        </button>
                    ) : (
                        <button
                            onClick={handleSubmit}
                            disabled={!input.trim()}
                            className="p-2 bg-blue-600 text-white rounded-xl disabled:opacity-30 disabled:cursor-not-allowed hover:bg-blue-500 transition-all shadow-lg shadow-blue-900/20"
                        >
                            <Send size={18} />
                        </button>
                    )}
                </div>

                {!isLoading && input.length > 100 && (
                    <div className="absolute -top-10 left-1/2 -translate-x-1/2 px-3 py-1 bg-zinc-800 border border-zinc-700 rounded-full text-[10px] text-zinc-400 animate-bounce">
                        Press Shift + Enter for new line
                    </div>
                )}
            </div>
            <p className="mt-2 text-center text-[10px] text-zinc-600">
                AI can make mistakes. Check important info.
            </p>
        </div>
    );
}

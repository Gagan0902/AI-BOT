"use client";

import { cn } from '@/lib/utils';
import { Message } from '@/types/chat';
import { User, Bot } from 'lucide-react';
import { motion } from 'framer-motion';

import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism';

interface MessageBubbleProps {
    message: Message;
}

export default function MessageBubble({ message }: MessageBubbleProps) {
    const isAssistant = message.role === 'assistant';

    return (
        <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className={cn(
                "flex gap-4 p-6 transition-colors group",
                isAssistant ? "bg-zinc-900/40" : "bg-transparent"
            )}
        >
            <div className="flex-shrink-0 mt-1">
                <div className={cn(
                    "w-8 h-8 rounded-lg flex items-center justify-center ring-1 ring-zinc-800 transition-all",
                    isAssistant ? "bg-blue-600/10 text-blue-400 group-hover:scale-110" : "bg-zinc-800 text-zinc-400"
                )}>
                    {isAssistant ? <Bot size={18} /> : <User size={18} />}
                </div>
            </div>

            <div className="flex-1 space-y-2 min-w-0">
                <div className="flex items-center gap-2">
                    <span className="text-sm font-bold text-zinc-200">
                        {isAssistant ? "AI Assistant" : "You"}
                    </span>
                    <span className="text-[10px] text-zinc-500 font-medium">
                        {new Date(message.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                </div>

                <div className="text-zinc-300 text-sm leading-relaxed prose prose-invert max-w-none prose-p:leading-relaxed prose-pre:p-0 prose-pre:bg-transparent">
                    {isAssistant ? (
                        <ReactMarkdown
                            remarkPlugins={[remarkGfm]}
                            components={{
                                code({ node, inline, className, children, ...props }: any) {
                                    const match = /language-(\w+)/.exec(className || '');
                                    return !inline && match ? (
                                        <div className="rounded-xl overflow-hidden my-4 ring-1 ring-zinc-800 bg-zinc-950">
                                            <div className="flex items-center justify-between px-4 py-2 bg-zinc-900 border-b border-zinc-800">
                                                <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">{match[1]}</span>
                                                <button className="text-[10px] text-zinc-500 hover:text-blue-400 font-bold transition-colors">COPY</button>
                                            </div>
                                            <SyntaxHighlighter
                                                {...props}
                                                style={vscDarkPlus}
                                                language={match[1]}
                                                PreTag="div"
                                                customStyle={{
                                                    margin: 0,
                                                    padding: '1.5rem',
                                                    backgroundColor: 'transparent',
                                                    fontSize: '13px',
                                                }}
                                            >
                                                {String(children).replace(/\n$/, '')}
                                            </SyntaxHighlighter>
                                        </div>
                                    ) : (
                                        <code {...props} className={cn("bg-zinc-800 px-1.5 py-0.5 rounded text-zinc-200 font-mono text-[13px]", className)}>
                                            {children}
                                        </code>
                                    );
                                },
                            }}
                        >
                            {message.content}
                        </ReactMarkdown>
                    ) : (
                        <div className="whitespace-pre-wrap break-words">
                            {message.content}
                        </div>
                    )}
                </div>
            </div>
        </motion.div>
    );
}

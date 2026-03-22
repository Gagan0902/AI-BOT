"use client";

import { useState } from 'react';
import { Plus, MessageSquare, Trash2, Menu, X } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Chat } from '@/types/chat';

interface SidebarProps {
    chats: Chat[];
    activeChatId: string | null;
    onNewChat: () => void;
    onSelectChat: (id: string) => void;
    onDeleteChat: (id: string) => void;
}

export default function Sidebar({
    chats,
    activeChatId,
    onNewChat,
    onSelectChat,
    onDeleteChat,
}: SidebarProps) {
    const [isOpen, setIsOpen] = useState(true);

    return (
        <>
            {/* Mobile Toggle */}
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="fixed top-4 left-4 z-50 p-2 lg:hidden bg-zinc-900 rounded-md border border-zinc-800"
            >
                {isOpen ? <X size={20} /> : <Menu size={20} />}
            </button>

            {/* Sidebar Container */}
            <aside
                className={cn(
                    "fixed inset-y-0 left-0 z-40 w-72 bg-zinc-950 border-r border-zinc-800 transition-transform duration-300 lg:static lg:translate-x-0",
                    !isOpen && "-translate-x-full"
                )}
            >
                <div className="flex flex-col h-full p-4">
                    {/* New Chat Button */}
                    <button
                        onClick={onNewChat}
                        className="flex items-center gap-2 w-full p-3 mb-6 bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 rounded-lg transition-colors group"
                    >
                        <Plus size={18} className="text-zinc-400 group-hover:text-white" />
                        <span className="text-sm font-medium text-zinc-300 group-hover:text-white">New Chat</span>
                    </button>

                    {/* Chat History */}
                    <div className="flex-1 overflow-y-auto chat-scroll space-y-2">
                        <h3 className="px-3 text-xs font-semibold text-zinc-500 uppercase tracking-wider mb-2">History</h3>
                        {chats.length === 0 ? (
                            <p className="px-3 text-sm text-zinc-600 italic">No recent chats</p>
                        ) : (
                            chats.map((chat) => (
                                <div
                                    key={chat.id}
                                    className={cn(
                                        "group flex items-center justify-between p-3 rounded-lg cursor-pointer transition-all",
                                        activeChatId === chat.id
                                            ? "bg-zinc-800 border border-zinc-700"
                                            : "hover:bg-zinc-900/50 border border-transparent"
                                    )}
                                    onClick={() => onSelectChat(chat.id)}
                                >
                                    <div className="flex items-center gap-3 overflow-hidden">
                                        <MessageSquare size={16} className={cn(
                                            activeChatId === chat.id ? "text-blue-400" : "text-zinc-500"
                                        )} />
                                        <span className="text-sm text-zinc-300 truncate">{chat.title}</span>
                                    </div>
                                    <button
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            onDeleteChat(chat.id);
                                        }}
                                        className="opacity-0 group-hover:opacity-100 p-1 hover:text-red-400 text-zinc-500 transition-opacity"
                                    >
                                        <Trash2 size={14} />
                                    </button>
                                </div>
                            ))
                        )}
                    </div>

                    {/* Branding/Footer */}
                    <div className="mt-auto pt-4 border-t border-zinc-900">
                        <div className="p-3 glass rounded-xl flex items-center gap-3">
                            <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-blue-600 to-emerald-500 flex items-center justify-center font-bold text-xs ring-2 ring-blue-500/20">
                                AI
                            </div>
                            <div>
                                <p className="text-sm font-semibold text-zinc-200">Fintech Assistant</p>
                                <p className="text-[10px] text-zinc-500">Qwen 2.5</p>
                            </div>
                        </div>
                    </div>
                </div>
            </aside>
        </>
    );
}

"use client";

import { useState, useEffect } from 'react';
import { Chat, Message } from '@/types/chat';

export function useChat() {
    const [chats, setChats] = useState<Chat[]>([]);
    const [activeChatId, setActiveChatId] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [abortController, setAbortController] = useState<AbortController | null>(null);

    // Load chats from localStorage on mount
    useEffect(() => {
        const savedChats = localStorage.getItem('ai-chatbot-chats');
        if (savedChats) {
            try {
                setChats(JSON.parse(savedChats));
            } catch (e) {
                console.error('Failed to parse chats from localStorage');
            }
        }
    }, []);

    // Save chats to localStorage whenever they change
    useEffect(() => {
        if (chats.length > 0) {
            localStorage.setItem('ai-chatbot-chats', JSON.stringify(chats));
        }
    }, [chats]);

    const activeChat = chats.find((c: Chat) => c.id === activeChatId) || null;

    const createNewChat = () => {
        const newChat: Chat = {
            id: Date.now().toString(),
            title: 'New Conversation',
            messages: [],
            updatedAt: Date.now(),
        };
        setChats([newChat, ...chats]);
        setActiveChatId(newChat.id);
    };

    const deleteChat = (id: string) => {
        setChats(chats.filter((c: Chat) => c.id !== id));
        if (activeChatId === id) {
            setActiveChatId(null);
        }
    };

    const stopGeneration = () => {
        if (abortController) {
            abortController.abort();
            setAbortController(null);
            setIsLoading(false);
        }
    };

    const sendMessage = async (content: string) => {
        if (!content.trim() || isLoading) return;

        const controller = new AbortController();
        setAbortController(controller);

        let currentChatId = activeChatId;
        let currentChats = [...chats];

        // If no active chat, create one
        if (!currentChatId) {
            const newChat: Chat = {
                id: Date.now().toString(),
                title: content.slice(0, 30) + (content.length > 30 ? '...' : ''),
                messages: [],
                updatedAt: Date.now(),
            };
            currentChats = [newChat, ...currentChats];
            setChats(currentChats);
            setActiveChatId(newChat.id);
            currentChatId = newChat.id;
        }

        const userMessage: Message = {
            id: Date.now().toString(),
            role: 'user',
            content,
            timestamp: Date.now(),
        };

        // Update frontend state with user message
        const updatedChats = currentChats.map((c: Chat) => {
            if (c.id === currentChatId) {
                return {
                    ...c,
                    messages: [...c.messages, userMessage],
                    title: c.messages.length === 0 ? content.slice(0, 30) + (content.length > 30 ? '...' : '') : c.title,
                    updatedAt: Date.now(),
                };
            }
            return c;
        });

        setChats(updatedChats);
        setIsLoading(true);

        try {
            const activeChatNow = updatedChats.find((c: Chat) => c.id === currentChatId)!;

            const response = await fetch('/api/chat', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ messages: activeChatNow.messages }),
                signal: controller.signal,
            }).catch(err => {
                if (err.name === 'TypeError' && err.message === 'Failed to fetch') {
                    throw new Error('Connection failed. Please check if the server is running and your internet connection is stable.');
                }
                throw err;
            });

            if (!response.ok) {
                let errorDetail = 'Failed to fetch AI response';
                try {
                    const errorData = await response.json();
                    errorDetail = errorData.error || errorDetail;
                } catch (e) {
                    console.error('Could not parse error response');
                }
                throw new Error(errorDetail);
            }

            const reader = response.body?.getReader();
            if (!reader) throw new Error('Response stream is not available');

            const decoder = new TextDecoder();
            let assistantContent = '';
            const assistantMessageId = (Date.now() + 1).toString();

            // Add an empty assistant message first
            setChats((prev: Chat[]) =>
                prev.map((c: Chat) =>
                    c.id === currentChatId
                        ? {
                            ...c,
                            messages: [
                                ...c.messages,
                                {
                                    id: assistantMessageId,
                                    role: 'assistant',
                                    content: '',
                                    timestamp: Date.now(),
                                }
                            ],
                            updatedAt: Date.now()
                        }
                        : c
                )
            );

            while (true) {
                const { done, value } = await reader.read().catch(err => {
                    console.error('Stream read error:', err);
                    throw new Error('The connection was interrupted while receiving the AI response.');
                });
                
                if (done) break;

                const chunk = decoder.decode(value, { stream: true });
                assistantContent += chunk;

                // Update the last message content
                setChats((prev: Chat[]) =>
                    prev.map((c: Chat) =>
                        c.id === currentChatId
                            ? {
                                ...c,
                                messages: c.messages.map((m: Message) =>
                                    m.id === assistantMessageId ? { ...m, content: assistantContent } : m
                                )
                            }
                            : c
                    )
                );
            }
        } catch (error: any) {
            if (error.name === 'AbortError') {
                console.log('Chat generation stopped by user');
            } else {
                console.error('Chat implementation error:', error);

                const errorMessage: Message = {
                    id: (Date.now() + 2).toString(),
                    role: 'system',
                    content: `Error: ${error.message}`,
                    timestamp: Date.now(),
                };

                setChats((prev: Chat[]) =>
                    prev.map((c: Chat) =>
                        c.id === currentChatId
                            ? { ...c, messages: [...c.messages, errorMessage], updatedAt: Date.now() }
                            : c
                    )
                );
            }
        } finally {
            setIsLoading(false);
            setAbortController(null);
        }
    };

    return {
        chats,
        activeChat,
        activeChatId,
        isLoading,
        createNewChat,
        deleteChat,
        sendMessage,
        stopGeneration,
        selectChat: setActiveChatId,
    };
}

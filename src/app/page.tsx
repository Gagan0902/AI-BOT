"use client";

import Sidebar from "@/components/Sidebar";
import ChatWindow from "@/components/ChatWindow";
import { useChat } from "@/hooks/useChat";

export default function Home() {
  const {
    chats,
    activeChat,
    activeChatId,
    isLoading,
    createNewChat,
    deleteChat,
    sendMessage,
    stopGeneration,
    selectChat
  } = useChat();

  return (
    <main className="flex h-screen bg-zinc-950 overflow-hidden">
      <Sidebar
        chats={chats}
        activeChatId={activeChatId}
        onNewChat={createNewChat}
        onSelectChat={selectChat}
        onDeleteChat={deleteChat}
      />
      <ChatWindow
        chat={activeChat}
        onSendMessage={sendMessage}
        onStopGeneration={stopGeneration}
        isLoading={isLoading}
      />
    </main>
  );
}

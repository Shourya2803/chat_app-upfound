import { useState } from "react";
import SidebarNav from "./SidebarNav";
import TopHeader from "./TopHeader";
import ChatCard from "./ChatCard";
import ThreadList from "./ThreadList";
import type { Id } from "../../convex/_generated/dataModel";

export default function ChatLayout({
    currentUser,
    onLogout
}: {
    currentUser: { id: Id<"users">; name: string };
    onLogout: () => void
}) {
    const [selectedUserId, setSelectedUserId] = useState<string | null>(null);
    const [globalSearch, setGlobalSearch] = useState("");

    return (
        <div className="flex h-screen bg-bg-light text-foreground overflow-hidden font-sans">
            {/* Left Sidebar Navigation */}
            <SidebarNav />

            {/* Main Content Area */}
            <div className="flex-1 flex flex-col relative overflow-hidden">
                {/* Top Header */}
                <TopHeader
                    userName={currentUser.name}
                    onLogout={onLogout}
                    onSearch={(val: string) => setGlobalSearch(val)}
                />

                {/* Horizontal Split for Chat and Threads */}
                <div className="flex-1 flex overflow-hidden">
                    {/* Central Chat Window */}
                    <div className="flex-1 flex flex-col min-w-0">
                        {selectedUserId ? (
                            <ChatCard
                                currentUserId={currentUser.id as Id<"users">}
                                otherUserId={selectedUserId as Id<"users">}
                            />
                        ) : (
                            <div className="flex-1 flex flex-col items-center justify-center text-gray-400 p-8 text-center bg-bg-light">
                                <div className="w-24 h-24 rounded-full bg-white shadow-sm flex items-center justify-center mb-6">
                                    <svg className="w-12 h-12 text-gray-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                                    </svg>
                                </div>
                                <h2 className="text-2xl font-bold text-gray-600">Your conversation starts here</h2>
                                <p className="max-w-sm mt-3 text-lg">Pick someone from your connections on the right to start messaging.</p>
                                <button className="mt-8 px-8 py-3 bg-primary text-white rounded-full font-bold hover:bg-primary-hover transition-all shadow-lg shadow-primary/20">
                                    Start a New Chat
                                </button>
                            </div>
                        )}
                    </div>

                    {/* Right Threads List Panel */}
                    <div className="w-96 flex-shrink-0">
                        <ThreadList
                            currentUserId={currentUser.id as Id<"users">}
                            selectedUserId={selectedUserId}
                            onSelectUser={setSelectedUserId}
                            externalSearch={globalSearch}
                        />
                    </div>
                </div>
            </div>
        </div>
    );
}


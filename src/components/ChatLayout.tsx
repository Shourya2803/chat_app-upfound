import { useState } from "react";
import SidebarNav from "./SidebarNav";
import TopHeader from "./TopHeader";
import ChatCard from "./ChatCard";
import ThreadList from "./ThreadList";
import type { Id } from "../../convex/_generated/dataModel";
import { useAllUsers } from "../hooks/useUsers";
import { useNotifications } from "../hooks/useNotifications";

export default function ChatLayout({
    currentUser,
    onLogout
}: {
    currentUser: { id: Id<"users">; name: string };
    onLogout: () => void
}) {
    const [selectedUserId, setSelectedUserId] = useState<string | null>(null);
    const [globalSearch, setGlobalSearch] = useState("");
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);

    const { users } = useAllUsers(currentUser.id as Id<"users">);
    useNotifications(users);

    const handleSelectUser = (id: string) => {
        setSelectedUserId(id);
    };

    const handleBack = () => {
        setSelectedUserId(null);
    };

    return (
        <div className="flex h-screen bg-bg-light text-foreground overflow-hidden font-sans relative">
            {/* Left Sidebar Navigation - Responsive */}
            <SidebarNav
                isOpen={isSidebarOpen}
                onClose={() => setIsSidebarOpen(false)}
            />

            {/* Main Content Area */}
            <div className="flex-1 flex flex-col relative overflow-hidden">
                {/* Top Header */}
                <TopHeader
                    userName={currentUser.name}
                    onLogout={onLogout}
                    onSearch={(val: string) => setGlobalSearch(val)}
                    onMenuToggle={() => setIsSidebarOpen(true)}
                />

                {/* Horizontal Split for Chat and Threads */}
                <div className="flex-1 flex overflow-hidden relative">
                    {/* 
                        Mobile Logic: 
                        If a user is selected, show ChatCard.
                        Otherwise, show ThreadList.
                        On Desktop: Show both side-by-side.
                    */}

                    {/* Central Chat Window */}
                    <div className={`
                        flex-1 flex flex-col min-w-0 transition-all duration-300
                        ${selectedUserId ? "translate-x-0" : "translate-x-full lg:translate-x-0 absolute inset-0 lg:relative"}
                        ${!selectedUserId ? "hidden lg:flex" : "flex"}
                        bg-bg-light z-10
                    `}>
                        {selectedUserId ? (
                            <ChatCard
                                currentUserId={currentUser.id as Id<"users">}
                                otherUserId={selectedUserId as Id<"users">}
                                onBack={handleBack}
                            />
                        ) : (
                            <div className="flex-1 flex flex-col items-center justify-center text-gray-400 p-8 text-center bg-bg-light">
                                <div className="w-16 h-16 lg:w-24 lg:h-24 rounded-full bg-white shadow-sm flex items-center justify-center mb-6">
                                    <svg className="w-8 h-8 lg:w-12 lg:h-12 text-gray-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                                    </svg>
                                </div>
                                <h2 className="text-xl lg:text-2xl font-bold text-gray-600">Your conversation starts here</h2>
                                <p className="max-w-sm mt-3 text-base lg:text-lg">Pick someone from your connections to start messaging.</p>
                                <button className="mt-8 px-6 lg:px-8 py-3 bg-primary text-white rounded-full font-bold hover:bg-primary-hover transition-all shadow-lg shadow-primary/20">
                                    Start a New Chat
                                </button>
                            </div>
                        )}
                    </div>

                    {/* Right Threads List Panel */}
                    <div className={`
                        w-full lg:w-96 flex-shrink-0 transition-all duration-300
                        ${selectedUserId ? "hidden lg:block" : "block"}
                    `}>
                        <ThreadList
                            currentUserId={currentUser.id as Id<"users">}
                            selectedUserId={selectedUserId}
                            onSelectUser={handleSelectUser}
                            externalSearch={globalSearch}
                        />
                    </div>
                </div>
            </div>
        </div>
    );
}

import { useRef, useEffect, useState } from "react";
import { useUser } from "../hooks/useUsers";
import { useChat } from "../hooks/useChat";
import { useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";
import type { Id } from "../../convex/_generated/dataModel";
import { Send, Smile, Paperclip, MoreHorizontal, CheckCircle2, Search, X, MessageSquare, Calendar } from "lucide-react";

export default function ChatCard({
    currentUserId,
    otherUserId
}: {
    currentUserId: Id<"users">;
    otherUserId: Id<"users">;
}) {
    const [content, setContent] = useState("");
    const [searchQuery, setSearchQuery] = useState("");
    const [isSearching, setIsSearching] = useState(false);
    const scrollRef = useRef<HTMLDivElement>(null);

    const { user: otherUser } = useUser(otherUserId);
    const {
        messages,
        sendMessage,
        sendTyping,
        otherUserTyping,
        chatId
    } = useChat(currentUserId, otherUserId);

    const searchResults = useQuery(api.messages.search,
        chatId && isSearching && searchQuery.length > 2
            ? { chatId, query: searchQuery }
            : "skip"
    );

    useEffect(() => {
        if (scrollRef.current && !isSearching) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
    }, [messages, isSearching]);

    const handleSend = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!content.trim() || !chatId) return;

        await sendMessage(content.trim());
        setContent("");
    };

    const handleKeyPress = () => {
        sendTyping();
    };

    return (
        <div className="flex-1 flex flex-col p-8 overflow-hidden items-center">
            <div className="w-full max-w-4xl h-full bg-white rounded-[2rem] shadow-xl shadow-gray-200/50 flex flex-col overflow-hidden border border-gray-100">
                {/* Chat Header */}
                <div className="px-8 py-5 border-b border-gray-100 bg-white flex items-center justify-between min-h-[90px]">
                    {!isSearching ? (
                        <>
                            <div className="flex items-center gap-4">
                                <div className="relative">
                                    <div className="w-14 h-14 rounded-full bg-gray-200 border-2 border-white shadow-sm flex items-center justify-center font-bold text-xl text-gray-700">
                                        {otherUser?.name?.[0].toUpperCase() || "?"}
                                    </div>
                                    {otherUser?.online && (
                                        <span className="absolute bottom-0 right-0 w-3.5 h-3.5 bg-emerald-500 border-2 border-white rounded-full"></span>
                                    )}
                                </div>
                                <div>
                                    <div className="flex items-center gap-1.5">
                                        <h2 className="text-lg font-bold text-gray-900">{otherUser?.name || "Loading..."}</h2>
                                        <CheckCircle2 size={16} className="text-blue-500 fill-blue-500/10" />
                                    </div>
                                    <p className="text-sm text-gray-400">
                                        {otherUser?.online ? "Online" : "Offline"} · Last seen 1 min ago
                                    </p>
                                </div>
                            </div>
                            <div className="flex items-center gap-2">
                                <button
                                    onClick={() => setIsSearching(true)}
                                    className="p-2 text-gray-400 hover:text-primary hover:bg-gray-50 rounded-full transition-all"
                                >
                                    <Search size={22} />
                                </button>
                                <button className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-50 rounded-full transition-all">
                                    <MoreHorizontal size={24} />
                                </button>
                            </div>
                        </>
                    ) : (
                        <div className="flex-1 flex items-center gap-4 animate-in fade-in slide-in-from-right-4 duration-300">
                            <div className="relative flex-1">
                                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-primary" size={20} />
                                <input
                                    type="text"
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    placeholder="Search messages..."
                                    className="w-full bg-gray-50 border-2 border-primary/10 rounded-2xl pl-12 pr-10 py-3 text-base focus:outline-none focus:border-primary/30 transition-all font-medium"
                                    autoFocus
                                />
                                {searchQuery && (
                                    <button
                                        onClick={() => setSearchQuery("")}
                                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                                    >
                                        <X size={18} />
                                    </button>
                                )}
                            </div>
                            <button
                                onClick={() => {
                                    setIsSearching(false);
                                    setSearchQuery("");
                                }}
                                className="px-5 py-3 text-sm font-bold text-gray-500 hover:text-primary transition-colors"
                            >
                                Cancel
                            </button>
                        </div>
                    )}
                </div>

                {/* Messages Area / Search Results */}
                <div
                    ref={scrollRef}
                    className="flex-1 overflow-y-auto p-10 space-y-8 scroll-smooth"
                >
                    {isSearching && searchQuery.length > 2 ? (
                        <div className="space-y-6">
                            <div className="flex items-center gap-2 text-gray-400 mb-2">
                                <Search size={16} />
                                <span className="text-sm font-semibold uppercase tracking-wider">Search Results</span>
                            </div>
                            {!searchResults ? (
                                <div className="flex justify-center py-10">
                                    <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-primary"></div>
                                </div>
                            ) : searchResults.length === 0 ? (
                                <div className="text-center py-10 text-gray-400">
                                    <p>No messages found matching "{searchQuery}"</p>
                                </div>
                            ) : (
                                searchResults.map((msg) => (
                                    <div key={msg._id} className="group bg-gray-50 hover:bg-[#FDF6F0] rounded-2xl p-5 border border-gray-100 transition-all cursor-pointer">
                                        <div className="flex items-center justify-between mb-2">
                                            <span className={`text-xs font-bold px-2 py-1 rounded-md ${msg.senderId === currentUserId ? "bg-primary/10 text-primary" : "bg-gray-200 text-gray-600"}`}>
                                                {msg.senderId === currentUserId ? "You" : otherUser?.name}
                                            </span>
                                            <span className="text-[10px] text-gray-400 flex items-center gap-1 font-medium">
                                                <Calendar size={10} />
                                                {new Date(msg.createdAt).toLocaleDateString([], { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                                            </span>
                                        </div>
                                        <p className="text-gray-800 leading-relaxed font-medium">
                                            {/* Simple highligting logic */}
                                            {msg.content.split(new RegExp(`(${searchQuery})`, 'gi')).map((part, i) =>
                                                part.toLowerCase() === searchQuery.toLowerCase()
                                                    ? <mark key={i} className="bg-primary/20 text-primary p-0 rounded-sm">{part}</mark>
                                                    : part
                                            )}
                                        </p>
                                    </div>
                                ))
                            )}
                        </div>
                    ) : isSearching ? (
                        <div className="flex flex-col items-center justify-center h-full text-gray-300 py-10 opacity-60">
                            <Search size={64} strokeWidth={1} className="mb-4" />
                            <p className="text-lg font-medium">Type at least 3 characters to search</p>
                        </div>
                    ) : (
                        // Standard Message View
                        !messages ? (
                            <div className="flex justify-center py-10">
                                <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-primary"></div>
                            </div>
                        ) : messages.length === 0 ? (
                            <div className="flex flex-col items-center justify-center h-full text-gray-300 py-10 opacity-60">
                                <MessageSquare size={64} strokeWidth={1} className="mb-4" />
                                <p className="text-lg font-medium">No messages yet. Say hello!</p>
                            </div>
                        ) : (
                            messages.map((msg) => (
                                <div
                                    key={msg._id}
                                    className={`flex ${msg.senderId === currentUserId ? "justify-end" : "justify-start"}`}
                                >
                                    <div className={`group relative max-w-[75%] rounded-3xl px-6 py-4 shadow-sm transition-all hover:shadow-md ${msg.senderId === currentUserId
                                        ? "bg-primary text-white rounded-tr-none"
                                        : "bg-gray-100 text-gray-800 rounded-tl-none"
                                        }`}>
                                        <p className="text-base leading-relaxed">{msg.content}</p>
                                        <span className={`text-[10px] absolute -bottom-6 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity ${msg.senderId === currentUserId ? "right-0 text-primary" : "left-0 text-gray-400"
                                            }`}>
                                            {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                        </span>
                                    </div>
                                </div>
                            ))
                        )
                    )}
                    {otherUserTyping && !isSearching && (
                        <div className="flex justify-start">
                            <div className="bg-gray-50 text-gray-400 text-xs px-5 py-3 rounded-full border border-gray-100 flex items-center gap-3">
                                <span className="flex gap-1">
                                    <span className="w-1.5 h-1.5 bg-gray-300 rounded-full animate-bounce"></span>
                                    <span className="w-1.5 h-1.5 bg-gray-300 rounded-full animate-bounce [animation-delay:0.2s]"></span>
                                    <span className="w-1.5 h-1.5 bg-gray-300 rounded-full animate-bounce [animation-delay:0.4s]"></span>
                                </span>
                                <span className="font-medium italic">{otherUser?.name} is typing...</span>
                            </div>
                        </div>
                    )}
                </div>

                {/* Input Area */}
                {!isSearching && (
                    <div className="p-8 bg-white border-t border-gray-100 mt-auto">
                        <form onSubmit={handleSend} className="relative group">
                            <div className="absolute left-4 inset-y-0 flex items-center gap-1">
                                <button type="button" className="p-2 text-gray-400 hover:text-primary transition-colors">
                                    <Smile size={22} />
                                </button>
                                <button type="button" className="p-2 text-gray-400 hover:text-primary transition-colors">
                                    <Paperclip size={22} />
                                </button>
                            </div>
                            <input
                                type="text"
                                value={content}
                                onChange={(e) => {
                                    setContent(e.target.value);
                                    handleKeyPress();
                                }}
                                placeholder="Type your message"
                                className="w-full bg-gray-50 border-2 border-transparent rounded-[2rem] pl-28 pr-16 py-4 text-base text-gray-800 focus:outline-none focus:border-primary/20 focus:bg-white transition-all placeholder:text-gray-400"
                            />
                            <button
                                type="submit"
                                disabled={!content.trim() || !chatId}
                                className="absolute right-3 top-1/2 -translate-y-1/2 w-12 h-12 bg-primary hover:bg-primary-hover disabled:bg-gray-200 text-white rounded-full flex items-center justify-center transition-all shadow-lg shadow-primary/20 active:scale-95"
                            >
                                <Send size={22} className="relative left-0.5" />
                            </button>
                        </form>
                    </div>
                )}
            </div>
        </div>
    );
}

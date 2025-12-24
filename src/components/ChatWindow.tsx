import { useRef, useEffect, useState } from "react";
import { useUser } from "../hooks/useUsers";
import { useChat } from "../hooks/useChat";
import type { Id } from "../../convex/_generated/dataModel";
import { Send, Smile } from "lucide-react";

export default function ChatWindow({
    currentUserId,
    otherUserId
}: {
    currentUserId: Id<"users">;
    otherUserId: Id<"users">;
}) {
    const [content, setContent] = useState("");
    const scrollRef = useRef<HTMLDivElement>(null);

    const { user: otherUser } = useUser(otherUserId);
    const {
        messages,
        sendMessage,
        sendTyping,
        otherUserTyping,
        chatId
    } = useChat(currentUserId, otherUserId);

    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
    }, [messages]);

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
        <div className="flex flex-col h-full">
            {/* Chat Header */}
            <div className="p-4 border-b border-slate-700 bg-slate-800/30 flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-slate-700 flex items-center justify-center font-bold">
                    {otherUser?.name?.[0].toUpperCase() || "?"}
                </div>
                <div>
                    <h2 className="font-semibold">{otherUser?.name || "Loading..."}</h2>
                    <p className="text-xs text-slate-400">
                        {otherUser?.online ? "Online" : "Offline"}
                    </p>
                </div>
            </div>

            {/* Messages Area */}
            <div
                ref={scrollRef}
                className="flex-1 overflow-y-auto p-4 space-y-4 scroll-smooth"
            >
                {!messages ? (
                    <div className="flex justify-center py-10">
                        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-indigo-500"></div>
                    </div>
                ) : messages.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-full text-slate-500 py-10">
                        <p>No messages yet. Say hello!</p>
                    </div>
                ) : (
                    messages.map((msg) => (
                        <div
                            key={msg._id}
                            className={`flex ${msg.senderId === currentUserId ? "justify-end" : "justify-start"}`}
                        >
                            <div className={`max-w-[70%] rounded-2xl p-3 shadow-sm ${msg.senderId === currentUserId
                                ? "bg-indigo-600 text-white rounded-tr-none"
                                : "bg-slate-800 text-slate-200 rounded-tl-none border border-slate-700"
                                }`}>
                                <p className="text-sm leading-relaxed">{msg.content}</p>
                                <p className={`text-[10px] mt-1 opacity-60 ${msg.senderId === currentUserId ? "text-right" : "text-left"}`}>
                                    {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                </p>
                            </div>
                        </div>
                    ))
                )}
                {otherUserTyping && (
                    <div className="flex justify-start">
                        <div className="bg-slate-800 text-slate-400 text-xs px-3 py-2 rounded-full border border-slate-700 flex items-center gap-2">
                            <span className="flex gap-1">
                                <span className="w-1.5 h-1.5 bg-slate-500 rounded-full animate-bounce"></span>
                                <span className="w-1.5 h-1.5 bg-slate-500 rounded-full animate-bounce [animation-delay:0.2s]"></span>
                                <span className="w-1.5 h-1.5 bg-slate-500 rounded-full animate-bounce [animation-delay:0.4s]"></span>
                            </span>
                            {otherUser?.name} is typing...
                        </div>
                    </div>
                )}
            </div>

            {/* Input Area */}
            <div className="p-4 bg-slate-800/50 border-t border-slate-700">
                <form onSubmit={handleSend} className="flex gap-2">
                    <button type="button" className="p-2 text-slate-400 hover:text-indigo-400 transition-colors">
                        <Smile size={24} />
                    </button>
                    <input
                        type="text"
                        value={content}
                        onChange={(e) => {
                            setContent(e.target.value);
                            handleKeyPress();
                        }}
                        placeholder="Type a message..."
                        className="flex-1 bg-slate-900 border border-slate-700 rounded-xl px-4 py-2 text-sm focus:outline-none focus:border-indigo-500 transition-colors"
                    />
                    <button
                        type="submit"
                        disabled={!content.trim() || !chatId}
                        className="bg-indigo-600 hover:bg-indigo-500 disabled:bg-slate-700 p-2 rounded-xl transition-all shadow-lg shadow-indigo-500/10"
                    >
                        <Send size={20} className="text-white" />
                    </button>
                </form>
            </div>
        </div>
    );
}


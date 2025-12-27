import { useRef, useEffect, useState } from "react";
import { useUser } from "../hooks/useUsers";
import { useChat } from "../hooks/useChat";
import { useQuery, useAction } from "convex/react";
import { api } from "../../convex/_generated/api";
import { toast } from "sonner";
import type { Id } from "../../convex/_generated/dataModel";
import { Send, Smile, Paperclip, MoreHorizontal, CheckCircle2, Search, X, MessageSquare, Calendar, ArrowLeft, FileText, Trash2, UserX } from "lucide-react";
import { formatRelativeTime } from "../utils/time";
import EmojiPicker, { Theme } from "emoji-picker-react";

export default function ChatCard({
    currentUserId,
    otherUserId,
    onBack
}: {
    currentUserId: Id<"users">;
    otherUserId: Id<"users">;
    onBack: () => void;
}) {
    const [content, setContent] = useState("");
    const [searchQuery, setSearchQuery] = useState("");
    const [isSearching, setIsSearching] = useState(false);
    const [showEmojiPicker, setShowEmojiPicker] = useState(false);
    const [isUploading, setIsUploading] = useState(false);
    const [messageMenuId, setMessageMenuId] = useState<Id<"messages"> | null>(null);
    const [messageToDelete, setMessageToDelete] = useState<Id<"messages"> | null>(null);
    const scrollRef = useRef<HTMLDivElement>(null);
    const inputRef = useRef<HTMLInputElement>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const emojiPickerRef = useRef<HTMLDivElement>(null);
    const sendSoundRef = useRef<HTMLAudioElement | null>(null);

    const generateUploadUrl = useAction(api.s3.generateUploadUrl);

    const { user: otherUser } = useUser(otherUserId);
    const {
        messages,
        sendMessage,
        sendTyping,
        otherUserTyping,
        chatId,
        deleteForMe,
        deleteForEveryone
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

        try {
            await sendMessage(content.trim());
            setContent("");
            setShowEmojiPicker(false);
            sendSoundRef.current?.play().catch(() => { }); // Play sound
        } catch (error) {
            toast.error("Failed to send message");
        }
    };

    const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file || !chatId) return;

        if (file.size > 5 * 1024 * 1024) {
            toast.error("File size must be less than 5MB");
            return;
        }

        const uploadTask = async () => {
            setIsUploading(true);
            try {
                // 1. Get pre-signed URL from Convex
                const { uploadUrl, fileUrl } = await generateUploadUrl({
                    fileName: file.name,
                    fileType: file.type
                });

                // 2. Upload directly to S3 from browser
                console.log("Browser: Starting upload to S3...");
                const uploadResponse = await fetch(uploadUrl, {
                    method: "PUT",
                    body: file,
                }).catch(err => {
                    console.error("Browser: Upload fetch error:", err);
                    throw new Error("Failed to connect to S3. This is almost certainly a CORS issue. Please ensure you have applied the CORS policy in your AWS S3 Console.");
                });

                if (!uploadResponse.ok) {
                    const errorText = await uploadResponse.text();
                    console.error("Browser: S3 Upload Error Body:", errorText);
                    throw new Error(`Upload failed with status ${uploadResponse.status}. Check console for details.`);
                }

                console.log("Browser: S3 upload successful.");

                // 3. Send message with file info
                let type = "file";
                if (file.type.startsWith("image/")) type = "image";
                else if (file.type.startsWith("video/")) type = "video";
                else if (file.type === "application/pdf") type = "pdf";

                await sendMessage("", {
                    url: fileUrl,
                    type,
                    name: file.name,
                    size: file.size
                });

                sendSoundRef.current?.play().catch(() => { });
            } catch (err: any) {
                console.error("Upload failed:", err);
                throw err;
            } finally {
                setIsUploading(false);
                if (fileInputRef.current) fileInputRef.current.value = "";
            }
        };

        toast.promise(uploadTask(), {
            loading: `Uploading ${file.name}...`,
            success: "File uploaded successfully",
            error: (err) => err instanceof Error ? err.message : "Upload failed"
        });
    };

    const handleKeyPress = () => {
        sendTyping();
    };

    const scrollToMessage = (msgId: string) => {
        setIsSearching(false);
        setSearchQuery("");
        // Give it a moment to render the full list if it was filtered
        setTimeout(() => {
            const element = document.getElementById(msgId);
            if (element) {
                element.scrollIntoView({ behavior: "smooth", block: "center" });
                element.classList.add("bg-primary/20");
                setTimeout(() => element.classList.remove("bg-primary/20"), 2000);
            }
        }, 100);
    };

    const handleEmojiClick = (emojiData: any) => {
        const emoji = emojiData.emoji;
        const input = inputRef.current;
        if (!input) return;

        const start = input.selectionStart || 0;
        const end = input.selectionEnd || 0;
        const newText = content.substring(0, start) + emoji + content.substring(end);

        setContent(newText);

        // Return focus and set cursor after the inserted emoji
        setTimeout(() => {
            input.focus();
            input.setSelectionRange(start + emoji.length, start + emoji.length);
        }, 10);
    };

    // Close emoji picker when clicking outside
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (emojiPickerRef.current && !emojiPickerRef.current.contains(event.target as Node)) {
                setShowEmojiPicker(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    return (
        <div className="flex-1 flex flex-col p-8 lg:p-8 overflow-hidden items-center">
            <div className="w-full max-w-4xl h-full bg-white lg:rounded-[2rem] shadow-xl shadow-gray-200/50 flex flex-col overflow-hidden border border-gray-100">
                {/* Chat Header */}
                <div className="px-6 lg:px-8 py-5 border-b border-gray-100 bg-white flex items-center justify-between min-h-[90px]">
                    {!isSearching ? (
                        <>
                            <div className="flex items-center gap-4">
                                <div className="relative">
                                    <div className="w-12 h-12 lg:w-14 lg:h-14 rounded-full bg-gray-200 border-2 border-white shadow-sm flex items-center justify-center font-bold text-lg lg:text-xl text-gray-700">
                                        {otherUser?.name?.[0].toUpperCase() || "?"}
                                    </div>
                                    {otherUser?.online && (
                                        <span className="absolute bottom-0 right-0 w-3.5 h-3.5 bg-emerald-500 border-2 border-white rounded-full"></span>
                                    )}
                                </div>
                                <div className="min-w-0">
                                    <div className="flex items-center gap-1.5">
                                        <h2 className="text-base lg:text-lg font-bold text-gray-900 truncate">{otherUser?.name || "Loading..."}</h2>
                                        <CheckCircle2 size={16} className="text-blue-500 fill-blue-500/10 shrink-0" />
                                    </div>
                                    <p className="text-xs lg:text-sm text-gray-400">
                                        {otherUser?.online ? (
                                            <span className="text-emerald-500 font-medium">Online</span>
                                        ) : (
                                            <>Offline · Last seen {formatRelativeTime(otherUser?.lastSeen)}</>
                                        )}
                                    </p>
                                </div>
                            </div>
                            <div className="flex items-center gap-1 lg:gap-3">
                                <button
                                    onClick={onBack}
                                    className="lg:hidden p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg -ml-2"
                                >
                                    <ArrowLeft size={20} />
                                </button>
                                <button
                                    onClick={() => {
                                        setIsSearching(!isSearching);
                                        if (isSearching) setSearchQuery("");
                                    }}
                                    className={`p-2 rounded-lg transition-colors ${isSearching ? "text-primary bg-primary/5" : "text-gray-400 hover:text-gray-600 hover:bg-gray-100"}`}
                                >
                                    {isSearching ? <X size={20} /> : <Search size={20} />}
                                </button>
                                <button className="hidden sm:block p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg">
                                    <MoreHorizontal size={20} />
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
                    className="flex-1 overflow-y-auto p-6 lg:p-10 space-y-6 lg:space-y-8 scroll-smooth"
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
                                    <div
                                        key={msg._id}
                                        onClick={() => scrollToMessage(msg._id)}
                                        className="group bg-gray-50 hover:bg-[#FDF6F0] rounded-2xl p-5 border border-gray-100 transition-all cursor-pointer"
                                    >
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
                                    id={msg._id}
                                    className={`flex scroll-mt-20 ${msg.senderId === currentUserId ? "justify-end" : "justify-start"}`}
                                >
                                    <div className={`group relative max-w-[85%] lg:max-w-[75%] rounded-2xl lg:rounded-3xl px-4 lg:px-6 py-3 lg:py-4 shadow-sm transition-all hover:shadow-md ${msg.senderId === currentUserId
                                        ? "bg-primary text-white rounded-tr-none"
                                        : "bg-gray-100 text-gray-800 rounded-tl-none"
                                        }`}>
                                        {msg.fileUrl ? (
                                            <div className="space-y-2">
                                                {msg.fileType === "image" ? (
                                                    <img src={msg.fileUrl} alt={msg.fileName} className="max-w-full rounded-lg cursor-zoom-in" />
                                                ) : msg.fileType === "video" ? (
                                                    <video src={msg.fileUrl} controls className="max-w-full rounded-lg" />
                                                ) : (
                                                    <a href={msg.fileUrl} target="_blank" rel="noreferrer" className="flex items-center gap-2 p-3 bg-black/5 rounded-xl hover:bg-black/10 transition-colors">
                                                        {msg.fileType === "pdf" ? <FileText size={20} /> : <Paperclip size={20} />}
                                                        <div className="min-w-0">
                                                            <p className="text-sm font-bold truncate">{msg.fileName || "Download File"}</p>
                                                            {msg.fileSize && <p className="text-[10px] opacity-60">{(msg.fileSize / 1024 / 1024).toFixed(2)} MB</p>}
                                                        </div>
                                                    </a>
                                                )}
                                                {msg.content && <p className="text-sm lg:text-base leading-relaxed">{msg.content}</p>}
                                            </div>
                                        ) : (
                                            <p className={`text-sm lg:text-base leading-relaxed ${msg.deletedForEveryone ? "italic opacity-60" : ""}`}>
                                                {msg.content}
                                            </p>
                                        )}

                                        <div className="flex items-center gap-2 mt-1">
                                            <span className={`text-[10px] flex items-center gap-1 transition-opacity ${msg.senderId === currentUserId ? "text-white/60" : "text-gray-400"
                                                }`}>
                                                {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                            </span>
                                            {!msg.deletedForEveryone && (
                                                <button
                                                    onClick={() => setMessageMenuId(messageMenuId === msg._id ? null : msg._id)}
                                                    className={`p-1 rounded hover:bg-black/5 transition-opacity ${messageMenuId === msg._id ? "opacity-100" : "opacity-0 group-hover:opacity-100"}`}
                                                >
                                                    <MoreHorizontal size={12} />
                                                </button>
                                            )}
                                        </div>

                                        {messageMenuId === msg._id && (
                                            <div className="absolute top-full right-0 mt-2 w-48 bg-white border border-gray-100 rounded-xl shadow-xl z-50 overflow-hidden text-gray-700 animate-in zoom-in-95 duration-100">
                                                <button
                                                    onClick={async () => {
                                                        try {
                                                            await deleteForMe(msg._id);
                                                            toast.success("Message hidden for you");
                                                            setMessageMenuId(null);
                                                        } catch (e) {
                                                            toast.error("Failed to delete message");
                                                        }
                                                    }}
                                                    className="w-full text-left px-4 py-3 text-sm hover:bg-gray-50 flex items-center gap-2"
                                                >
                                                    <UserX size={14} /> Delete for me
                                                </button>
                                                {msg.senderId === currentUserId && (Date.now() - msg.createdAt < 600000) && (
                                                    <button
                                                        onClick={() => {
                                                            setMessageToDelete(msg._id);
                                                            setMessageMenuId(null);
                                                        }}
                                                        className="w-full text-left px-4 py-3 text-sm hover:bg-red-50 text-red-500 flex items-center gap-2"
                                                    >
                                                        <Trash2 size={14} /> Delete for everyone
                                                    </button>
                                                )}
                                            </div>
                                        )}
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

                {/* Deletion Confirmation Modal */}
                {messageToDelete && (
                    <div className="absolute inset-0 z-[100] flex items-center justify-center p-6 bg-black/40 backdrop-blur-sm animate-in fade-in duration-200">
                        <div className="w-full max-w-sm bg-white rounded-[2rem] p-8 shadow-2xl animate-in zoom-in-95 duration-200 border border-gray-100">
                            <div className="w-16 h-16 bg-red-50 text-red-500 rounded-2xl flex items-center justify-center mb-6 mx-auto">
                                <Trash2 size={32} />
                            </div>
                            <h3 className="text-xl font-bold text-gray-900 text-center mb-2">Delete for everyone?</h3>
                            <p className="text-gray-500 text-center mb-8 leading-relaxed">
                                This message will be deleted for both you and <b>{otherUser?.name}</b>. This action cannot be undone.
                            </p>
                            <div className="flex flex-col gap-3">
                                <button
                                    onClick={async () => {
                                        try {
                                            await deleteForEveryone(messageToDelete);
                                            toast.success("Message deleted for everyone", {
                                                icon: <Trash2 size={16} className="text-red-500" />
                                            });
                                            setMessageToDelete(null);
                                        } catch (e: any) {
                                            toast.error(e.message || "Failed to delete message");
                                        }
                                    }}
                                    className="w-full py-4 bg-red-500 hover:bg-red-600 text-white rounded-2xl font-bold transition-all shadow-lg shadow-red-200 active:scale-[0.98]"
                                >
                                    Delete for everyone
                                </button>
                                <button
                                    onClick={() => setMessageToDelete(null)}
                                    className="w-full py-4 bg-gray-50 hover:bg-gray-100 text-gray-600 rounded-2xl font-bold transition-all active:scale-[0.98]"
                                >
                                    Cancel
                                </button>
                            </div>
                        </div>
                    </div>
                )}

                {!isSearching && (
                    <div className="p-4 lg:p-8 bg-white border-t border-gray-100 mt-auto relative">
                        {showEmojiPicker && (
                            <div ref={emojiPickerRef} className="absolute bottom-full mb-2 left-4 lg:left-8 z-50">
                                <EmojiPicker
                                    onEmojiClick={handleEmojiClick}
                                    theme={Theme.LIGHT}
                                />
                            </div>
                        )}
                        <form onSubmit={handleSend} className="relative group">
                            <div className="absolute left-4 inset-y-0 flex items-center gap-1">
                                <button
                                    type="button"
                                    onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                                    className={`hidden sm:block p-2 transition-colors ${showEmojiPicker ? "text-primary" : "text-gray-400 hover:text-primary"}`}
                                >
                                    <Smile size={22} />
                                </button>
                                <button type="button" className="p-2 text-gray-400 hover:text-primary transition-colors" onClick={() => fileInputRef.current?.click()}>
                                    <Paperclip size={22} />
                                </button>
                                <input
                                    type="file"
                                    ref={fileInputRef}
                                    onChange={handleFileUpload}
                                    className="hidden"
                                    accept="image/*,video/*,application/pdf"
                                />
                                {isUploading && <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-primary"></div>}
                            </div>
                            <input
                                ref={inputRef}
                                type="text"
                                value={content}
                                onChange={(e) => {
                                    setContent(e.target.value);
                                    handleKeyPress();
                                }}
                                onFocus={() => setShowEmojiPicker(false)}
                                placeholder="Type your message"
                                className="w-full bg-gray-50 border-2 border-transparent rounded-[2rem] pl-16 sm:pl-28 pr-16 py-3 lg:py-4 text-base text-gray-800 focus:outline-none focus:border-primary/20 focus:bg-white transition-all placeholder:text-gray-400"
                            />
                            <button
                                type="submit"
                                disabled={!content.trim() || !chatId}
                                className="absolute right-3 top-1/2 -translate-y-1/2 w-10 h-10 lg:w-12 lg:h-12 bg-primary hover:bg-primary-hover disabled:bg-gray-200 text-white rounded-full flex items-center justify-center transition-all shadow-lg shadow-primary/20 active:scale-95"
                            >
                                <Send size={20} className="relative left-0.5 lg:w-[22px] lg:h-[22px]" />
                            </button>
                        </form>
                    </div>
                )}
            </div>
            <audio ref={sendSoundRef} src="https://assets.mixkit.co/active_storage/sfx/2354/2354-preview.mp3" preload="auto" />
        </div>
    );
}

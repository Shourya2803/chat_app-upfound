import { Search, X } from "lucide-react";
import { useState, useMemo } from "react";
import { useAllUsers } from "../hooks/useUsers";
import type { Id } from "../../convex/_generated/dataModel";
import { formatRelativeTime } from "../utils/time";

export default function ThreadList({
    currentUserId,
    selectedUserId,
    onSelectUser,
    externalSearch = ""
}: {
    currentUserId: Id<"users">;
    selectedUserId: string | null;
    onSelectUser: (id: string) => void;
    externalSearch?: string;
}) {
    const { users } = useAllUsers(currentUserId);
    const [isSearching, setIsSearching] = useState(false);
    const [searchTerm, setSearchTerm] = useState("");

    const filteredUsers = useMemo(() => {
        if (!users) return [];
        const query = (externalSearch || searchTerm).toLowerCase();
        if (!query) return users;
        return users.filter(u =>
            u.name.toLowerCase().includes(query)
        );
    }, [users, searchTerm, externalSearch]);

    if (!users) {
        return (
            <div className="p-4 space-y-4">
                {[1, 2, 3, 4, 5].map((i) => (
                    <div key={i} className="flex gap-3 animate-pulse">
                        <div className="w-10 h-10 bg-gray-200 rounded-full"></div>
                        <div className="flex-1 space-y-2 py-1">
                            <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                            <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                        </div>
                    </div>
                ))}
            </div>
        );
    }

    return (
        <div className="flex flex-col h-full bg-white border-l border-gray-200 overflow-hidden">
            <div className="p-6 border-b border-gray-100 flex flex-col gap-4">
                <div className="flex items-center justify-between">
                    <h2 className="text-xl font-bold text-gray-900">Messages</h2>
                    <button
                        onClick={() => {
                            setIsSearching(!isSearching);
                            if (isSearching) setSearchTerm("");
                        }}
                        className={`transition-colors ${isSearching ? "text-primary" : "text-gray-400 hover:text-gray-600"}`}
                    >
                        {isSearching ? <X size={20} /> : <Search size={20} />}
                    </button>
                </div>

                {isSearching && (
                    <div className="relative animate-in fade-in slide-in-from-top-2 duration-200">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                        <input
                            type="text"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            placeholder="Search names..."
                            className="w-full bg-gray-50 border border-gray-100 rounded-xl py-2 pl-10 pr-4 text-sm focus:outline-none focus:border-primary/20 focus:bg-white transition-all"
                            autoFocus
                        />
                    </div>
                )}
            </div>

            <div className="flex-1 overflow-y-auto px-2 py-4 space-y-1">
                {filteredUsers.length === 0 ? (
                    <p className="px-4 py-10 text-center text-sm text-gray-400 italic">
                        {searchTerm ? `No results for "${searchTerm}"` : "No connections yet..."}
                    </p>
                ) : (
                    filteredUsers.map((user) => (
                        <button
                            key={user._id}
                            onClick={() => onSelectUser(user._id)}
                            className={`w-full flex items-center gap-3 p-4 rounded-2xl transition-all duration-200 group ${selectedUserId === user._id
                                ? "bg-[#FDF6F0] shadow-sm"
                                : "hover:bg-gray-50"
                                }`}
                        >
                            <div className="relative flex-shrink-0">
                                <div className={`w-12 h-12 rounded-full flex items-center justify-center font-bold text-lg text-white ${selectedUserId === user._id ? "bg-primary shadow-lg shadow-primary/20" : "bg-gray-300"
                                    }`}>
                                    {user.name[0].toUpperCase()}
                                </div>
                                {user.online && (
                                    <span className="absolute bottom-0 right-0 w-3.5 h-3.5 bg-emerald-500 border-2 border-white rounded-full"></span>
                                )}
                            </div>

                            <div className="flex-1 text-left min-w-0">
                                <div className="flex items-center justify-between mb-0.5">
                                    <h4 className={`font-bold truncate ${selectedUserId === user._id ? "text-gray-900" : "text-gray-700"}`}>
                                        {user.name}
                                    </h4>
                                    <span className="text-[10px] text-gray-400 flex-shrink-0">May 29</span>
                                </div>
                                <div className="flex items-center justify-between">
                                    <p className="text-sm text-gray-400 truncate pr-2">
                                        {user.online ? (
                                            <span className="text-emerald-500 font-medium">Available for chat</span>
                                        ) : (
                                            `Last seen ${formatRelativeTime(user.lastSeen)}`
                                        )}
                                    </p>
                                    {!user.online && <div className="w-2 h-2 bg-primary rounded-full flex-shrink-0"></div>}
                                </div>
                            </div>
                        </button>
                    ))
                )}
            </div>
        </div>
    );
}

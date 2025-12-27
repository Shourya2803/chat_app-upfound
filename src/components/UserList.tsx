import { useAllUsers } from "../hooks/useUsers";
import type { Id } from "../../convex/_generated/dataModel";

export default function UserList({
    currentUserId,
    selectedUserId,
    onSelectUser
}: {
    currentUserId: Id<"users">;
    selectedUserId: string | null;
    onSelectUser: (id: string) => void;
}) {
    const { users } = useAllUsers(currentUserId);

    if (!users) {
        return (
            <div className="p-4 space-y-4">
                {[1, 2, 3].map((i) => (
                    <div key={i} className="flex gap-3 animate-pulse">
                        <div className="w-12 h-12 bg-slate-700 rounded-full"></div>
                        <div className="flex-1 space-y-2 py-1">
                            <div className="h-4 bg-slate-700 rounded w-3/4"></div>
                            <div className="h-3 bg-slate-700 rounded w-1/2"></div>
                        </div>
                    </div>
                ))}
            </div>
        );
    }

    return (
        <div className="p-2">
            <h3 className="px-4 py-2 text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Available Users</h3>
            {users.length === 0 ? (
                <p className="px-4 py-2 text-sm text-slate-500 italic">No other users online yet...</p>
            ) : (
                <div className="space-y-1">
                    {users.map((user) => (
                        <button
                            key={user._id}
                            onClick={() => onSelectUser(user._id)}
                            className={`w-full flex items-center gap-3 p-3 rounded-xl transition-all ${selectedUserId === user._id
                                ? "bg-indigo-600/20 border border-indigo-500/50"
                                : "hover:bg-slate-700/50 border border-transparent"
                                }`}
                        >
                            <div className="relative">
                                <div className={`w-12 h-12 rounded-full flex items-center justify-center font-bold text-lg ${selectedUserId === user._id ? "bg-indigo-600" : "bg-slate-700"
                                    }`}>
                                    {user.name[0].toUpperCase()}
                                </div>
                                {user.online && (
                                    <span className="absolute bottom-0 right-0 w-3.5 h-3.5 bg-emerald-500 border-2 border-slate-900 rounded-full"></span>
                                )}
                            </div>
                            <div className="flex-1 text-left">
                                <p className={`font-medium ${selectedUserId === user._id ? "text-indigo-300" : "text-slate-200"}`}>
                                    {user.name}
                                </p>
                                <p className="text-xs text-slate-500 truncate">
                                    {user.online ? "Available for chat" : "Last seen recently"}
                                </p>
                            </div>
                            {user.unreadCount > 0 && (
                                <div className="bg-indigo-500 text-white text-[10px] font-bold min-w-[20px] h-5 rounded-full flex items-center justify-center px-1.5 shadow-lg shadow-indigo-500/20">
                                    {user.unreadCount}
                                </div>
                            )}
                        </button>
                    ))}
                </div>
            )}
        </div>
    );
}

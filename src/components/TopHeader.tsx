import { Search, Bell, MessageSquare, ChevronDown, Menu } from "lucide-react";

export default function TopHeader({
    userName,
    onLogout,
    onSearch,
    onMenuToggle
}: {
    userName: string,
    onLogout: () => void,
    onSearch: (val: string) => void,
    onMenuToggle: () => void
}) {
    return (
        <header className="h-20 bg-header flex items-center justify-between px-4 lg:px-8 sticky top-0 z-30 w-full border-b border-gray-800 lg:border-none">
            <div className="flex items-center gap-4 flex-1 max-w-2xl">
                {/* Hamburger Menu for Mobile */}
                <button
                    onClick={onMenuToggle}
                    className="lg:hidden p-2 text-gray-400 hover:text-white transition-colors"
                >
                    <Menu size={24} />
                </button>

                <div className="relative group flex-1">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                        <Search className="text-gray-400" size={18} />
                    </div>
                    <div className="flex items-center bg-gray-800/50 rounded-full border border-gray-700 overflow-hidden focus-within:border-gray-500 transition-all">
                        <input
                            type="text"
                            placeholder="Search skill, job..."
                            onChange={(e) => onSearch(e.target.value)}
                            className="flex-1 bg-transparent py-2.5 pl-10 pr-4 text-sm text-gray-200 focus:outline-none placeholder:text-gray-500"
                        />
                        {/* Hide extra filters on mobile */}
                        <div className="hidden lg:flex items-center">
                            <div className="h-5 w-[1px] bg-gray-700"></div>
                            <input
                                type="text"
                                placeholder="Location"
                                className="w-1/4 bg-transparent py-2.5 px-4 text-sm text-gray-200 focus:outline-none placeholder:text-gray-500"
                            />
                            <div className="h-5 w-[1px] bg-gray-700"></div>
                            <input
                                type="text"
                                placeholder="Experience"
                                className="w-1/4 bg-transparent py-2.5 px-4 text-sm text-gray-200 focus:outline-none placeholder:text-gray-500"
                            />
                        </div>
                    </div>
                </div>
            </div>

            <div className="flex items-center gap-3 lg:gap-6 ml-4">
                <div className="hidden sm:flex items-center gap-4">
                    <button className="text-gray-400 hover:text-white transition-colors relative">
                        <Bell size={22} />
                        <span className="absolute -top-1 -right-1 w-4 h-4 bg-primary text-[10px] text-white font-bold rounded-full flex items-center justify-center">2</span>
                    </button>
                    <button className="text-gray-400 hover:text-white transition-colors">
                        <MessageSquare size={22} />
                    </button>
                </div>

                <div className="hidden sm:block h-8 w-[1px] bg-gray-700/50 mx-2"></div>

                <button onClick={onLogout} className="flex items-center gap-2 lg:gap-3 group">
                    <div className="w-8 h-8 lg:w-10 lg:h-10 rounded-full bg-gray-700 border-2 border-gray-600 overflow-hidden ring-2 ring-transparent group-hover:ring-primary/50 transition-all shrink-0">
                        <div className="w-full h-full bg-indigo-500 flex items-center justify-center text-white font-bold text-xs lg:text-base">
                            {userName[0]}
                        </div>
                    </div>
                    <div className="text-left hidden md:block">
                        <p className="text-sm font-semibold text-white group-hover:text-primary transition-colors truncate max-w-[100px]">{userName}</p>
                        <p className="text-[10px] text-gray-400 hidden lg:block">Premium Member</p>
                    </div>
                    <ChevronDown size={14} className="text-gray-400 group-hover:text-white transition-colors" />
                </button>
            </div>
        </header>
    );
}

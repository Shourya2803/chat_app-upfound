import { Home, Users, Building2, Briefcase, Bell, MessageSquare, ChevronDown, X } from "lucide-react";

interface SidebarNavProps {
    isOpen?: boolean;
    onClose?: () => void;
}

const navItems = [
    { icon: Home, label: "Home", id: "home" },
    { icon: Users, label: "Community", id: "community", active: true },
    { icon: Building2, label: "Companies", id: "companies", hasSubmenu: true },
    { icon: Briefcase, label: "Jobs", id: "jobs" },
    { icon: Bell, label: "Notifications", id: "notifications" },
    { icon: MessageSquare, label: "Messages", id: "messages" },
];

export default function SidebarNav({ isOpen, onClose }: SidebarNavProps) {
    return (
        <>
            {/* Backdrop for mobile */}
            {isOpen && (
                <div
                    className="fixed inset-0 bg-black/50 z-40 lg:hidden transition-opacity duration-300"
                    onClick={onClose}
                />
            )}

            <aside className={`
                fixed inset-y-0 left-0 z-50 w-64 bg-sidebar border-r border-gray-200 flex flex-col pt-8
                transition-transform duration-300 transform
                ${isOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"}
                lg:static lg:h-full
            `}>
                <div className="px-8 mb-10 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
                            <span className="text-white font-bold text-xl">U</span>
                        </div>
                        <span className="text-2xl font-bold tracking-tight">Up</span>
                    </div>
                    {/* Close button for mobile */}
                    <button
                        onClick={onClose}
                        className="lg:hidden p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg"
                    >
                        <X size={20} />
                    </button>
                </div>

                <nav className="flex-1 px-4 space-y-1">
                    {navItems.map((item) => (
                        <div key={item.id}>
                            <button
                                className={`w-full flex items-center justify-between px-4 py-3 rounded-xl transition-all duration-200 ${item.active
                                    ? "bg-[#FDF6F0] text-primary"
                                    : "text-gray-500 hover:bg-gray-50 hover:text-gray-900"
                                    }`}
                            >
                                <div className="flex items-center gap-3">
                                    <item.icon size={20} className={item.active ? "text-primary" : "text-gray-400"} />
                                    <span className="font-medium">{item.label}</span>
                                </div>
                                {item.hasSubmenu && <ChevronDown size={16} className="text-gray-400" />}
                            </button>
                        </div>
                    ))}
                </nav>
            </aside>
        </>
    );
}

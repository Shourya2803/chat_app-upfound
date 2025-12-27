import { useEffect, useRef } from "react";

export function useNotifications(users: any[] | undefined) {
    const prevTotalUnread = useRef(0);
    const audioRef = useRef<HTMLAudioElement | null>(null);

    // Initialize audio
    useEffect(() => {
        audioRef.current = new Audio("https://assets.mixkit.co/active_storage/sfx/2358/2358-preview.mp3");
    }, []);

    useEffect(() => {
        if (!users) return;

        const totalUnread = users.reduce((sum, user) => sum + (user.unreadCount || 0), 0);

        // Update Document Title
        if (totalUnread > 0) {
            document.title = `(${totalUnread}) Chat App`;
        } else {
            document.title = "Chat App";
        }

        // Play sound if unread count increased
        if (totalUnread > prevTotalUnread.current) {
            audioRef.current?.play().catch(e => console.log("Sound play blocked by browser", e));
        }

        prevTotalUnread.current = totalUnread;
    }, [users]);
}

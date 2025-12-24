import { useState, useEffect, useCallback, useRef } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
import type { Id } from "../../convex/_generated/dataModel";

export function useChat(currentUserId: Id<"users">, otherUserId: Id<"users">) {
    const [chatId, setChatId] = useState<Id<"chats"> | null>(null);

    const getOrCreate = useMutation(api.chats.getOrCreateChat);
    const sendMessageMutation = useMutation(api.messages.send);
    const setTypingMutation = useMutation(api.messages.setTyping);

    // Load or create chat ID
    useEffect(() => {
        getOrCreate({ userId1: currentUserId, userId2: otherUserId }).then(setChatId);
    }, [currentUserId, otherUserId, getOrCreate]);

    // Reactive queries
    const messages = useQuery(api.messages.list, chatId ? { chatId } : "skip");
    const typingIndicators = useQuery(api.messages.getTypingIndicators, chatId ? { chatId } : "skip");

    // Local timer to refresh typing status since time isn't reactive on server
    const [now, setNow] = useState(Date.now());
    useEffect(() => {
        const interval = setInterval(() => setNow(Date.now()), 1000);
        return () => clearInterval(interval);
    }, []);

    const sendMessage = useCallback(async (content: string) => {
        if (!chatId) return;
        return await sendMessageMutation({
            chatId,
            senderId: currentUserId,
            content,
        });
    }, [chatId, currentUserId, sendMessageMutation]);

    const lastTypingTime = useRef(0);

    const sendTyping = useCallback(async () => {
        if (!chatId) return;

        const time = Date.now();
        if (time - lastTypingTime.current < 2000) return;

        lastTypingTime.current = time;
        return await setTypingMutation({
            chatId,
            userId: currentUserId,
        });
    }, [chatId, currentUserId, setTypingMutation]);

    const otherUserTyping = typingIndicators?.some(
        t => t.userId === otherUserId && t.expiresAt > now
    );

    return {
        chatId,
        messages,
        isLoading: messages === undefined || chatId === null,
        sendMessage,
        sendTyping,
        otherUserTyping,
    };
}

import { useState, useEffect } from "react";
import { useMutation } from "convex/react";
import { api } from "../convex/_generated/api";
import LoginForm from "./components/LoginForm";
import ChatLayout from "./components/ChatLayout";
import type { Id } from "../convex/_generated/dataModel";

export default function App() {
  const [user, setUser] = useState<{ id: Id<"users">; name: string } | null>(null);
  const heartbeat = useMutation(api.users.heartbeat);
  const logoutMutation = useMutation(api.users.logout);

  useEffect(() => {
    const saved = localStorage.getItem("chat_user");
    if (saved) {
      try {
        const userData = JSON.parse(saved);
        setUser(userData);
        // Immediately trigger heartbeat to show as online
        heartbeat({ userId: userData.id });
      } catch (e) {
        localStorage.removeItem("chat_user");
      }
    }
  }, [heartbeat]);

  // Heartbeat interval
  useEffect(() => {
    if (!user) return;

    const interval = setInterval(() => {
      heartbeat({ userId: user.id });
    }, 15000); // Heartbeat every 15s

    return () => clearInterval(interval);
  }, [user, heartbeat]);

  const handleLogin = (id: Id<"users">, name: string) => {
    const userData = { id, name };
    setUser(userData);
    localStorage.setItem("chat_user", JSON.stringify(userData));
  };

  const handleLogout = async () => {
    if (user) {
      await logoutMutation({ userId: user.id });
    }
    setUser(null);
    localStorage.removeItem("chat_user");
  };

  if (!user) {
    return <LoginForm onLogin={handleLogin as any} />;
  }

  return <ChatLayout currentUser={user} onLogout={handleLogout} />;
}


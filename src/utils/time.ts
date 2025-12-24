export function formatRelativeTime(timestamp: number | undefined) {
    if (!timestamp) return "";

    const now = Date.now();
    const diff = now - timestamp;

    if (diff < 60000) return "just now";

    const minutes = Math.floor(diff / 60000);
    if (minutes < 60) return `${minutes}m ago`;

    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours}h ago`;

    const days = Math.floor(hours / 24);
    if (days < 7) return `${days}d ago`;

    return new Date(timestamp).toLocaleDateString([], { month: 'short', day: 'numeric' });
}

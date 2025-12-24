import { cronJobs } from "convex/server";
import { api } from "./_generated/api";

const crons = cronJobs();

crons.interval(
    "cleanup offline users",
    { minutes: 1 },
    api.users.cleanupOfflineUsers,
);

crons.interval(
    "cleanup typing indicators",
    { minutes: 1 },
    api.messages.cleanupOldTypingIndicators,
);

export default crons;

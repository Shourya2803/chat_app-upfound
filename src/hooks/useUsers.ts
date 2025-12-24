import { useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";
import type { Id } from "../../convex/_generated/dataModel";

export function useAllUsers(currentUserId: Id<"users">) {
    const users = useQuery(api.users.listAllExcept, { currentUserId });
    return {
        users,
        isLoading: users === undefined,
    };
}

export function useUser(userId: Id<"users">) {
    const user = useQuery(api.users.getById, { userId });
    return {
        user,
        isLoading: user === undefined,
    };
}

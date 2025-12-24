import { useState } from "react";
import { useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
import { ArrowRight, User } from "lucide-react";

export default function LoginForm({ onLogin }: { onLogin: (userId: string, userName: string) => void }) {
    const [name, setName] = useState("");
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);

    const register = useMutation(api.users.register);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!name.trim()) return;

        setLoading(true);
        setError("");

        try {
            const userId = await register({ name: name.trim() });
            onLogin(userId as any, name.trim());
        } catch (err: any) {
            setError(err.message || "Failed to join. Try a different name.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="flex flex-col items-center justify-center min-h-screen p-6 bg-bg-light">
            <div className="w-full max-w-md">
                <div className="flex justify-center mb-8">
                    <div className="flex items-center gap-3">
                        <div className="w-12 h-12 bg-primary rounded-xl flex items-center justify-center shadow-lg shadow-primary/20">
                            <span className="text-white font-bold text-2xl">U</span>
                        </div>
                        <span className="text-3xl font-bold tracking-tight text-gray-900">Up</span>
                    </div>
                </div>

                <div className="bg-white p-10 rounded-[2.5rem] shadow-2xl shadow-gray-200/50 border border-gray-100">
                    <div className="mb-8">
                        <h1 className="text-3xl font-bold text-gray-900 mb-2">Welcome Back</h1>
                        <p className="text-gray-400">Join the professional community today.</p>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div className="space-y-2">
                            <label className="block text-sm font-bold text-gray-700 ml-1">Display Name</label>
                            <div className="relative group">
                                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-gray-400 group-focus-within:text-primary transition-colors">
                                    <User size={20} />
                                </div>
                                <input
                                    type="text"
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                    className="w-full bg-gray-50 border-2 border-transparent rounded-2xl py-4 pl-12 pr-4 text-gray-900 outline-none focus:border-primary/20 focus:bg-white transition-all placeholder:text-gray-300"
                                    placeholder="Enter your name"
                                    disabled={loading}
                                    autoFocus
                                />
                            </div>
                        </div>

                        {error && (
                            <div className="bg-red-50 text-red-500 p-4 rounded-xl text-sm font-medium border border-red-100 flex items-center gap-2 animate-shake">
                                <span className="w-1.5 h-1.5 bg-red-500 rounded-full"></span>
                                {error}
                            </div>
                        )}

                        <button
                            type="submit"
                            disabled={loading || !name.trim()}
                            className="w-full group bg-primary hover:bg-primary-hover disabled:bg-gray-200 py-4 rounded-2xl font-bold text-white transition-all shadow-lg shadow-primary/25 active:scale-[0.98] flex items-center justify-center gap-2"
                        >
                            {loading ? "Connecting..." : (
                                <>
                                    Join Community
                                    <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
                                </>
                            )}
                        </button>
                    </form>

                    <div className="mt-8 pt-8 border-t border-gray-50 text-center">
                        <p className="text-sm text-gray-400">
                            By joining, you agree to our
                            <button className="text-primary font-bold hover:underline ml-1">Terms of Service</button>
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}

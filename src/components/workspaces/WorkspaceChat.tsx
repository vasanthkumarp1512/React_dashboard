
"use client";

import { useState, useRef, useEffect } from "react";
import { chatWorkspace } from "@/app/actions/chat";
import { Send, Bot, User, Globe, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface Message {
    role: "user" | "assistant";
    content: string;
    sources?: { type: string; title: string; url?: string }[];
}

export default function WorkspaceChat({ workspaceId }: { workspaceId: string }) {
    const [messages, setMessages] = useState<Message[]>([]);
    const [input, setInput] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [useDeepSearch, setUseDeepSearch] = useState(false);
    const scrollRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
    }, [messages]);

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        if (!input.trim() || isLoading) return;

        const userMessage = input.trim();
        setMessages(prev => [...prev, { role: "user", content: userMessage }]);
        setInput("");
        setIsLoading(true);

        const response = await chatWorkspace(workspaceId, userMessage, useDeepSearch);

        setIsLoading(false);

        if (response.error) {
            setMessages(prev => [...prev, { role: "assistant", content: `Error: ${response.error}` }]);
        } else {
            setMessages(prev => [...prev, {
                role: "assistant",
                content: response.answer!,
                sources: response.sources
            }]);
        }
    }

    return (
        <div className="flex flex-col h-[600px] border rounded-xl bg-white dark:bg-zinc-900 shadow-sm">
            <div className="p-4 border-b flex justify-between items-center bg-gray-50 dark:bg-zinc-800/50 rounded-t-xl">
                <h3 className="font-semibold flex items-center gap-2">
                    <Bot className="w-5 h-5 text-purple-600" />
                    Workspace Assistant
                </h3>
                <button
                    onClick={() => setUseDeepSearch(!useDeepSearch)}
                    className={cn(
                        "flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium transition-all",
                        useDeepSearch
                            ? "bg-blue-100 text-blue-700 border border-blue-200"
                            : "bg-gray-100 text-gray-600 border border-gray-200 hover:bg-gray-200"
                    )}
                >
                    <Globe className="w-3 h-3" />
                    Deep Search {useDeepSearch ? "ON" : "OFF"}
                </button>
            </div>

            <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 space-y-6">
                {messages.length === 0 && (
                    <div className="text-center text-gray-400 mt-20">
                        <Bot className="w-12 h-12 mx-auto mb-4 opacity-50" />
                        <p>Ask questions about your documents.</p>
                        <p className="text-sm">Toggle "Deep Search" to browse the web.</p>
                    </div>
                )}
                {messages.map((m, i) => (
                    <div key={i} className={cn("flex gap-3", m.role === "user" ? "justify-end" : "justify-start")}>
                        {m.role === "assistant" && (
                            <div className="w-8 h-8 rounded-full bg-purple-100 flex items-center justify-center shrink-0">
                                <Bot className="w-5 h-5 text-purple-600" />
                            </div>
                        )}
                        <div className={cn(
                            "max-w-[80%] rounded-2xl px-4 py-3 text-sm",
                            m.role === "user"
                                ? "bg-purple-600 text-white rounded-br-none"
                                : "bg-gray-100 dark:bg-zinc-800 text-gray-800 dark:text-gray-200 rounded-bl-none"
                        )}>
                            <div className="whitespace-pre-wrap">{m.content}</div>
                            {m.sources && m.sources.length > 0 && (
                                <div className="mt-3 pt-3 border-t border-gray-200/50">
                                    <p className="text-xs font-semibold mb-1 opacity-70">Sources:</p>
                                    <ul className="space-y-1">
                                        {m.sources.map((src, idx) => (
                                            <li key={idx} className="text-xs flex items-center gap-1 opacity-70">
                                                {src.type === 'web' ? <Globe className="w-3 h-3" /> : <Bot className="w-3 h-3" />}
                                                {src.url ? (
                                                    <a href={src.url} target="_blank" rel="noopener noreferrer" className="hover:underline truncate max-w-[200px] block">
                                                        {src.title || src.url}
                                                    </a>
                                                ) : (
                                                    <span>{src.title}</span>
                                                )}
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            )}
                        </div>
                        {m.role === "user" && (
                            <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center shrink-0">
                                <User className="w-5 h-5 text-blue-600" />
                            </div>
                        )}
                    </div>
                ))}
                {isLoading && (
                    <div className="flex gap-3 justify-start">
                        <div className="w-8 h-8 rounded-full bg-purple-100 flex items-center justify-center shrink-0">
                            <Loader2 className="w-5 h-5 text-purple-600 animate-spin" />
                        </div>
                        <div className="bg-gray-100 dark:bg-zinc-800 rounded-2xl px-4 py-3 text-sm rounded-bl-none flex items-center gap-2 text-gray-500">
                            Checking {useDeepSearch ? "web and " : ""}documents...
                        </div>
                    </div>
                )}
            </div>

            <form onSubmit={handleSubmit} className="p-4 border-t bg-gray-50 dark:bg-zinc-800/50 rounded-b-xl">
                <div className="relative">
                    <input
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        placeholder="Ask a question..."
                        className="w-full pl-4 pr-12 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-purple-500 bg-white dark:bg-zinc-900"
                    />
                    <button
                        type="submit"
                        disabled={isLoading || !input.trim()}
                        className="absolute right-2 top-2 p-1.5 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50 transition-colors"
                    >
                        <Send className="w-4 h-4" />
                    </button>
                </div>
            </form>
        </div>
    );
}

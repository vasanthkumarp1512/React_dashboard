"use client";

import { useState } from "react";
import { Send, FileText, Bot, User, AlertCircle, Loader2 } from "lucide-react";

import ChatUploadButton from "./chat-upload-button";

type Document = {
    id: string;
    filename: string;
    createdAt: Date;
};

type Message = {
    role: "user" | "assistant";
    content: string;
};

export default function ChatInterface({ documents }: { documents: Document[] }) {
    const [selectedDoc, setSelectedDoc] = useState<Document | null>(null);
    const [messages, setMessages] = useState<Message[]>([]);
    const [input, setInput] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState("");

    const handleSend = async () => {
        if (!input.trim() || !selectedDoc) return;

        const userMessage: Message = { role: "user", content: input };
        setMessages((prev) => [...prev, userMessage]);
        setInput("");
        setIsLoading(true);
        setError("");

        try {
            const res = await fetch("/api/chat", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    question: userMessage.content,
                    documentId: selectedDoc.id,
                }),
            });

            if (!res.ok) {
                const data = await res.json();
                throw new Error(data.error || "Failed to fetch response");
            }

            const data = await res.json();
            setMessages((prev) => [...prev, { role: "assistant", content: data.answer }]);
        } catch (err: any) {
            setError(err.message);
            // Remove user message if failed? Or just show error.
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="flex h-[calc(100vh-2rem)] gap-6 p-6">
            {/* Sidebar - Document List */}
            <div className="w-1/4 bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden flex flex-col">
                <div className="p-4 border-b border-gray-100 bg-gray-50 space-y-3">
                    <h3 className="font-semibold text-gray-700 flex items-center gap-2">
                        <FileText className="w-4 h-4" />
                        Select Document
                    </h3>
                    <ChatUploadButton />
                </div>
                <div className="flex-1 overflow-y-auto p-2 space-y-2">
                    {documents.length === 0 ? (
                        <div className="p-4 text-center text-sm text-gray-400">
                            No documents found. Upload one first.
                        </div>
                    ) : (
                        documents.map((doc) => (
                            <button
                                key={doc.id}
                                onClick={() => {
                                    setSelectedDoc(doc);
                                    setMessages([]);
                                    setError("");
                                }}
                                className={`w-full text-left p-3 rounded-lg text-sm transition-all ${selectedDoc?.id === doc.id
                                    ? "bg-indigo-50 text-indigo-700 border border-indigo-100"
                                    : "hover:bg-gray-50 text-gray-600 border border-transparent"
                                    }`}
                            >
                                <div className="font-medium truncate">{doc.filename}</div>
                                <div className="text-xs text-gray-400 mt-1">
                                    {new Date(doc.createdAt).toLocaleDateString()}
                                </div>
                            </button>
                        ))
                    )}
                </div>
            </div>

            {/* Chat Area */}
            <div className="flex-1 bg-white rounded-2xl shadow-sm border border-gray-100 flex flex-col overflow-hidden">
                {!selectedDoc ? (
                    <div className="flex-1 flex flex-col items-center justify-center text-gray-400 p-8 text-center">
                        <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mb-4">
                            <Bot className="w-8 h-8 text-indigo-200" />
                        </div>
                        <p className="text-lg font-medium text-gray-500">No Document Selected</p>
                        <p className="text-sm">Choose a document from the sidebar to start chatting.</p>
                    </div>
                ) : (
                    <>
                        {/* Header */}
                        <div className="p-4 border-b border-gray-100 flex justify-between items-center bg-gray-50">
                            <div className="flex items-center gap-2">
                                <div className="w-2 h-2 rounded-full bg-green-500"></div>
                                <span className="font-semibold text-gray-700 truncate max-w-xs">
                                    Chatting with: {selectedDoc.filename}
                                </span>
                            </div>
                        </div>

                        {/* Messages */}
                        <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50/50">
                            {messages.length === 0 && (
                                <div className="text-center text-gray-400 mt-10">
                                    <p>Ask a question about this document to get started.</p>
                                </div>
                            )}
                            {messages.map((msg, i) => (
                                <div
                                    key={i}
                                    className={`flex items-start gap-3 ${msg.role === "user" ? "flex-row-reverse" : ""
                                        }`}
                                >
                                    <div
                                        className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${msg.role === "user"
                                            ? "bg-indigo-600 text-white"
                                            : "bg-white text-indigo-600 border border-gray-100"
                                            }`}
                                    >
                                        {msg.role === "user" ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
                                    </div>
                                    <div
                                        className={`p-3 rounded-2xl max-w-[80%] text-sm ${msg.role === "user"
                                            ? "bg-indigo-600 text-white rounded-br-none"
                                            : "bg-white border border-gray-100 text-gray-700 rounded-bl-none shadow-sm"
                                            }`}
                                    >
                                        {msg.content}
                                    </div>
                                </div>
                            ))}
                            {isLoading && (
                                <div className="flex items-center gap-2 text-gray-400 text-sm ml-11">
                                    <Loader2 className="w-4 h-4 animate-spin" />
                                    Thinking...
                                </div>
                            )}
                            {error && (
                                <div className="flex items-center gap-2 text-red-500 text-sm bg-red-50 p-3 rounded-lg mx-4">
                                    <AlertCircle className="w-4 h-4" />
                                    {error}
                                </div>
                            )}
                        </div>

                        {/* Input */}
                        <div className="p-4 border-t border-gray-100 bg-white">
                            <div className="flex gap-2">
                                <input
                                    type="text"
                                    value={input}
                                    onChange={(e) => setInput(e.target.value)}
                                    onKeyDown={(e) => e.key === "Enter" && handleSend()}
                                    placeholder="Ask a question..."
                                    className="flex-1 px-4 py-2 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all font-sans"
                                    disabled={isLoading}
                                />
                                <button
                                    onClick={handleSend}
                                    disabled={isLoading || !input.trim()}
                                    className="bg-indigo-600 hover:bg-indigo-700 disabled:bg-gray-300 text-white p-2 rounded-xl transition-colors flex items-center justify-center w-10 h-10"
                                >
                                    {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                                </button>
                            </div>
                        </div>
                    </>
                )}
            </div>
        </div>
    );
}

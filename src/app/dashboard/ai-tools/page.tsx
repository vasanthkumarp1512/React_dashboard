"use client";

import { useState, useRef } from "react";
import { summarizeVideo } from "@/app/actions/youtube";
import { generateStudyNotes } from "@/app/actions/generate-notes";
import { Sparkles, Youtube, Copy, Download, Loader2, AlertCircle, BookOpen, CheckCircle2, AlignLeft } from "lucide-react";

export default function AIToolsPage() {
    const [mode, setMode] = useState<"youtube" | "manual">("youtube");
    const [url, setUrl] = useState("");
    const [manualText, setManualText] = useState("");
    const [notes, setNotes] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [copied, setCopied] = useState(false);
    const [videoId, setVideoId] = useState<string | null>(null);
    const notesRef = useRef<HTMLDivElement>(null);

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault();

        setLoading(true);
        setError(null);
        setNotes(null);
        setVideoId(null);
        setCopied(false);

        try {
            if (mode === "youtube") {
                if (!url.trim()) {
                    setLoading(false);
                    return;
                }

                let clientTranscript: string | undefined;
                const clientLogs: string[] = [];

                // Extract video ID to try client-side fetch
                const videoIdMatch = url.match(/(?:v=|\/)([0-9A-Za-z_-]{11}).*/);
                const videoId = videoIdMatch ? videoIdMatch[1] : null;

                if (videoId) {
                    try {
                        console.log("Attempting client-side transcript fetch...");
                        // Dynamic import to avoid server-side issues if any
                        const { fetchTranscriptClient } = await import("@/lib/youtube-client");
                        const { transcript, logs } = await fetchTranscriptClient(videoId);

                        if (logs) clientLogs.push(...logs);

                        if (transcript) {
                            console.log("Client-side fetch successful!");
                            clientTranscript = transcript;
                        }
                    } catch (e: any) {
                        console.warn("Client-side fetch error:", e);
                        clientLogs.push(`[Client] Wrapper error: ${e.message}`);
                    }
                }

                const result = await summarizeVideo(url, clientTranscript, clientLogs);

                if (result.error) {
                    // Attach debug logs to the error string object if possible, or handle state better
                    // For simplicity, we'll store the object in a way the UI can read,
                    // or just append logs to the error message if we can't change state type easily.
                    const errorObj: any = new String(result.error);
                    errorObj.debugLogs = result.debugLogs;
                    setError(errorObj);
                } else if (result.success && result.notes) {
                    setNotes(result.notes);
                    setVideoId(result.videoId ?? null);
                }
            } else {
                if (!manualText.trim() || manualText.length < 50) {
                    setError("Please enter enough text (at least 50 characters).");
                    setLoading(false);
                    return;
                }

                const result = await generateStudyNotes(manualText);

                if (result.error) {
                    setError(result.error);
                } else if (result.success && result.notes) {
                    setNotes(result.notes);
                }
            }
        } catch (err) {
            setError("Something went wrong. Please try again.");
        } finally {
            setLoading(false);
        }
    }

    function handleCopy() {
        if (notes) {
            navigator.clipboard.writeText(notes);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        }
    }

    function handleDownload() {
        if (notes) {
            const blob = new Blob([notes], { type: "text/markdown" });
            const downloadUrl = URL.createObjectURL(blob);
            const a = document.createElement("a");
            a.href = downloadUrl;
            a.download = `study-notes-${videoId || "video"}.md`;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(downloadUrl);
        }
    }

    return (
        <div className="p-8 max-w-5xl mx-auto">
            {/* Header */}
            <div className="mb-8">
                <div className="flex items-center gap-3 mb-2">
                    <div className="p-2 bg-gradient-to-br from-purple-500 to-indigo-600 rounded-xl">
                        <Sparkles className="w-6 h-6 text-white" />
                    </div>
                    <h1 className="text-3xl font-bold text-gray-900">AI Study Notes</h1>
                </div>
                <p className="text-gray-500 ml-14">
                    Generate comprehensive study notes from YouTube videos or text.
                </p>
            </div>

            {/* Input Section */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 mb-6">
                {/* Tabs */}
                <div className="flex gap-4 border-b border-gray-100 pb-4 mb-6">
                    <button
                        onClick={() => { setMode("youtube"); setError(null); }}
                        className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors font-medium ${mode === "youtube"
                            ? "bg-indigo-50 text-indigo-700"
                            : "text-gray-600 hover:bg-gray-50"
                            }`}
                    >
                        <Youtube className="w-5 h-5" />
                        YouTube Video
                    </button>
                    <button
                        onClick={() => { setMode("manual"); setError(null); }}
                        className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors font-medium ${mode === "manual"
                            ? "bg-indigo-50 text-indigo-700"
                            : "text-gray-600 hover:bg-gray-50"
                            }`}
                    >
                        <AlignLeft className="w-5 h-5" />
                        Paste Transcript/Text
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                    {mode === "youtube" ? (
                        <div className="relative">
                            <Youtube className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-red-500" />
                            <input
                                type="url"
                                value={url}
                                onChange={(e) => setUrl(e.target.value)}
                                placeholder="Paste YouTube URL (e.g., https://youtube.com/watch?v=...)"
                                className="w-full pl-12 pr-4 py-3.5 border border-gray-200 rounded-xl text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                                disabled={loading}
                            />
                        </div>
                    ) : (
                        <div className="relative">
                            <textarea
                                value={manualText}
                                onChange={(e) => setManualText(e.target.value)}
                                placeholder="Paste the video transcript or any study text here..."
                                className="w-full p-4 border border-gray-200 rounded-xl text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all min-h-[150px]"
                                disabled={loading}
                            />
                        </div>
                    )}

                    <div className="flex justify-end">
                        <button
                            type="submit"
                            disabled={loading || (mode === "youtube" && !url.trim()) || (mode === "manual" && !manualText.trim())}
                            className="px-6 py-3.5 bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-medium rounded-xl hover:from-indigo-700 hover:to-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2 min-w-[180px] shadow-md hover:shadow-lg"
                        >
                            {loading ? (
                                <>
                                    <Loader2 className="w-5 h-5 animate-spin" />
                                    Generating...
                                </>
                            ) : (
                                <>
                                    <Sparkles className="w-5 h-5" />
                                    Generate Notes
                                </>
                            )}
                        </button>
                    </div>
                </form>
            </div>

            {/* Error */}
            {error && (
                <div className="bg-red-50 border border-red-100 rounded-2xl p-5 mb-6 flex flex-col gap-3">
                    <div className="flex items-start gap-3">
                        <AlertCircle className="w-5 h-5 text-red-500 mt-0.5 shrink-0" />
                        <div>
                            <p className="text-red-700 font-medium text-sm">Something went wrong</p>
                            <p className="text-red-600 text-sm mt-1">{error}</p>
                            {mode === "youtube" && (error.includes("captions") || error.includes("transcript") || error.includes("blocking")) && (
                                <button
                                    onClick={() => setMode("manual")}
                                    className="text-sm underline mt-2 text-red-700 hover:text-red-900 font-medium"
                                >
                                    Try pasting the transcript manually
                                </button>
                            )}
                        </div>
                    </div>

                    {/* Debug Logs Display */}
                    {(error as any).debugLogs && (
                        <div className="mt-2 p-3 bg-red-100/50 rounded-lg border border-red-200 text-xs font-mono text-red-800 overflow-x-auto">
                            <p className="font-semibold mb-1">Debug Info (Share this if the issue persists):</p>
                            <ul className="list-disc pl-4 space-y-1">
                                {(error as any).debugLogs.map((log: string, i: number) => (
                                    <li key={i}>{log}</li>
                                ))}
                            </ul>
                        </div>
                    )}
                </div>
            )}

            {/* Loading State */}
            {loading && (
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-12 text-center">
                    <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-indigo-100 to-purple-100 rounded-2xl mb-4">
                        <Loader2 className="w-8 h-8 text-indigo-600 animate-spin" />
                    </div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">Analyzing Content...</h3>
                    <p className="text-gray-500 text-sm max-w-md mx-auto">
                        Processing the content and generating study notes with AI. This may take 15-30 seconds.
                    </p>
                    <div className="mt-6 flex items-center justify-center gap-8 text-xs text-gray-400">
                        <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-green-400 animate-pulse"></span> Processing input</span>
                        <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-indigo-400 animate-pulse"></span> AI thinking</span>
                        <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-purple-400 animate-pulse"></span> Formatting notes</span>
                    </div>
                </div>
            )}

            {/* Results */}
            {notes && (
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                    {/* Results Header */}
                    <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 bg-gradient-to-r from-gray-50 to-white">
                        <div className="flex items-center gap-2">
                            <BookOpen className="w-5 h-5 text-indigo-600" />
                            <h2 className="font-semibold text-gray-900">Generated Study Notes</h2>
                        </div>
                        <div className="flex items-center gap-2">
                            <button
                                onClick={handleCopy}
                                className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-gray-600 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
                            >
                                {copied ? (
                                    <>
                                        <CheckCircle2 className="w-3.5 h-3.5 text-green-500" />
                                        Copied!
                                    </>
                                ) : (
                                    <>
                                        <Copy className="w-3.5 h-3.5" />
                                        Copy
                                    </>
                                )}
                            </button>
                            <button
                                onClick={handleDownload}
                                className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-gray-600 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
                            >
                                <Download className="w-3.5 h-3.5" />
                                Download
                            </button>
                        </div>
                    </div>

                    {/* Video Preview (Only in YouTube mode) */}
                    {mode === "youtube" && videoId && (
                        <div className="px-6 pt-6">
                            <div className="aspect-video w-full max-w-2xl mx-auto rounded-xl overflow-hidden shadow-md">
                                <iframe
                                    src={`https://www.youtube.com/embed/${videoId}`}
                                    className="w-full h-full"
                                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                    allowFullScreen
                                    title="YouTube Video"
                                ></iframe>
                            </div>
                        </div>
                    )}

                    {/* Notes Content */}
                    <div ref={notesRef} className="p-6 prose prose-sm prose-indigo max-w-none
                        prose-headings:text-gray-900 prose-headings:font-semibold
                        prose-h1:text-2xl prose-h1:border-b prose-h1:border-gray-100 prose-h1:pb-3 prose-h1:mb-4
                        prose-h2:text-xl prose-h2:mt-8 prose-h2:mb-3
                        prose-h3:text-lg prose-h3:mt-6
                        prose-p:text-gray-600 prose-p:leading-relaxed
                        prose-li:text-gray-600
                        prose-strong:text-gray-800
                        prose-code:text-indigo-600 prose-code:bg-indigo-50 prose-code:px-1 prose-code:py-0.5 prose-code:rounded
                    ">
                        <div dangerouslySetInnerHTML={{ __html: formatMarkdown(notes) }} />
                    </div>
                </div>
            )}

            {/* Empty State */}
            {!notes && !loading && !error && (
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-12 text-center">
                    <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-indigo-100 to-purple-100 rounded-2xl mb-4">
                        <Youtube className="w-8 h-8 text-indigo-600" />
                    </div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">Ready to Learn</h3>
                    <p className="text-gray-500 text-sm max-w-md mx-auto">
                        Paste any YouTube video URL or transcript above to generate comprehensive study notes powered by AI.
                    </p>
                    <div className="mt-6 grid grid-cols-1 sm:grid-cols-3 gap-4 max-w-lg mx-auto text-left">
                        <div className="bg-gray-50 p-4 rounded-xl">
                            <p className="text-xs font-semibold text-gray-700 mb-1">📋 Summary</p>
                            <p className="text-xs text-gray-500">Concise video overview</p>
                        </div>
                        <div className="bg-gray-50 p-4 rounded-xl">
                            <p className="text-xs font-semibold text-gray-700 mb-1">📝 Study Notes</p>
                            <p className="text-xs text-gray-500">Organized key points</p>
                        </div>
                        <div className="bg-gray-50 p-4 rounded-xl">
                            <p className="text-xs font-semibold text-gray-700 mb-1">❓ Review Questions</p>
                            <p className="text-xs text-gray-500">Test your understanding</p>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

// Simple markdown-to-HTML converter
function formatMarkdown(md: string): string {
    let html = md
        // Escape HTML
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        // Headers
        .replace(/^### (.+)$/gm, '<h3>$1</h3>')
        .replace(/^## (.+)$/gm, '<h2>$1</h2>')
        .replace(/^# (.+)$/gm, '<h1>$1</h1>')
        // Bold and italic
        .replace(/\*\*\*(.+?)\*\*\*/g, '<strong><em>$1</em></strong>')
        .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
        .replace(/\*(.+?)\*/g, '<em>$1</em>')
        // Inline code
        .replace(/`(.+?)`/g, '<code>$1</code>')
        // Horizontal rules
        .replace(/^---$/gm, '<hr />')
        // Numbered lists  
        .replace(/^\d+\.\s+(.+)$/gm, '<li>$1</li>')
        // Unordered lists
        .replace(/^[-*]\s+(.+)$/gm, '<li>$1</li>')
        // Paragraphs
        .replace(/\n\n/g, '</p><p>')
        // Line breaks
        .replace(/\n/g, '<br />');

    // Wrap consecutive <li> elements in <ul>
    html = html.replace(/((?:<li>.*?<\/li><br \/>?)+)/g, (match) => {
        const cleaned = match.replace(/<br \/>/g, '');
        return `<ul>${cleaned}</ul>`;
    });

    return `<p>${html}</p>`;
}

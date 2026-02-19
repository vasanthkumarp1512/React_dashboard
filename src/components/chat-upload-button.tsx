"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Upload, X, File, CheckCircle, AlertCircle, Loader2 } from "lucide-react";

export default function ChatUploadButton() {
    const [isOpen, setIsOpen] = useState(false);
    const [file, setFile] = useState<File | null>(null);
    const [uploading, setUploading] = useState(false);
    const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);
    const router = useRouter();

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            setFile(e.target.files[0]);
            setMessage(null);
        }
    };

    const handleUpload = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!file) return;

        setUploading(true);
        setMessage(null);

        const formData = new FormData();
        formData.append("file", file);

        try {
            const res = await fetch("/api/upload", {
                method: "POST",
                body: formData,
            });

            if (!res.ok) {
                const data = await res.json();
                throw new Error(data.error || "Upload failed");
            }

            setMessage({ type: "success", text: "Uploaded!" });
            setFile(null);
            router.refresh(); // Refresh parent to show new doc

            // Close after short delay logic could go here, or manual close
            setTimeout(() => {
                setIsOpen(false);
                setMessage(null);
            }, 1000);

        } catch (err: any) {
            setMessage({ type: "error", text: err.message });
        } finally {
            setUploading(false);
        }
    };

    return (
        <>
            <button
                onClick={() => setIsOpen(true)}
                className="w-full flex items-center gap-2 justify-center px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors font-medium text-sm"
            >
                <Upload className="w-4 h-4" />
                Upload New
            </button>

            {isOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
                    <div className="bg-white rounded-2xl shadow-xl w-full max-w-sm overflow-hidden animate-in fade-in zoom-in duration-200">
                        <div className="p-4 border-b border-gray-100 flex justify-between items-center bg-gray-50">
                            <h3 className="font-semibold text-gray-700">Upload Document</h3>
                            <button
                                onClick={() => setIsOpen(false)}
                                className="text-gray-400 hover:text-gray-600 hover:bg-gray-200 rounded-full p-1 transition-colors"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        <div className="p-6">
                            <form onSubmit={handleUpload} className="space-y-4">
                                <div className="border-2 border-dashed border-gray-200 rounded-xl p-6 text-center hover:border-indigo-300 transition-colors bg-gray-50/50">
                                    <input
                                        type="file"
                                        id="modal-file-upload"
                                        className="hidden"
                                        accept=".pdf,.txt"
                                        onChange={handleFileChange}
                                    />
                                    <label
                                        htmlFor="modal-file-upload"
                                        className="cursor-pointer flex flex-col items-center justify-center gap-2"
                                    >
                                        <div className="p-2 bg-white rounded-full text-indigo-600 shadow-sm border border-gray-100">
                                            {file ? <File className="w-5 h-5" /> : <Upload className="w-5 h-5" />}
                                        </div>
                                        <span className="text-sm font-medium text-gray-700 break-all">
                                            {file ? file.name : "Click to select file"}
                                        </span>
                                        {!file && <span className="text-xs text-gray-400">PDF or TXT</span>}
                                    </label>
                                </div>

                                {message && (
                                    <div className={`p-2 rounded-lg text-xs flex items-center gap-2 ${message.type === "success" ? "bg-green-50 text-green-700" : "bg-red-50 text-red-700"
                                        }`}>
                                        {message.type === "success" ? <CheckCircle className="w-3 h-3" /> : <AlertCircle className="w-3 h-3" />}
                                        {message.text}
                                    </div>
                                )}

                                <button
                                    type="submit"
                                    disabled={!file || uploading}
                                    className="w-full bg-indigo-600 text-white py-2 px-4 rounded-xl font-medium hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
                                >
                                    {uploading && <Loader2 className="w-4 h-4 animate-spin" />}
                                    {uploading ? "Uploading..." : "Upload"}
                                </button>
                            </form>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}

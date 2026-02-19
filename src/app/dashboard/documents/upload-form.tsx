"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Upload, File, CheckCircle, AlertCircle } from "lucide-react";

export default function UploadForm() {
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

            setMessage({ type: "success", text: "File uploaded successfully!" });
            setFile(null);
            router.refresh(); // Refresh server components to show new file
        } catch (err: any) {
            setMessage({ type: "error", text: err.message });
        } finally {
            setUploading(false);
        }
    };

    return (
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100 mb-8">
            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <Upload className="w-5 h-5 text-indigo-600" />
                Upload Document
            </h3>

            <form onSubmit={handleUpload} className="space-y-4">
                <div className="border-2 border-dashed border-gray-200 rounded-lg p-8 text-center hover:border-indigo-300 transition-colors">
                    <input
                        type="file"
                        id="file-upload"
                        className="hidden"
                        accept=".pdf,.txt"
                        onChange={handleFileChange}
                    />
                    <label
                        htmlFor="file-upload"
                        className="cursor-pointer flex flex-col items-center justify-center gap-2"
                    >
                        <div className="p-3 bg-indigo-50 rounded-full text-indigo-600">
                            {file ? <File className="w-6 h-6" /> : <Upload className="w-6 h-6" />}
                        </div>
                        <span className="text-sm font-medium text-gray-700">
                            {file ? file.name : "Click to upload PDF or Text file"}
                        </span>
                        {!file && <span className="text-xs text-gray-400">PDF, TXT up to 10MB</span>}
                    </label>
                </div>

                {message && (
                    <div className={`p-3 rounded-lg text-sm flex items-center gap-2 ${message.type === "success" ? "bg-green-50 text-green-700" : "bg-red-50 text-red-700"
                        }`}>
                        {message.type === "success" ? <CheckCircle className="w-4 h-4" /> : <AlertCircle className="w-4 h-4" />}
                        {message.text}
                    </div>
                )}

                <button
                    type="submit"
                    disabled={!file || uploading}
                    className="w-full bg-indigo-600 text-white py-2 px-4 rounded-lg font-medium hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                    {uploading ? "Uploading..." : "Upload Document"}
                </button>
            </form>
        </div>
    );
}

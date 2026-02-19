
"use client";

import { useState } from "react";
import { uploadDocument } from "@/app/actions/documents";
import { Upload, FileText, Loader2, CheckCircle } from "lucide-react";
import { useRouter } from "next/navigation";

export default function DocumentUploader({ workspaceId }: { workspaceId: string }) {
    const [isUploading, setIsUploading] = useState(false);
    const router = useRouter();

    async function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
        const file = e.target.files?.[0];
        if (!file) return;

        setIsUploading(true);
        const formData = new FormData();
        formData.append("file", file);
        formData.append("workspaceId", workspaceId);

        const res = await uploadDocument(formData);

        if (res.error) {
            alert(res.error); // Simple error handling
        } else {
            router.refresh();
        }
        setIsUploading(false);
        // Reset input
        e.target.value = "";
    }

    return (
        <div className="bg-white dark:bg-zinc-900 border rounded-xl p-4">
            <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold flex items-center gap-2">
                    <FileText className="w-5 h-5 text-blue-600" />
                    Documents
                </h3>
                <label className="cursor-pointer bg-blue-50 text-blue-600 px-3 py-1.5 rounded-lg text-xs font-medium hover:bg-blue-100 transition-colors flex items-center gap-2">
                    {isUploading ? <Loader2 className="w-3 h-3 animate-spin" /> : <Upload className="w-3 h-3" />}
                    {isUploading ? "Uploading..." : "Upload PDF"}
                    <input
                        type="file"
                        accept=".pdf,.txt"
                        className="hidden"
                        onChange={handleFileChange}
                        disabled={isUploading}
                    />
                </label>
            </div>
            <p className="text-xs text-gray-500">
                Upload PDFs or text files to add to your knowledge base.
            </p>
        </div>
    );
}

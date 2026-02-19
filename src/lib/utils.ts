
import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}

export function chunkText(text: string, chunkSize: number = 1000, overlap: number = 200): string[] {
    const chunks: string[] = [];
    let start = 0;

    while (start < text.length) {
        let end = start + chunkSize;

        // If not at the end, try to break at a newline or space
        if (end < text.length) {
            const lastNewline = text.lastIndexOf('\n', end);
            const lastSpace = text.lastIndexOf(' ', end);

            if (lastNewline > start + chunkSize * 0.5) {
                end = lastNewline + 1;
            } else if (lastSpace > start + chunkSize * 0.5) {
                end = lastSpace + 1;
            }
        }

        const chunk = text.slice(start, end).trim();
        if (chunk.length > 0) {
            chunks.push(chunk);
        }

        start += chunkSize - overlap;
        // Ensure progress
        if (start >= end) start = end;
    }

    return chunks;
}

"use client";
import { useState, useEffect, use } from "react";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Download } from "lucide-react";

interface FileItem {
    Key: string;
    Size: number;
    LastModified: string;
}

export default function SharePage({ params }: { params: Promise<{ shareToken: string }> }) {
    const { shareToken } = use(params);
    const [files, setFiles] = useState<FileItem[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [isDownloading, setIsDownloading] = useState(false);

    useEffect(() => {
        const fetchSharedFiles = async () => {
            try {
                const response = await fetch(`/api/shares/${shareToken}`);
                
                if (!response.ok) {
                    const errorData = await response.json();
                    setError(errorData.error || "Failed to load shared files");
                    return;
                }

                const filesData = await response.json();
                setFiles(filesData);
            } catch (err) {
                console.error("Error fetching shared files:", err);
                setError("Failed to load shared files");
            } finally {
                setIsLoading(false);
            }
        };

        fetchSharedFiles();
    }, [shareToken]);

    const handleDownload = async () => {
        setIsDownloading(true);
        try {
            const response = await fetch(`/api/shares/${shareToken}/download`);
            
            if (!response.ok) {
                const errorData = await response.json();
                console.error("Download failed:", errorData.error);
                return;
            }

            const blob = await response.blob();
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = 'shared-files.zip';
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            window.URL.revokeObjectURL(url);
        } catch (err) {
            console.error("Error downloading files:", err);
        } finally {
            setIsDownloading(false);
        }
    };

    const getFileName = (key: string) => {
        const parts = key.split('/');
        return parts[parts.length - 1];
    };

    const formatFileSize = (bytes: number) => {
        if (bytes < 1024) return bytes + ' B';
        if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
        return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
    };

    const getFileExtension = (filename: string) => {
        return filename.split('.').pop()?.toLowerCase() || '';
    };

    return (
        <div className="flex items-center justify-center min-h-screen bg-gray-100">
            <Dialog open={true}>
                <DialogContent className="sm:max-w-[1000px] sm:max-h-[600px] overflow-hidden bg-gray-100 rounded-4xl border-none backdrop-blur-md shadow-[inset_0_2px_8px_rgba(128,128,128,0.5)]">
                    <DialogHeader>
                        <DialogTitle className="flex h-10 w-full my-3 px-3 py-2 text-4xl">
                            Box from OneDrop
                        </DialogTitle>
                    </DialogHeader>
                    
                    <div className="min-h-[300px] max-h-[400px] overflow-auto">
                        {isLoading ? (
                            <div className="flex items-center justify-center h-[300px]">
                                <div className="w-8 h-8 border-4 border-gray-200 border-t-black rounded-full animate-spin" />
                            </div>
                        ) : error ? (
                            <div className="flex flex-col items-center justify-center h-[300px] text-gray-500">
                                <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="8" x2="12" y2="12"></line><line x1="12" y1="16" x2="12.01" y2="16"></line></svg>
                                <p className="mt-2 text-red-500">{error}</p>
                            </div>
                        ) : files.length === 0 ? (
                            <div className="flex flex-col items-center justify-center h-[300px] text-gray-500">
                                <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M13 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V9z"></path><polyline points="13 2 13 9 20 9"></polyline></svg>
                                <p className="mt-2">No files in this box</p>
                            </div>
                        ) : (
                            <div className="grid grid-cols-4 gap-3 p-4">
                                {files.map((file, index) => (
                                    <div 
                                        key={index}
                                        className="relative group bg-black rounded-2xl p-2 shadow-[inset_0_2px_8px_rgba(128,128,128,1)] hover:shadow-md transition-shadow"
                                    >
                                        <div className="aspect-square mb-2 flex items-center justify-center bg-gray-200 rounded-2xl">
                                            <span className="text-sm font-medium text-gray-500 uppercase">
                                                {getFileExtension(getFileName(file.Key))}
                                            </span>
                                        </div>
                                        <p className="ml-2 text-sm text-white font-regular truncate" title={getFileName(file.Key)}>
                                            {getFileName(file.Key)}
                                        </p>
                                        <p className="ml-2 text-xs text-gray-500">
                                            {formatFileSize(file.Size)}
                                        </p>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    <DialogFooter className="pt-4">
                        <Button 
                            onClick={handleDownload}
                            className="rounded-full text-md px-5 py-5 -mb-3 cursor-pointer shadow-[inset_0_2px_8px_rgba(128,128,128,0.5)]" 
                            disabled={isDownloading || isLoading || !!error || files.length === 0}
                        >
                            <Download className="h-4 w-4 mr-2" />
                            {isDownloading ? "Downloading..." : "Download .zip"}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}

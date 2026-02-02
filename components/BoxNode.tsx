"use client";
import { useState } from "react";
import { auth } from "@/firebase";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Share2, Copy, Check } from "lucide-react";

interface FileItem {
    Key: string;
    Size: number;
    LastModified: string;
}

export default function BoxNode({ data }: { data: { label: string; boxId: string; isOverTrash?: boolean; boxImage?: string } }) {
    const [isOpen, setIsOpen] = useState(false);
    const [files, setFiles] = useState<FileItem[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [isHovered, setIsHovered] = useState(false);
    const [shareLink, setShareLink] = useState<string | null>(null);
    const [isSharing, setIsSharing] = useState(false);
    const [copied, setCopied] = useState(false);

    const fetchFiles = async () => {
        if (!data.boxId) return;
        
        setIsLoading(true);
        try {
            const token = await auth.currentUser?.getIdToken();
            if (!token) {
                console.error("User not authenticated");
                return;
            }

            const response = await fetch(`/api/boxes/${data.boxId}/files`, {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            if (response.ok) {
                const filesData = await response.json();
                setFiles(filesData);
            }
        } catch (error) {
            console.error("Error fetching files:", error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleOpen = () => {
        setIsOpen(true);
        setShareLink(null);
        setCopied(false);
        fetchFiles();
    };

    const handleShare = async () => {
        if (!data.boxId) return;
        
        setIsSharing(true);
        try {
            const token = await auth.currentUser?.getIdToken();
            if (!token) {
                console.error("User not authenticated");
                return;
            }

            const response = await fetch(`/api/boxes/${data.boxId}/share`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            if (response.ok) {
                const { shareToken } = await response.json();
                const link = `${window.location.origin}/share/${shareToken}`;
                setShareLink(link);
            } else {
                console.error("Failed to generate share link");
            }
        } catch (error) {
            console.error("Error generating share link:", error);
        } finally {
            setIsSharing(false);
        }
    };

    const handleCopyLink = async () => {
        if (!shareLink) return;
        
        try {
            await navigator.clipboard.writeText(shareLink);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        } catch (error) {
            console.error("Failed to copy link:", error);
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
        <>
            <div 
                className={`flex flex-col items-center cursor-pointer transition-transform relative ${data.isOverTrash ? 'scale-50 opacity-50' : 'hover:scale-105'}`}
                onClick={handleOpen}
                onMouseEnter={() => setIsHovered(true)}
                onMouseLeave={() => setIsHovered(false)}
            >
                <img src={data.boxImage} alt="box" width={300} height={300} className="-mb-7" />
                <h1 className="text-center text-white text-2xl font-medium">{data.label || "BoxNode"}</h1>
            </div>

            <Dialog open={isOpen} onOpenChange={setIsOpen}>
                <DialogContent className="sm:max-w-[1000px] sm:max-h-[600px] overflow-hidden bg-gray-100 rounded-4xl border-none backdrop-blur-md shadow-[inset_0_2px_8px_rgba(128,128,128,0.5)]">
                    <DialogHeader>
                        <DialogTitle className="flex h-10 w-full my-3 px-3 py-2 text-4xl">{data.label}</DialogTitle>
                    </DialogHeader>
                    
                    <div className="min-h-[400px] max-h-[400px] overflow-auto">
                        {isLoading ? (
                            <div className="flex items-center justify-center h-[300px]">
                                <div className="w-8 h-8 border-4 border-gray-200 border-t-black rounded-full animate-spin" />
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
                        {shareLink ? (
                            <div className="flex items-center gap-2 w-full">
                                <input 
                                    type="text" 
                                    value={shareLink} 
                                    readOnly 
                                    className="flex-1 px-3 py-2 text-sm border rounded-md bg-gray-50 truncate"
                                />
                                <Button className="bg-white hover:bg-gray-300" onClick={handleCopyLink} variant="outline" size="icon">
                                    {copied ? <Check className="h-4 w-4 text-green-500" /> : <Copy className="h-4 w-4 text-black bg-white" />}
                                </Button>
                            </div>
                        ) : (
                            <Button className="rounded-full text-md px-5 py-5 -mb-3 cursor-pointer shadow-[inset_0_2px_8px_rgba(128,128,128,0.5)]"
                            onClick={handleShare} disabled={isSharing}>
                                <Share2 className="h-4 w-4 mr-2" />
                                {isSharing ? "Generating..." : "Share"}
                            </Button>
                        )}
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </>
    );
}
"use client"

import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger, DialogClose } from "@/components/ui/dialog";
import { useState, useRef, DragEvent } from "react";
import { X, Plus } from "lucide-react";
import { auth } from "@/firebase";
import { 
    showUploadingToast, 
    showUploadSuccessToast, 
    showUploadErrorToast,
    showBoxCreatingToast,
    showBoxCreatedToast,
    showBoxCreationErrorToast 
} from "@/components/UploadToast";

const BOX_IMAGES = [
    '/boximgs/Bag.png',
    '/boximgs/CarboardBox.png',
    '/boximgs/Container1.png',
    '/boximgs/Container2.png',
    '/boximgs/SDcard.png',
    '/boximgs/SlackBox.png',
    '/boximgs/TechBox.png',
    '/boximgs/TinderBox.png',
];

const getRandomBoxImage = () => BOX_IMAGES[Math.floor(Math.random() * BOX_IMAGES.length)];

interface FileWithPreview extends File {
    preview?: string;
}

interface BoxData {
    boxId: string;
    boxName: string;
    boxImage: string;
    ownerId: string;
    status: boolean;
    createdAt: number;
}

interface NewBoxProps {
    onBoxCreated?: (boxData: BoxData) => void;
}

export default function NewBox({ onBoxCreated }: NewBoxProps) {
    const [boxName, setBoxName] = useState("");
    const [files, setFiles] = useState<FileWithPreview[]>([]);
    const [isDragging, setIsDragging] = useState(false);
    const [isCreating, setIsCreating] = useState(false);
    const [isOpen, setIsOpen] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const onClick = () => {
        Box();
    }

    const Box = async () => {
        if (files.length === 0) {
            return;
        }

        setIsCreating(true);

        try {
            // Get Firebase auth token
            const token = await auth.currentUser?.getIdToken();
            if (!token) {
                console.error("User not authenticated");
                setIsCreating(false);
                return;
            }

            // Insert box in DynamoDB
            const selectedBoxImage = getRandomBoxImage();
            const boxResponse = await fetch('/api/boxes', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ boxName, boxImage: selectedBoxImage })
            });

            if (!boxResponse.ok) {
                const errorData = await boxResponse.json();
                console.error("Failed to create box:", errorData);
                setIsCreating(false);
                return;
            }

            const boxData = await boxResponse.json();
            const boxId = boxData.boxId;

            // Show box creation toast
            showBoxCreatingToast(boxName);

            // Upload files directly to S3 using presigned URLs
            const uploadPromises = files.map(async (file) => {
                const fileContentType = file.type || 'application/octet-stream';
                
                // Get presigned URL from our API
                const presignedResponse = await fetch(`/api/boxes/${boxId}/files`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${token}`
                    },
                    body: JSON.stringify({
                        fileName: file.name,
                        contentType: fileContentType
                    })
                });

                if (!presignedResponse.ok) {
                    throw new Error(`Failed to get upload URL for ${file.name}`);
                }

                const { presignedUrl } = await presignedResponse.json();

                // Show uploading toast
                showUploadingToast(file.name);

                // Upload directly to S3 with matching Content-Type
                const uploadResponse = await fetch(presignedUrl, {
                    method: 'PUT',
                    headers: {
                        'Content-Type': fileContentType
                    },
                    body: file
                });

                if (!uploadResponse.ok) {
                    showUploadErrorToast(file.name);
                    throw new Error(`Failed to upload ${file.name}`);
                }

                // Show success toast
                showUploadSuccessToast(file.name);

                return file.name;
            });

            await Promise.all(uploadPromises);

            // Show success toast
            showBoxCreatedToast(boxName, files.length);

            // Notify parent about the new box
            if (onBoxCreated) {
                onBoxCreated(boxData);
            }

            // Reset form and close dialog after successful creation
            setBoxName("");
            setFiles([]);
            setIsOpen(false);
        } catch (error) {
            console.error("Error creating box:", error);
            showBoxCreationErrorToast();
        } finally {
            setIsCreating(false);
        }
    };

    const handleDragOver = (e: DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDragging(true);
    };

    const handleDragLeave = (e: DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDragging(false);
    };

    const handleDrop = (e: DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDragging(false);

        const droppedFiles = Array.from(e.dataTransfer.files);
        addFiles(droppedFiles);
    };

    const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files) {
            const selectedFiles = Array.from(e.target.files);
            addFiles(selectedFiles);
        }
    };

    const addFiles = async (newFiles: File[]) => {
        const filesWithPreview = await Promise.all(newFiles.map(async file => {
            const fileWithPreview = file as FileWithPreview;
            if (file.type.startsWith('image/')) {
                fileWithPreview.preview = URL.createObjectURL(file);
            } else if (file.type.startsWith('video/')) {
                fileWithPreview.preview = await generateVideoThumbnail(file);
            }
            return fileWithPreview;
        }));
        setFiles(prev => [...prev, ...filesWithPreview]);
    };

    const generateVideoThumbnail = (file: File): Promise<string> => {
        return new Promise((resolve) => {
            const video = document.createElement('video');
            video.preload = 'metadata';
            video.muted = true;
            video.playsInline = true;

            video.onloadeddata = () => {
                video.currentTime = Math.min(1, video.duration / 2);
            };

            video.onseeked = () => {
                const canvas = document.createElement('canvas');
                canvas.width = video.videoWidth;
                canvas.height = video.videoHeight;
                const ctx = canvas.getContext('2d');
                if (ctx) {
                    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
                    const thumbnail = canvas.toDataURL('image/jpeg', 0.7);
                    URL.revokeObjectURL(video.src);
                    resolve(thumbnail);
                } else {
                    URL.revokeObjectURL(video.src);
                    resolve('');
                }
            };

            video.onerror = () => {
                URL.revokeObjectURL(video.src);
                resolve('');
            };

            video.src = URL.createObjectURL(file);
        });
    };

    const removeFile = (index: number) => {
        setFiles(prev => {
            const newFiles = [...prev];
            if (newFiles[index].preview) {
                URL.revokeObjectURL(newFiles[index].preview!);
            }
            newFiles.splice(index, 1);
            return newFiles;
        });
    };

    const getFileIcon = (file: FileWithPreview) => {
        if (file.preview) {
            return <img src={file.preview} alt={file.name} className="w-full h-full object-cover rounded" />;
        }
        
        const extension = file.name.split('.').pop()?.toLowerCase();
        return (
            <div className="w-full h-full flex items-center justify-center bg-gray-100 rounded-xl">
                <span className="text-xs font-medium text-gray-500 uppercase">{extension}</span>
            </div>
        );
    };

    const formatFileSize = (bytes: number) => {
        if (bytes < 1024) return bytes + ' B';
        if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
        return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
    };

    return (
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogTrigger asChild>
                <button className="cursor-pointer rounded-full text-md text-black px-2 pr-4 py-2 bg-white shadow-[inset_0_2px_8px_rgba(128,128,128,0.5)] flex items-center gap-2">
                    <span className="flex items-center justify-center w-10 h-10 rounded-full bg-black shadow-[inset_0_2px_8px_rgba(128,128,128,1)]">
                        <Plus size={18} className="text-white" />
                    </span>
                    Create New
                </button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[1000px] sm:max-h-[600px] overflow-hidden bg-gray-100 rounded-4xl border-none backdrop-blur-md shadow-[inset_0_2px_8px_rgba(128,128,128,0.5)]">
                <DialogHeader>
                    <DialogTitle>
                        <input
                            id="boxName"
                            className="flex h-10 w-full mt-5 px-3 py-2 text-4xl font-bold focus:outline-none"
                            placeholder="Enter Box Name"
                            value={boxName}
                            onChange={(e) => setBoxName(e.target.value)}
                        />
                    </DialogTitle>
                </DialogHeader>
                
                <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleFileSelect}
                    multiple
                    className="hidden"
                />

                {files.length === 0 ? (
                    <div 
                        className={`flex flex-col items-center justify-center p-10 border-2 border-dashed rounded-4xl h-96 mt-5 cursor-pointer transition-colors ${
                            isDragging ? 'border-blue-500 bg-blue-50' : 'border-gray-400'
                        }`}
                        onDragOver={handleDragOver}
                        onDragLeave={handleDragLeave}
                        onDrop={handleDrop}
                        onClick={() => fileInputRef.current?.click()}
                    >
                        <img src="/images/Folder.png" className="w-50 h-auto mt-5 mb-5" alt="Folder Icon" />
                        <h1 className="font-bold text-2xl">Drag & Drop</h1>
                        <h1 className="font-thin text-sm text-gray-500">your files to upload or click to browse</h1>
                    </div>
                ) : (
                    <div 
                        className={`h-96 mt-5 border-2 border-dashed rounded-lg overflow-auto transition-colors ${
                            isDragging ? 'border-blue-500 bg-blue-50' : 'border-gray-300'
                        }`}
                        onDragOver={handleDragOver}
                        onDragLeave={handleDragLeave}
                        onDrop={handleDrop}
                    >
                        <div className="grid grid-cols-4 gap-3 p-4">
                            {files.map((file, index) => (
                                <div 
                                    key={index} 
                                    className="relative group bg-black rounded-2xl p-2 shadow-[inset_0_2px_8px_rgba(128,128,128,1)] hover:shadow-md transition-shadow"
                                >
                                    <button
                                        onClick={() => removeFile(index)}
                                        className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity z-10 cursor-pointer"
                                    >
                                        <X size={14} />
                                    </button>
                                    <div className="aspect-square mb-2 flex items-center justify-center bg-gray-200 rounded-2xl">
                                        {getFileIcon(file)}
                                    </div>
                                    <p className="ml-2 text-sm text-white font-regular truncate" title={file.name}>{file.name}</p>
                                    <p className="ml-2 text-xs text-gray-500">{formatFileSize(file.size)}</p>
                                </div>
                            ))}
                            <div 
                                className="aspect-square border-2 border-dashed border-gray-300 rounded-xl flex items-center justify-center cursor-pointer hover:border-gray-400 transition-colors"
                                onClick={() => fileInputRef.current?.click()}
                            >
                                <span className="text-4xl text-gray-400">+</span>
                            </div>
                        </div>
                    </div>
                )}

                <DialogFooter>
                    <Button className="rounded-full text-md px-5 py-5 -mb-3 cursor-pointer shadow-[inset_0_2px_8px_rgba(128,128,128,0.5)]"
                    onClick={Box} type="submit" disabled={isCreating || files.length === 0}>
                        {isCreating ? "Creating..." : "Create Box"}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
"use client";

import { toast } from "sonner";

interface FileUploadStatus {
    fileName: string;
    status: 'pending' | 'uploading' | 'done' | 'error';
}

// Create a toast for file upload with loading state
export const showUploadingToast = (fileName: string) => {
    return toast.loading(`Uploading ${fileName}...`, {
        id: `upload-${fileName}`,
    });
};

// Update toast to success state
export const showUploadSuccessToast = (fileName: string) => {
    toast.success(`${fileName} uploaded`, {
        id: `upload-${fileName}`,
    });
};

// Update toast to error state
export const showUploadErrorToast = (fileName: string) => {
    toast.error(`Failed to upload ${fileName}`, {
        id: `upload-${fileName}`,
    });
};

// Show box creation started toast
export const showBoxCreatingToast = (boxName: string) => {
    return toast.loading(`Creating box "${boxName || 'Untitled'}"...`, {
        id: 'box-creation',
    });
};

// Show box creation success toast
export const showBoxCreatedToast = (boxName: string, fileCount: number) => {
    toast.success(`Box ${boxName || 'Untitled'} created!`, {
        id: 'box-creation',
    });
};

// Show box creation error toast
export const showBoxCreationErrorToast = (error?: string) => {
    toast.error("Failed to create box", {
        id: 'box-creation',
    });
};

// Dismiss all upload toasts
export const dismissUploadToasts = (fileNames: string[]) => {
    fileNames.forEach(fileName => {
        toast.dismiss(`upload-${fileName}`);
    });
};

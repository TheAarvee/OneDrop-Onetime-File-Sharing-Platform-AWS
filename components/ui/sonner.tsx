"use client"

import {
  Loader2Icon,
} from "lucide-react"
import { 
  CheckCircleIcon,
  InformationCircleIcon,
  ExclamationTriangleIcon,
  XCircleIcon } from "@heroicons/react/24/solid"
import { useTheme } from "next-themes"
import { Toaster as Sonner, type ToasterProps } from "sonner"

const Toaster = ({ ...props }: ToasterProps) => {
  const { theme = "system" } = useTheme()

  return (
    <Sonner
      theme={theme as ToasterProps["theme"]}
      className="toaster group"
      icons={{
        success: <CheckCircleIcon className="size-6 text-green-500" />,
        info: <InformationCircleIcon className="size-6" />,
        warning: <ExclamationTriangleIcon className="size-4 text-yellow-500" />,
        error: <XCircleIcon className="size-4 text-red-500" />,
        loading: <Loader2Icon className="size-4 animate-spin" />,
      }}
      toastOptions={{
        classNames: {
          toast: "bg-white border border-gray-200 shadow-lg rounded-lg p-4",
          title: "text-gray-900 font-medium text-sm",
          description: "text-black text-xs mt-1",
          success: "bg-white border-green-200",
          error: "bg-white border-red-200",
          loading: "bg-white border-gray-200",
        },
      }}
      style={
        {
          "--normal-bg": "#ffffff",
          "--normal-text": "#000000",
          "--normal-border": "#e5e7eb",
          "--border-radius": "0.75rem",
        } as React.CSSProperties
      }
      {...props}
    />
  )
}

export { Toaster }

"use client"

import type React from "react"

import { useState, useRef } from "react"
import { X, Camera, ImageIcon } from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import Image from "next/image"

interface ImageUploadProps {
  value?: string
  onChange: (value: string) => void
  className?: string
  placeholder?: string
  accept?: string
  maxSize?: number // in MB
}

export function ImageUpload({
  value,
  onChange,
  className,
  placeholder = "Clique para adicionar uma imagem",
  accept = "image/*",
  maxSize = 5,
}: ImageUploadProps) {
  const [isDragging, setIsDragging] = useState(false)
  const [isUploading, setIsUploading] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleFileSelect = async (file: File) => {
    if (file.size > maxSize * 1024 * 1024) {
      alert(`Arquivo muito grande. Máximo ${maxSize}MB`)
      return
    }

    if (!file.type.startsWith("image/")) {
      alert("Por favor, selecione apenas arquivos de imagem")
      return
    }

    try {
      setIsUploading(true)

      // Simular upload - em produção seria uma chamada real para API
      const reader = new FileReader()
      reader.onload = (e) => {
        const result = e.target?.result as string
        onChange(result)
        setIsUploading(false)
      }
      reader.readAsDataURL(file)
    } catch (error) {
      console.error("Erro no upload:", error)
      alert("Erro ao fazer upload da imagem")
      setIsUploading(false)
    }
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)

    const files = Array.from(e.dataTransfer.files)
    if (files.length > 0) {
      handleFileSelect(files[0])
    }
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(true)
  }

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
  }

  const handleClick = () => {
    fileInputRef.current?.click()
  }

  const handleRemove = () => {
    onChange("")
  }

  return (
    <div className={cn("w-full", className)}>
      <input
        ref={fileInputRef}
        type="file"
        accept={accept}
        onChange={(e) => {
          const file = e.target.files?.[0]
          if (file) handleFileSelect(file)
        }}
        className="hidden"
      />

      {value ? (
        <div className="relative group">
          <div className="relative w-full h-48 rounded-lg overflow-hidden border">
            <Image src={value || "/placeholder.svg"} alt="Preview" fill className="object-cover" />
          </div>
          <div className="absolute inset-0 bg-black bg-opacity-50 opacity-0 group-hover:opacity-100 transition-opacity rounded-lg flex items-center justify-center">
            <div className="flex space-x-2">
              <Button variant="secondary" size="sm" onClick={handleClick} disabled={isUploading}>
                <Camera className="h-4 w-4 mr-2" />
                Alterar
              </Button>
              <Button variant="destructive" size="sm" onClick={handleRemove} disabled={isUploading}>
                <X className="h-4 w-4 mr-2" />
                Remover
              </Button>
            </div>
          </div>
        </div>
      ) : (
        <div
          className={cn(
            "border-2 border-dashed border-gray-300 rounded-lg p-6 text-center cursor-pointer transition-colors hover:border-gray-400",
            isDragging && "border-orange-500 bg-orange-50",
            isUploading && "opacity-50 cursor-not-allowed",
          )}
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onClick={handleClick}
        >
          {isUploading ? (
            <div className="flex flex-col items-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-600 mb-2"></div>
              <p className="text-sm text-gray-600">Fazendo upload...</p>
            </div>
          ) : (
            <div className="flex flex-col items-center">
              <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mb-3">
                <ImageIcon className="h-6 w-6 text-gray-400" />
              </div>
              <p className="text-sm font-medium text-gray-900 mb-1">{placeholder}</p>
              <p className="text-xs text-gray-500">Arraste e solte ou clique para selecionar</p>
              <p className="text-xs text-gray-400 mt-1">PNG, JPG até {maxSize}MB</p>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

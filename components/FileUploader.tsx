"use client";
import { useCallback, useState } from 'react';
import { Upload, X, Image as ImageIcon } from 'lucide-react';
import { cn } from '@/lib/utils';
import { motion, AnimatePresence } from 'framer-motion';

interface FileUploaderProps {
    onFileSelect: (file: File) => void;
    selectedFile: File | null;
    onClear: () => void;
}

export function FileUploader({ onFileSelect, selectedFile, onClear }: FileUploaderProps) {
    const [isDragActive, setIsDragActive] = useState(false);
    const [previewUrl, setPreviewUrl] = useState<string | null>(null);

    // Handle file selection
    const handleFile = (file: File) => {
        if (file && file.type.startsWith('image/')) {
            onFileSelect(file);
            const reader = new FileReader();
            reader.onloadend = () => {
                setPreviewUrl(reader.result as string);
            };
            reader.readAsDataURL(file);
        }
    };

    const onDrop = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        setIsDragActive(false);
        if (e.dataTransfer.files && e.dataTransfer.files[0]) {
            handleFile(e.dataTransfer.files[0]);
        }
    }, []);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            handleFile(e.target.files[0]);
        }
    };

    // Clear preview when file is removed
    if (!selectedFile && previewUrl) {
        setPreviewUrl(null);
    }

    return (
        <div className="w-full max-w-md mx-auto">
            <AnimatePresence mode="wait">
                {!selectedFile ? (
                    <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        className="flex flex-col gap-6"
                    >
                        <div
                            className={cn(
                                "relative group cursor-pointer flex flex-col items-center justify-center w-full h-64 rounded-3xl border-2 border-dashed transition-all duration-300",
                                isDragActive
                                    ? "border-indigo-500 bg-indigo-50/50 scale-[1.02]"
                                    : "border-gray-300 hover:border-indigo-400 hover:bg-gray-50/50 bg-white/40"
                            )}
                            onDragOver={(e) => { e.preventDefault(); setIsDragActive(true); }}
                            onDragLeave={() => setIsDragActive(false)}
                            onDrop={onDrop}
                        >
                            <input
                                type="file"
                                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                                onChange={handleChange}
                                accept="image/*"
                            />

                            <div className="flex flex-col items-center justify-center pt-5 pb-6 text-center px-4">
                                <div className={cn(
                                    "p-4 rounded-full mb-4 transition-colors duration-300",
                                    isDragActive ? "bg-indigo-100 text-indigo-600" : "bg-gray-100 text-gray-400 group-hover:text-indigo-500 group-hover:bg-indigo-50"
                                )}>
                                    <Upload className="w-8 h-8" />
                                </div>
                                <p className="mb-2 text-lg font-medium text-gray-700">
                                    <span className="text-indigo-600">Click to upload</span> or drag and drop
                                </p>
                                <p className="text-sm text-gray-500">
                                    SVG, PNG, JPG or GIF (max. 800x400px)
                                </p>
                            </div>
                        </div>

                        {/* Example Selection Section */}
                        <div className="text-center">
                            <p className="text-sm text-gray-500 mb-3 uppercase tracking-wider font-semibold">
                                Or try with an example
                            </p>
                            <div className="flex justify-center gap-4">
                                <button
                                    onClick={async () => {
                                        try {
                                            const response = await fetch('/child.jpg');
                                            const blob = await response.blob();
                                            const file = new File([blob], "child.jpg", { type: "image/jpeg" });
                                            handleFile(file);
                                        } catch (error) {
                                            console.error("Failed to load example image", error);
                                        }
                                    }}
                                    className="group relative w-16 h-16 rounded-xl overflow-hidden cursor-pointer shadow-sm hover:shadow-md transition-all hover:scale-105 ring-2 ring-transparent hover:ring-indigo-400"
                                >
                                    {/* eslint-disable-next-line @next/next/no-img-element */}
                                    <img src="/child.jpg" alt="Example" className="w-full h-full object-cover" />
                                </button>
                            </div>
                        </div>
                    </motion.div>
                ) : (
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="relative w-full h-64 rounded-3xl overflow-hidden shadow-lg group bg-gray-100"
                    >
                        {previewUrl ? (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img src={previewUrl} alt="Preview" className="w-full h-full object-cover" />
                        ) : (
                            <div className="flex items-center justify-center w-full h-full bg-gray-100 text-gray-400">
                                <ImageIcon className="w-12 h-12" />
                            </div>
                        )}

                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                            <button
                                onClick={(e) => {
                                    e.stopPropagation();
                                    onClear();
                                    setPreviewUrl(null);
                                }}
                                className="bg-white/90 p-3 rounded-full text-red-500 hover:text-red-700 hover:scale-110 transition-all shadow-lg"
                            >
                                <X className="w-6 h-6" />
                            </button>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}


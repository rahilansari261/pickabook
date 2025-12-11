"use client";
import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FileUploader } from './FileUploader';
import { Button } from './ui/Button';
import { Card } from './ui/Card';
import { Sparkles, ArrowRight, RefreshCw, Download, Wand2 } from 'lucide-react';
import { cn } from '@/lib/utils';
// eslint-disable-next-line @next/next/no-img-element

type Step = 'upload' | 'processing' | 'result';

export function PersonalizationFlow() {
    const [step, setStep] = useState<Step>('upload');
    const [file, setFile] = useState<File | null>(null);
    const [previewUrl, setPreviewUrl] = useState<string | null>(null);
    const [progress, setProgress] = useState(0);

    const handleFileSelect = (selectedFile: File) => {
        setFile(selectedFile);
        const reader = new FileReader();
        reader.onloadend = () => setPreviewUrl(reader.result as string);
        reader.readAsDataURL(selectedFile);
    };

    const startPersonalization = () => {
        if (!file) return;
        setStep('processing');
        setProgress(0);
    };

    // Simulate AI processing
    useEffect(() => {
        if (step === 'processing') {
            const interval = setInterval(() => {
                setProgress((prev) => {
                    if (prev >= 100) {
                        clearInterval(interval);
                        setTimeout(() => setStep('result'), 500);
                        return 100;
                    }
                    return prev + 2; // 50 ticks * (interval roughly) -> ~2-3 seconds
                });
            }, 50);
            return () => clearInterval(interval);
        }
    }, [step]);

    const resetParams = () => {
        setFile(null);
        setPreviewUrl(null);
        setStep('upload');
        setProgress(0);
    };

    return (
        <div className="w-full max-w-4xl mx-auto p-4 md:p-8">
            <Card className="p-8 md:p-12 min-h-[600px] flex flex-col items-center justify-center relative overflow-hidden border-indigo-100 bg-white/80 shadow-2xl rounded-3xl">

                {/* Background decorative blobs */}
                <div className="absolute top-0 left-0 w-64 h-64 bg-purple-200 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob" />
                <div className="absolute top-0 right-0 w-64 h-64 bg-yellow-200 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob animation-delay-2000" />
                <div className="absolute bottom-[-100px] left-20 w-80 h-80 bg-pink-200 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob animation-delay-4000" />

                <AnimatePresence mode="wait">
                    {step === 'upload' && (
                        <motion.div
                            key="upload"
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -20 }}
                            className="w-full flex flex-col items-center z-10"
                        >
                            <div className="text-center mb-8">
                                <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4 tracking-tight">
                                    Magic Storybook Maker
                                </h2>
                                <p className="text-gray-600 text-lg max-w-md mx-auto">
                                    Upload a photo of your child and watch them become part of the story!
                                </p>
                            </div>

                            <FileUploader
                                onFileSelect={handleFileSelect}
                                selectedFile={file}
                                onClear={() => setFile(null)}
                            />

                            <div className="mt-8 h-12">
                                <AnimatePresence>
                                    {file && (
                                        <motion.div
                                            initial={{ opacity: 0, y: 10 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            exit={{ opacity: 0, y: 10 }}
                                        >
                                            <Button
                                                size="lg"
                                                onClick={startPersonalization}
                                                className="bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 shadow-xl shadow-indigo-200 text-white border-0"
                                            >
                                                <Wand2 className="mr-2 h-5 w-5" />
                                                Create Magic
                                            </Button>
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                            </div>
                        </motion.div>
                    )}

                    {step === 'processing' && (
                        <motion.div
                            key="processing"
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 1.1 }}
                            className="w-full flex flex-col items-center justify-center z-10"
                        >
                            <div className="relative w-32 h-32 mb-8">
                                <div className="absolute inset-0 border-4 border-indigo-100 rounded-full" />
                                <motion.div
                                    className="absolute inset-0 border-4 border-indigo-600 rounded-full border-t-transparent"
                                    animate={{ rotate: 360 }}
                                    transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                                />
                                <div className="absolute inset-0 flex items-center justify-center">
                                    <Sparkles className="w-10 h-10 text-indigo-500 animate-pulse" />
                                </div>
                            </div>

                            <h3 className="text-2xl font-bold text-gray-800 mb-2">Weaving the Magic...</h3>
                            <p className="text-gray-500 mb-8">Transforming your photo into an illustration</p>

                            <div className="w-full max-w-md bg-gray-100 rounded-full h-3 overflow-hidden">
                                <motion.div
                                    className="h-full bg-gradient-to-r from-indigo-500 to-purple-500"
                                    initial={{ width: 0 }}
                                    animate={{ width: `${progress}%` }}
                                />
                            </div>
                            <p className="text-sm text-gray-400 mt-2">{progress}% completed</p>
                        </motion.div>
                    )}

                    {step === 'result' && previewUrl && (
                        <motion.div
                            key="result"
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            className="w-full flex flex-col items-center z-10"
                        >
                            <div className="text-center mb-6">
                                <h2 className="text-3xl font-bold text-gray-900 mb-2 relative inline-flex items-center gap-2">
                                    <Sparkles className="w-6 h-6 text-yellow-500" />
                                    Your Magic Page!
                                    <Sparkles className="w-6 h-6 text-yellow-500" />
                                </h2>
                                <p className="text-gray-600">Your child is now the star of the story.</p>
                            </div>

                            {/* Result Composition */}
                            <div className="relative w-full max-w-2xl aspect-video rounded-2xl overflow-hidden shadow-2xl border-4 border-white mb-8 group">
                                {/* Background Template */}
                                <img
                                    src="/template.png"
                                    alt="Story Template"
                                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                                />

                                {/* Overlaying the User Photo (Simulated "Integration") */}
                                {/* In a real app, this would be the output from SDXL/InstantID */}
                                {/* Here we simulate it by placing it nicely with a blend mode or mask */}
                                <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-1/3 aspect-square rounded-full overflow-hidden border-4 border-white/50 shadow-inner">
                                    <img
                                        src={previewUrl}
                                        alt="Child"
                                        className="w-full h-full object-cover mix-blend-hard-light opacity-90 sepia-[.3]"
                                    />
                                    {/* Artistic Overlay to make it look "painted" */}
                                    <div className="absolute inset-0 bg-gradient-to-tr from-indigo-500/20 to-yellow-500/20 mix-blend-overlay" />
                                </div>

                                <div className="absolute bottom-4 right-4 bg-black/60 text-white px-3 py-1 rounded-full text-xs backdrop-blur-sm">
                                    AI Generated Preview
                                </div>
                            </div>

                            <div className="flex gap-4">
                                <Button variant="outline" onClick={resetParams}>
                                    <RefreshCw className="mr-2 h-4 w-4" />
                                    Try Another Photo
                                </Button>
                                <Button className="bg-indigo-600 hover:bg-indigo-700 text-white shadow-lg shadow-indigo-200">
                                    <Download className="mr-2 h-4 w-4" />
                                    Download Page
                                </Button>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </Card>
        </div>
    );
}

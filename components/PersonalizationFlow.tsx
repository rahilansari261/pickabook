"use client";
import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FileUploader } from './FileUploader';
import { Button } from './ui/Button';
import { Card } from './ui/Card';
import { Sparkles, ArrowRight, RefreshCw, Download, Wand2, Loader2, Settings2 } from 'lucide-react';
import { cn } from '@/lib/utils';

// Configuration for the Lambda/Model
const DEFAULT_INPUT = {
    prompt: "arafed image of a little child pixar portrait 8 k photo, maya 8 k, adorable digital painting, cute 3 d render, 8k portrait render, cute cartoon character, small character. unreal engine 5, pixar renderman render, cute pixar character, pixar cute character design, cute character, arnold maya render",
    verbose: false,
    scheduler: "EulerDiscreteScheduler",
    enable_lcm: false,
    force_clip: false,
    // input_image: null, // Set dynamically
    num_outputs: 1,
    debug_images: false,
    sdxl_weights: "RealVisXL_V5.0",
    guidance_scale: 5,
    megapixel_count: 1,
    negative_prompt:
        "nsfw, nude, blurry, out of focus, low quality, disfigured, deformed, watermark, text, logo, signature, mutated, jpeg artifacts",
    ip_adapter_scale: 0.8,
    lcm_guidance_scale: 1.5,
    num_inference_steps: 30,
    disable_nsfw_checker: false,
    enhance_nonface_region: true,
    img2img_canny_strength: 0.45,
    img2img_depth_strength: 0.85,
    instantid_pose_strength: 0,
    lcm_num_inference_steps: 5,
    instantid_canny_strength: 0,
    instantid_depth_strength: 0.3,
    identitynet_strength_ratio: 0.8
};

type Step = 'upload' | 'processing' | 'result';

export function PersonalizationFlow() {
    const [config, setConfig] = useState(DEFAULT_INPUT);
    const [step, setStep] = useState<Step>('upload');
    const [file, setFile] = useState<File | null>(null);
    const [previewUrl, setPreviewUrl] = useState<string | null>(null);
    const [generatedImage, setGeneratedImage] = useState<string | null>(null);
    const [progress, setProgress] = useState(0);
    const [isDownloading, setIsDownloading] = useState(false);

    const resultRef = useRef<HTMLDivElement>(null);

    const handleFileSelect = (selectedFile: File) => {
        setFile(selectedFile);
        const reader = new FileReader();
        reader.onloadend = () => setPreviewUrl(reader.result as string);
        reader.readAsDataURL(selectedFile);
    };

    const handleConfigChange = (key: keyof typeof DEFAULT_INPUT, value: any) => {
        setConfig(prev => ({ ...prev, [key]: value }));
    };

    const startPersonalization = async () => {
        if (!file || !previewUrl) return;

        setStep('processing');
        setProgress(0);
        setGeneratedImage(null);

        // Start progress simulation
        const progressInterval = setInterval(() => {
            setProgress((prev) => {
                if (prev >= 95) return 95;
                return prev + 2;
            });
        }, 300);

        try {

            // Prepare payload
            const inputPayload = {
                ...config,
                input_image: previewUrl,
            };

            const response = await fetch("https://snikx467245xedeejcwqled3f40anzvx.lambda-url.us-east-1.on.aws/", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({ ...inputPayload })
            });

            const data = await response.json();
            console.log(data);

            clearInterval(progressInterval);

            if (data.success && data.image_url) {
                setProgress(100);
                setGeneratedImage(data.image_url);
                setTimeout(() => setStep('result'), 500);
            } else {
                console.error("Error generating image:", data.error);
                alert("Failed to generate image. Please try again.");
                setStep('upload');
            }

        } catch (error) {
            clearInterval(progressInterval);
            console.error("Network/Server Error:", error);
            alert("An error occurred while connecting to the server.");
            setStep('upload');
        }
    };

    const handleDownload = async () => {
        if (!generatedImage) return;

        try {
            setIsDownloading(true);
            const response = await fetch(generatedImage);
            const blob = await response.blob();
            const url = window.URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            link.download = "pickabook-survivor.png";
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            window.URL.revokeObjectURL(url);
        } catch (err) {
            console.error("Download failed:", err);
            // Fallback for CORS or other issues: open in new tab
            window.open(generatedImage, '_blank');
        } finally {
            setIsDownloading(false);
        }
    };

    const resetParams = () => {
        setFile(null);
        setPreviewUrl(null);
        setGeneratedImage(null);
        setStep('upload');
        setProgress(0);
        setIsDownloading(false);
    };

    // Helper for rendering config inputs
    const renderConfigInput = (key: keyof typeof DEFAULT_INPUT, type: 'text' | 'number' | 'checkbox' | 'range' | 'textarea' = 'text', options?: any) => {
        const value = config[key];

        if (type === 'checkbox') {
            return (
                <div className="flex items-center gap-2 py-1">
                    <input
                        type="checkbox"
                        checked={value as boolean}
                        onChange={(e) => handleConfigChange(key, e.target.checked)}
                        id={`config-${key}`}
                        className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500 w-4 h-4 cursor-pointer"
                    />
                    <label htmlFor={`config-${key}`} className="text-xs font-medium text-gray-700 cursor-pointer select-none">{key}</label>
                </div>
            );
        }

        if (type === 'textarea') {
            return (
                <div className="py-2">
                    <label className="block text-xs font-bold text-gray-700 mb-1 uppercase tracking-wide">{key.replace(/_/g, ' ')}</label>
                    <textarea
                        value={value as string}
                        onChange={(e) => handleConfigChange(key, e.target.value)}
                        className="w-full text-xs p-3 rounded-lg border border-gray-200 bg-white text-gray-900 placeholder-gray-400 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all min-h-[80px] shadow-sm resize-y"
                    />
                </div>
            );
        }

        return (
            <div className="py-2">
                <label className="block text-xs font-bold text-gray-700 mb-1 uppercase tracking-wide">{key.replace(/_/g, ' ')}</label>
                <input
                    type={type}
                    value={value as string | number}
                    onChange={(e) => handleConfigChange(key, type === 'number' || type === 'range' ? parseFloat(e.target.value) : e.target.value)}
                    className={cn(
                        "w-full text-xs p-2 rounded-lg border border-gray-200 bg-white text-gray-900 placeholder-gray-400 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all shadow-sm",
                        type === 'range' ? "cursor-pointer h-2 bg-gray-200 rounded-lg appearance-none" : ""
                    )}
                    {...options}
                />
            </div>
        );
    };

    return (
        <div className="flex flex-col-reverse lg:flex-row gap-6 w-full max-w-7xl mx-auto p-4 md:p-8 items-start">

            {/* Sidebar Configuration Panel */}
            <div className="w-full lg:w-1/3 bg-white p-6 rounded-3xl shadow-xl border border-indigo-50 lg:sticky lg:top-4 max-h-none lg:max-h-[calc(100vh-2rem)] overflow-y-auto scrollbar-thin scrollbar-thumb-indigo-200 scrollbar-track-transparent">
                <div className="flex items-center gap-2 mb-6 pb-4 border-b border-gray-100">
                    <div className="p-2 bg-indigo-100 rounded-lg">
                        <Settings2 className="w-5 h-5 text-indigo-600" />
                    </div>
                    <h3 className="font-bold text-gray-900 text-lg">Model Settings</h3>
                </div>

                <div className="space-y-2">
                    {renderConfigInput('prompt', 'textarea')}
                    {renderConfigInput('negative_prompt', 'textarea')}

                    <div className="grid grid-cols-2 gap-4">
                        {renderConfigInput('guidance_scale', 'number', { step: 0.1 })}
                        {renderConfigInput('num_inference_steps', 'number')}
                    </div>

                    {renderConfigInput('sdxl_weights', 'text')}
                    {renderConfigInput('scheduler', 'text')}

                    <div className="grid grid-cols-2 gap-4">
                        {renderConfigInput('ip_adapter_scale', 'number', { step: 0.1, max: 1.5 })}
                        {renderConfigInput('identitynet_strength_ratio', 'number', { step: 0.1, max: 1.5 })}
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        {renderConfigInput('img2img_canny_strength', 'number', { step: 0.05 })}
                        {renderConfigInput('img2img_depth_strength', 'number', { step: 0.05 })}
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        {renderConfigInput('instantid_canny_strength', 'number', { step: 0.1, max: 1 })}
                        {renderConfigInput('instantid_depth_strength', 'number', { step: 0.1, max: 1 })}
                    </div>

                    {renderConfigInput('lcm_guidance_scale', 'number', { step: 0.1 })}
                    {renderConfigInput('lcm_num_inference_steps', 'number')}

                    {renderConfigInput('instantid_pose_strength', 'number', { step: 0.1 })}
                    {renderConfigInput('num_outputs', 'number')}
                    {renderConfigInput('megapixel_count', 'number')}

                    <div className="pt-4 space-y-3 border-t border-gray-100 mt-6 bg-gray-50/50 p-4 rounded-xl">
                        <h4 className="text-xs font-bold text-indigo-600 uppercase tracking-wider mb-2">Refinements</h4>
                        {renderConfigInput('enable_lcm', 'checkbox')}
                        {renderConfigInput('force_clip', 'checkbox')}
                        {renderConfigInput('debug_images', 'checkbox')}
                        {renderConfigInput('disable_nsfw_checker', 'checkbox')}
                        {renderConfigInput('enhance_nonface_region', 'checkbox')}
                        {renderConfigInput('verbose', 'checkbox')}
                    </div>
                </div>
            </div>

            {/* Main Content Area */}
            <div className="w-full lg:w-2/3">
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

                                <h3 className="2xl font-bold text-gray-800 mb-2">Weaving the Magic...</h3>
                                <p className="text-gray-500 mb-8">Transforming your photo into an illustration</p>

                                <div className="w-full max-w-md bg-gray-100 rounded-full h-3 overflow-hidden">
                                    <motion.div
                                        className="h-full bg-gradient-to-r from-indigo-500 to-purple-500"
                                        initial={{ width: 0 }}
                                        animate={{ width: `${progress}% ` }}
                                    />
                                </div>
                                <p className="text-sm text-gray-400 mt-2">{progress}% completed</p>
                            </motion.div>
                        )}

                        {step === 'result' && generatedImage && (
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
                                <div
                                    ref={resultRef}
                                    className="relative w-full max-w-2xl aspect-square md:aspect-video rounded-2xl overflow-hidden shadow-2xl border-4 border-white mb-8 group bg-gray-100"
                                >
                                    {/* Generated Image */}
                                    {/* eslint-disable-next-line @next/next/no-img-element */}
                                    <img
                                        src={generatedImage}
                                        alt="Generated Story"
                                        className="w-full h-full object-contain"
                                    />

                                    <div className="absolute bottom-4 right-4 bg-black/60 text-white px-3 py-1 rounded-full text-xs backdrop-blur-sm z-20">
                                        AI Personalization Prototype
                                    </div>
                                </div>

                                <div className="flex gap-4">
                                    <Button variant="outline" onClick={resetParams}>
                                        <RefreshCw className="mr-2 h-4 w-4" />
                                        Try Another Photo
                                    </Button>
                                    <Button
                                        onClick={handleDownload}
                                        disabled={isDownloading}
                                        className="bg-indigo-600 hover:bg-indigo-700 text-white shadow-lg shadow-indigo-200"
                                    >
                                        {isDownloading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Download className="mr-2 h-4 w-4" />}
                                        {isDownloading ? 'Saving...' : 'Download Page'}
                                    </Button>
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </Card>
            </div>
        </div>
    );
}


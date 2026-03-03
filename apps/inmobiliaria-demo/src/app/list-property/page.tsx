'use client';
import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

export default function ListPropertyPage() {
    const [formData, setFormData] = useState({
        title: '',
        price: '',
        location: '',
        bedrooms: '',
        bathrooms: '',
        type: 'Villa',
        description: '',
        images: [] as string[]
    });

    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isSuccess, setIsSuccess] = useState(false);
    const [error, setError] = useState('');

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        // Simulated mock files since demo limits actual upload constraints
        if (e.target.files) {
            setFormData(prev => ({
                ...prev,
                images: [...prev.images, ...Array.from(e.target.files!).map(f => f.name)]
            }));
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);
        setError('');

        try {
            const response = await fetch('/api/properties', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData)
            });

            const resData = await response.json();
            if (!response.ok) {
                throw new Error(resData.error || 'Failed to submit property');
            }

            setIsSuccess(true);
        } catch (err: any) {
            setError(err.message || 'Something went wrong connecting to DDBB.');
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="min-h-screen bg-[#050505] text-[#D4D4D4] pt-32 pb-16 font-inter">
            <div className="container mx-auto px-4 max-w-4xl">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8 }}
                    className="text-center mb-16"
                >
                    <h1 className="text-4xl md:text-5xl font-playfair font-bold text-white mb-4 tracking-tight">
                        List Your <span className="text-[#CBAA61] italic">Extraordinary</span> Property
                    </h1>
                    <p className="text-[#A0A0A0] text-lg font-light">
                        Entrust us with your masterpiece and reach our global clientele of elite buyers.
                    </p>
                </motion.div>

                <AnimatePresence mode="wait">
                    {isSuccess ? (
                        <motion.div
                            key="success"
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0 }}
                            className="bg-[#111111] border border-[#CBAA61]/30 p-12 rounded-xl text-center space-y-6"
                        >
                            <div className="w-20 h-20 bg-[#CBAA61]/10 rounded-full flex items-center justify-center mx-auto mb-6">
                                <svg className="w-10 h-10 text-[#CBAA61]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                </svg>
                            </div>
                            <h2 className="text-3xl font-playfair text-white">Property Submitted Successfully</h2>
                            <p className="text-[#A0A0A0] max-w-lg mx-auto">
                                Your exquisite listing has been securely recorded to our database. Our advisory team will review the details and contact you shortly to coordinate the presentation strategy.
                            </p>
                            <button
                                onClick={() => {
                                    setIsSuccess(false);
                                    setFormData({ title: '', price: '', location: '', bedrooms: '', bathrooms: '', type: 'Villa', description: '', images: [] });
                                }}
                                className="mt-8 px-8 py-3 bg-[#CBAA61] hover:bg-[#B3934A] text-[#050505] font-medium rounded-sm transition-colors duration-300 tracking-wider text-sm uppercase"
                            >
                                Submit Another Listing
                            </button>
                        </motion.div>
                    ) : (
                        <motion.form
                            key="form"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onSubmit={handleSubmit}
                            className="bg-[#0A0A0A] border border-[#1A1A1A] p-8 md:p-12 rounded-xl space-y-8"
                        >
                            {error && (
                                <div className="bg-red-500/10 border border-red-500/30 text-red-400 p-4 rounded-md text-sm">
                                    {error}
                                </div>
                            )}

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                <div className="space-y-2">
                                    <label className="text-sm font-medium text-[#A0A0A0] uppercase tracking-wider">Property Title</label>
                                    <input
                                        type="text"
                                        name="title"
                                        required
                                        value={formData.title}
                                        onChange={handleInputChange}
                                        className="w-full bg-[#111111] border border-[#222222] rounded-sm p-4 text-white focus:outline-none focus:border-[#CBAA61] transition-colors"
                                        placeholder="e.g. Ultra-Luxury Penthouse at Palm Jumeirah"
                                    />
                                </div>

                                <div className="space-y-2">
                                    <label className="text-sm font-medium text-[#A0A0A0] uppercase tracking-wider">Price (AED)</label>
                                    <input
                                        type="number"
                                        name="price"
                                        required
                                        min="1000000"
                                        value={formData.price}
                                        onChange={handleInputChange}
                                        className="w-full bg-[#111111] border border-[#222222] rounded-sm p-4 text-white focus:outline-none focus:border-[#CBAA61] transition-colors"
                                        placeholder="e.g. 150000000"
                                    />
                                </div>

                                <div className="space-y-2">
                                    <label className="text-sm font-medium text-[#A0A0A0] uppercase tracking-wider">Location / Neighborhood</label>
                                    <input
                                        type="text"
                                        name="location"
                                        required
                                        value={formData.location}
                                        onChange={handleInputChange}
                                        className="w-full bg-[#111111] border border-[#222222] rounded-sm p-4 text-white focus:outline-none focus:border-[#CBAA61] transition-colors"
                                        placeholder="e.g. Emirates Hills"
                                    />
                                </div>

                                <div className="space-y-2">
                                    <label className="text-sm font-medium text-[#A0A0A0] uppercase tracking-wider">Property Type</label>
                                    <select
                                        name="type"
                                        value={formData.type}
                                        onChange={handleInputChange}
                                        className="w-full bg-[#111111] border border-[#222222] rounded-sm p-4 text-white focus:outline-none focus:border-[#CBAA61] transition-colors appearance-none"
                                    >
                                        <option value="Villa">Villa</option>
                                        <option value="Penthouse">Penthouse</option>
                                        <option value="Mansion">Mansion</option>
                                        <option value="Apartment">Apartment</option>
                                    </select>
                                </div>

                                <div className="space-y-2">
                                    <label className="text-sm font-medium text-[#A0A0A0] uppercase tracking-wider">Bedrooms</label>
                                    <input
                                        type="number"
                                        name="bedrooms"
                                        min="1"
                                        value={formData.bedrooms}
                                        onChange={handleInputChange}
                                        className="w-full bg-[#111111] border border-[#222222] rounded-sm p-4 text-white focus:outline-none focus:border-[#CBAA61] transition-colors"
                                        placeholder="e.g. 5"
                                    />
                                </div>

                                <div className="space-y-2">
                                    <label className="text-sm font-medium text-[#A0A0A0] uppercase tracking-wider">Bathrooms</label>
                                    <input
                                        type="number"
                                        name="bathrooms"
                                        min="1"
                                        value={formData.bathrooms}
                                        onChange={handleInputChange}
                                        className="w-full bg-[#111111] border border-[#222222] rounded-sm p-4 text-white focus:outline-none focus:border-[#CBAA61] transition-colors"
                                        placeholder="e.g. 6"
                                    />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label className="text-sm font-medium text-[#A0A0A0] uppercase tracking-wider">Property Description</label>
                                <textarea
                                    name="description"
                                    required
                                    rows={5}
                                    value={formData.description}
                                    onChange={handleInputChange}
                                    className="w-full bg-[#111111] border border-[#222222] rounded-sm p-4 text-white focus:outline-none focus:border-[#CBAA61] transition-colors resize-none"
                                    placeholder="Describe the architectural uniqueness, amenities, and lifestyle..."
                                />
                            </div>

                            <div className="space-y-4">
                                <label className="text-sm font-medium text-[#A0A0A0] uppercase tracking-wider">High-Resolution Imagery</label>
                                <div className="border-2 border-dashed border-[#222222] rounded-sm p-8 text-center hover:bg-[#111111] transition-colors relative cursor-pointer group">
                                    <input
                                        type="file"
                                        multiple
                                        onChange={handleFileChange}
                                        className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
                                        accept="image/*"
                                    />
                                    <div className="space-y-2">
                                        <svg className="mx-auto h-12 w-12 text-[#A0A0A0] group-hover:text-[#CBAA61] transition-colors" stroke="currentColor" fill="none" viewBox="0 0 48 48" aria-hidden="true">
                                            <path d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
                                        </svg>
                                        <div className="text-sm text-[#A0A0A0]">
                                            <span className="text-[#CBAA61] font-medium">Click to upload</span> or drag and drop
                                        </div>
                                        <p className="text-xs text-[#666666]">PNG, JPG up to 10MB per file</p>
                                    </div>
                                </div>
                                {formData.images.length > 0 && (
                                    <div className="bg-[#111111] border border-[#222222] rounded-sm p-4">
                                        <p className="text-sm text-[#CBAA61] mb-2">{formData.images.length} files selected:</p>
                                        <ul className="text-xs text-[#A0A0A0] list-disc list-inside space-y-1">
                                            {formData.images.map((img, i) => <li key={i}>{img}</li>)}
                                        </ul>
                                    </div>
                                )}
                            </div>

                            <div className="pt-6 border-t border-[#1A1A1A]">
                                <button
                                    type="submit"
                                    disabled={isSubmitting}
                                    className="w-full bg-gradient-to-r from-[#CBAA61] to-[#D4B872] hover:from-[#B3934A] hover:to-[#CBAA61] text-[#050505] font-semibold py-4 rounded-sm transition-all duration-300 tracking-widest uppercase disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
                                >
                                    {isSubmitting ? (
                                        <>
                                            <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-[#050505]" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                            </svg>
                                            Submitting to Database...
                                        </>
                                    ) : (
                                        "Submit Property Portfolio"
                                    )}
                                </button>
                            </div>
                        </motion.form>
                    )}
                </AnimatePresence>
            </div>
        </div>
    );
}


import React, { useState, useCallback } from 'react';

interface FileUploadProps {
    onFilesSelected: (files: File[]) => void;
}

const UploadIcon: React.FC = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 text-brand-primary transition-transform duration-300" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
    </svg>
);


const FileUpload: React.FC<FileUploadProps> = ({ onFilesSelected }) => {
    const [isDragging, setIsDragging] = useState(false);
    const [selectedFiles, setSelectedFiles] = useState<File[]>([]);

    const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        if (event.target.files) {
            const files = Array.from(event.target.files);
            setSelectedFiles(files);
        }
    };

    const handleDragEvent = (e: React.DragEvent<HTMLDivElement>, isEntering: boolean) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDragging(isEntering);
    };

    const handleDrop = useCallback((e: React.DragEvent<HTMLDivElement>) => {
        handleDragEvent(e, false);
        if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
            const files = Array.from(e.dataTransfer.files);
            setSelectedFiles(files);
            e.dataTransfer.clearData();
        }
    }, []);

    const handleSubmit = () => {
        if (selectedFiles.length > 0) {
            onFilesSelected(selectedFiles);
        }
    };

    return (
        <div className="bg-gray-900/50 p-8 rounded-xl shadow-2xl border border-gray-700 max-w-3xl mx-auto text-center animate-fade-in">
            <div
                onDragEnter={(e) => handleDragEvent(e, true)}
                onDragLeave={(e) => handleDragEvent(e, false)}
                onDragOver={(e) => handleDragEvent(e, true)}
                onDrop={handleDrop}
                className={`p-10 border-2 border-dashed rounded-lg transition-all duration-300 ${isDragging ? 'border-brand-primary bg-brand-primary/10 shadow-glow-primary' : 'border-gray-600 hover:border-brand-primary/50'}`}
            >
                <div className="flex flex-col items-center">
                    <UploadIcon />
                    <p className="mt-4 text-xl font-semibold text-gray-200">Drag & drop vehicle images here</p>
                    <p className="text-brand-gray mt-1">or click to browse</p>
                    <input
                        type="file"
                        id="file-upload"
                        multiple
                        accept="image/*"
                        onChange={handleFileChange}
                        className="hidden"
                    />
                    <label htmlFor="file-upload" className="mt-6 cursor-pointer px-6 py-2 bg-brand-secondary hover:bg-brand-primary text-white font-bold rounded-lg transition-all duration-300 transform hover:scale-105 hover:shadow-glow-primary transition-shadow">
                        Browse Files
                    </label>
                </div>
            </div>
            {selectedFiles.length > 0 && (
                <div className="mt-6 text-left animate-fade-in">
                    <h3 className="font-semibold text-lg mb-2 text-gray-200">Selected Files:</h3>
                    <ul className="list-disc list-inside bg-gray-800 p-4 rounded-lg border border-gray-700">
                        {selectedFiles.map((file, index) => (
                            <li key={index} className="text-gray-300 truncate">{file.name}</li>
                        ))}
                    </ul>
                    <button
                        onClick={handleSubmit}
                        className="w-full mt-6 py-3 bg-brand-primary text-white font-bold text-lg rounded-lg transition-all duration-300 transform hover:scale-105 hover:shadow-glow-primary disabled:bg-gray-600 disabled:shadow-none disabled:scale-100 transition-shadow"
                        disabled={selectedFiles.length === 0}
                    >
                        Analyze Damage ({selectedFiles.length} {selectedFiles.length > 1 ? 'images' : 'image'})
                    </button>
                </div>
            )}
        </div>
    );
};

export default FileUpload;

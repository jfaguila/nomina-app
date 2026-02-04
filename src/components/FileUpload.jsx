import React, { useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { motion } from 'framer-motion';

const FileUpload = ({ onFileSelect }) => {
    const [preview, setPreview] = useState(null);
    const [fileName, setFileName] = useState('');

    const onDrop = (acceptedFiles) => {
        const file = acceptedFiles[0];
        if (file) {
            setFileName(file.name);
            onFileSelect(file);

            // Crear preview para imágenes
            if (file.type.startsWith('image/')) {
                const reader = new FileReader();
                reader.onload = () => setPreview(reader.result);
                reader.readAsDataURL(file);
            } else {
                setPreview(null);
            }
        }
    };

    const { getRootProps, getInputProps, isDragActive } = useDropzone({
        onDrop,
        accept: {
            'application/pdf': ['.pdf'],
            'image/*': ['.png', '.jpg', '.jpeg']
        },
        maxFiles: 1
    });

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="w-full"
        >
            <div
                {...getRootProps()}
                className={`
          glass-card p-12 border-2 border-dashed cursor-pointer
          transition-all duration-300 hover:shadow-2xl
          ${isDragActive ? 'border-primary-500 bg-primary-50/50 scale-105' : 'border-gray-300'}
        `}
                role="button"
                tabIndex={0}
                aria-label="Subir archivo de nómina"
                onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                        e.preventDefault();
                        // This will trigger the file input
                    }
                }}
            >
                <input {...getInputProps()} aria-label="Seleccionar archivo de nómina" />

                <div className="text-center">
                    {preview ? (
                        <div className="space-y-4">
                            <img
                                src={preview}
                                alt="Preview"
                                className="max-h-64 mx-auto rounded-xl shadow-lg"
                            />
                            <p className="text-sm text-gray-600 font-medium">{fileName}</p>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            <div className="mx-auto w-20 h-20 bg-gradient-to-br from-primary-500 to-accent-500 rounded-full flex items-center justify-center animate-float">
                                <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                                </svg>
                            </div>

                            <div>
                                <p className="text-xl font-bold gradient-text mb-2">
                                    {isDragActive ? '¡Suelta el archivo aquí!' : 'Arrastra tu nómina aquí'}
                                </p>
                                <p className="text-gray-500">
                                    o haz clic para seleccionar
                                </p>
                                <p className="text-sm text-gray-400 mt-2">
                                    Formatos: PDF, JPG, PNG
                                </p>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {fileName && (
                <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="mt-6 flex items-center justify-between glass-card p-6 border-2 border-green-500 bg-green-50/50"
                >
                    <div className="flex items-center space-x-4">
                        <div className="w-14 h-14 bg-gradient-to-br from-green-500 to-emerald-600 rounded-xl flex items-center justify-center shadow-lg">
                            <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                            </svg>
                        </div>
                        <div>
                            <p className="font-bold text-lg text-gray-800">✅ {fileName}</p>
                            <p className="text-sm text-green-600 font-semibold">Archivo listo para analizar</p>
                        </div>
                    </div>
                    <div className="text-right">
                        <button
                            onClick={(e) => {
                                e.stopPropagation();
                                setFileName('');
                                setPreview(null);
                                onFileSelect(null);
                            }}
                            className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition"
                        >
                            ❌ Quitar
                        </button>
                    </div>
                </motion.div>
            )}
        </motion.div>
    );
};

export default FileUpload;

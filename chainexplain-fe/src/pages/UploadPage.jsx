import React, { useState, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { useDropzone } from 'react-dropzone'
import { motion, AnimatePresence } from 'framer-motion'
import { UploadCloud, FileText, X, AlertTriangle, ArrowRight, ShieldCheck } from 'lucide-react'
import useUpload from '../hooks/useUpload'
import useJobStore from '../store/useJobStore'
import { Button } from '@/components/ui/button'

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
    },
  },
}

const itemVariants = {
  hidden: { y: 20, opacity: 0 },
  visible: {
    y: 0,
    opacity: 1,
    transition: {
      type: 'spring',
      stiffness: 100,
      damping: 20,
    },
  },
}

export default function UploadPage() {
  const [file, setFile] = useState(null)
  const [localError, setLocalError] = useState(null)
  const { uploadFile, isUploading } = useUpload()
  const setUploadedFile = useJobStore((state) => state.setUploadedFile)
  const navigate = useNavigate()

  const onDrop = useCallback((acceptedFiles, rejectedFiles) => {
    setLocalError(null)

    // Handle rejections (file type/size restrictions)
    if (rejectedFiles && rejectedFiles.length > 0) {
      const error = rejectedFiles[0].errors[0]
      if (error.code === 'file-too-large') {
        setLocalError('File size exceeds the 10MB limit. Please select a smaller PDF.')
      } else if (error.code === 'file-invalid-type') {
        setLocalError('Only PDF documents are allowed. Please select a valid whitepaper.')
      } else {
        setLocalError(error.message)
      }
      return
    }

    if (acceptedFiles && acceptedFiles.length > 0) {
      const selectedFile = acceptedFiles[0]
      setFile(selectedFile)
    }
  }, [])

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'application/pdf': ['.pdf']
    },
    maxSize: 10 * 1024 * 1024, // 10MB
    multiple: false
  })

  const removeFile = (e) => {
    e.stopPropagation()
    setFile(null)
    setLocalError(null)
  }

  const handleUploadSubmit = async () => {
    if (!file) return
    
    try {
      await uploadFile(file)
      // Navigate to processing page which will listen to active Job ID changes
      navigate('/processing')
    } catch (err) {
      const status = err.response?.status || 500;
      const message = err.response?.data?.error || err.response?.data?.message || err.message || 'Upload failed. Please check your connection.';
      navigate('/error', { state: { status, message } });
    }
  }

  const formatBytes = (bytes, decimals = 2) => {
    if (!+bytes) return '0 Bytes'
    const k = 1024
    const dm = decimals < 0 ? 0 : decimals
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return `${parseFloat((bytes / Math.pow(k, i)).toFixed(dm))} ${sizes[i]}`
  }

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="max-w-2xl mx-auto flex flex-col gap-10 py-4 md:py-8 text-left"
    >
      {/* Page Title */}
      <motion.div variants={itemVariants} className="flex flex-col gap-3">
        <h1 className="font-sans text-3xl font-extrabold tracking-tight text-foreground">
          Upload Whitepaper
        </h1>
        <p className="font-sans text-sm text-muted-foreground leading-relaxed">
          Select or drag-and-drop the PDF version of the Web3 or crypto protocol document. Max limit is 10MB.
        </p>
      </motion.div>

      {/* Main Container */}
      <motion.div variants={itemVariants} className="flex flex-col gap-6">
        {/* DropZone Section */}
        <div
          {...getRootProps()}
          className={`relative group cursor-pointer overflow-hidden border border-dashed rounded-lg p-10 flex flex-col items-center justify-center text-center transition-all duration-300 ${
            isDragActive 
              ? 'border-primary bg-primary/5 scale-[1.01] shadow-2xl shadow-primary/10' 
              : 'border-border bg-card hover:border-primary/20 hover:bg-slate-100 dark:hover:bg-slate-800/40'
          }`}
        >
          <input {...getInputProps()} />
          
          {/* Accent decoration */}
          <div className="absolute top-0 right-0 h-32 w-32 rounded-full bg-primary/5 blur-3xl -z-10" />

          {/* Interactive animated icon */}
          <motion.div 
            animate={isDragActive ? { y: -8, scale: 1.1 } : { y: 0 }}
            transition={{ type: 'spring', stiffness: 150, damping: 15 }}
            className={`p-4 rounded-full border mb-4 transition-all duration-300 ${
              isDragActive 
                ? 'bg-primary/20 text-primary border-primary/30' 
                : 'bg-muted text-muted-foreground border-border group-hover:text-foreground group-hover:border-primary/30'
            }`}
          >
            <UploadCloud className="h-8 w-8" />
          </motion.div>

          <span className="font-sans font-bold text-base text-foreground mb-1">
            {isDragActive ? 'Drop your whitepaper here' : 'Drag & drop whitepaper PDF'}
          </span>
          <span className="font-sans text-xs text-muted-foreground">
            or click to browse local files
          </span>
        </div>

        {/* Clear Inline Error Reporting */}
        <AnimatePresence mode="wait">
          {localError && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ type: 'spring', stiffness: 100, damping: 20 }}
              className="flex gap-3 items-start bg-destructive/10 border border-destructive/20 rounded-md p-4 text-sm text-destructive"
            >
              <AlertTriangle className="h-5 w-5 flex-shrink-0 mt-0.5" />
              <div className="flex flex-col gap-1">
                <span className="font-bold font-sans">Verification Failed</span>
                <span className="font-sans leading-relaxed text-destructive/90">{localError}</span>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* File Preview Section */}
        <AnimatePresence mode="wait">
          {file && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ type: 'spring', stiffness: 120, damping: 18 }}
              className="glass rounded-lg p-5 flex items-center justify-between gap-4 border border-border shadow-xl"
            >
              <div className="flex items-center gap-3.5 flex-1 min-w-0">
                <div className="h-10 w-10 rounded bg-primary/10 border border-primary/20 flex items-center justify-center text-primary">
                  <FileText className="h-5 w-5" />
                </div>
                <div className="flex-1 min-w-0 flex flex-col text-left">
                  <span className="font-sans font-bold text-sm text-foreground truncate">{file.name}</span>
                  <span className="font-mono text-xs text-muted-foreground">{formatBytes(file.size)}</span>
                </div>
              </div>

              {/* Cancel Button */}
              <button
                type="button"
                onClick={removeFile}
                className="p-1.5 rounded-full hover:bg-muted border border-transparent hover:border-border text-muted-foreground hover:text-foreground transition-all"
              >
                <X className="h-4.5 w-4.5" />
              </button>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Action Button Section */}
        <motion.div variants={itemVariants} className="mt-4 flex flex-col gap-3">
          <Button
            size="lg"
            onClick={handleUploadSubmit}
            disabled={!file || isUploading}
            className="w-full relative py-6 font-sans text-base font-bold bg-primary hover:bg-primary/95 disabled:bg-muted disabled:text-muted-foreground border border-transparent disabled:border-border text-primary-foreground rounded-md shadow-lg shadow-primary/15 transition-transform active:translate-y-[1px]"
          >
            {isUploading ? 'Uploading Document...' : 'Generate ELI5 Summary'}
            {!isUploading && <ArrowRight className="ml-2 h-4.5 w-4.5" />}
          </Button>

          <div className="flex justify-center items-center gap-2 text-[10px] font-mono text-muted-foreground/60 uppercase tracking-widest mt-1">
            <ShieldCheck className="h-3.5 w-3.5 text-accent" />
            <span>Public sandbox environment · Zero transaction gas</span>
          </div>
        </motion.div>
      </motion.div>
    </motion.div>
  )
}

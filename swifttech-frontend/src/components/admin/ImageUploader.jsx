import { useState, useRef } from 'react';
import { SwiftTech } from '@/api/SwiftTechClient';
import { Upload, X, Loader2, ImagePlus } from 'lucide-react';
import { Button } from '@/components/ui/button';

// @ts-ignore
export default function ImageUploader({ images = [], onImagesChange }) {
  const [uploading, setUploading] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const fileInputRef = useRef(null);

  // const handleFiles = async (files) => {
  //   if (!files?.length) return;
  //   setUploading(true);
  //   const newUrls = [];
  //   for (const file of Array.from(files)) {
  //     const { file_url } = await SwiftTech.integrations.Core.UploadFile({ file });
  //     newUrls.push(file_url);
  //   }
  //   onImagesChange([...images, ...newUrls]);
  //   setUploading(false);
  // };

  // @ts-ignore
  const handleFiles = async (files) => {
    if (!files?.length) return;

    // @ts-ignore
    if (!SwiftTech?.integrations?.Core?.UploadFile) {
      console.error("UploadFile API is not available", SwiftTech);
      return;
    }

    setUploading(true);

    try {
      const newUrls = [];

      for (const file of Array.from(files)) {
        // @ts-ignore
        const response = await SwiftTech.integrations.Core.UploadFile({ file });

        if (response?.file_url) {
          newUrls.push(response.file_url);
        }
      }

      onImagesChange([...images, ...newUrls]);
    } catch (error) {
      console.error("Upload failed:", error);
    } finally {
      setUploading(false);
    }
  };

  // @ts-ignore
  const handleDrop = (e) => {
    e.preventDefault();
    setDragOver(false);
    handleFiles(e.dataTransfer.files);
  };

  // @ts-ignore
  const removeImage = (index) => onImagesChange(images.filter((_, i) => i !== index));

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3 mb-2">
        <div className="w-7 h-7 gradient-blue rounded-lg flex items-center justify-center">
          <ImagePlus className="w-3.5 h-3.5 text-white" />
        </div>
        <p className="font-heading text-sm font-semibold">Product Images</p>
      </div>

      {/* Drop Zone */}
      <div
        onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
        onDragLeave={() => setDragOver(false)}
        onDrop={handleDrop}
        // @ts-ignore
        onClick={() => fileInputRef.current?.click()}
        className={`border-2 border-dashed rounded-2xl cursor-pointer transition-all p-10 text-center ${
          dragOver
            ? 'border-primary bg-primary/5 scale-[1.01]'
            : 'border-border hover:border-primary/50 hover:bg-secondary/50'
        }`}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          multiple
          className="hidden"
          onChange={(e) => handleFiles(e.target.files)}
        />
        {uploading ? (
          <div className="flex flex-col items-center gap-3">
            <Loader2 className="w-10 h-10 animate-spin text-primary" />
            <span className="text-sm text-muted-foreground font-medium">Uploading images...</span>
          </div>
        ) : (
          <div className="flex flex-col items-center gap-3">
            <div className="w-14 h-14 gradient-blue rounded-2xl flex items-center justify-center mx-auto">
              <Upload className="w-6 h-6 text-white" />
            </div>
            <div>
              <p className="font-heading text-sm font-semibold">Drop images here or click to browse</p>
              <p className="font-mono text-[11px] text-muted-foreground mt-1">
                PNG, JPG, WEBP — Multiple files supported
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Preview Grid */}
      {images.length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {images.map((url, i) => (
            <div key={i} className="relative group rounded-xl overflow-hidden border border-border aspect-square bg-secondary">
              <img src={url} alt="" className="w-full h-full object-cover" />
              <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center rounded-xl">
                <
// @ts-ignore
                Button
                  variant="ghost"
                  size="icon"
                  className="text-white hover:text-red-400 hover:bg-transparent h-8 w-8"
                  // @ts-ignore
                  onClick={(e) => { e.stopPropagation(); removeImage(i); }}
                >
                  <X className="w-5 h-5" />
                </Button>
              </div>
              {i === 0 && (
                <div className="absolute top-2 left-2 bg-primary text-white font-mono text-[9px] px-1.5 py-0.5 rounded-md">
                  MAIN
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
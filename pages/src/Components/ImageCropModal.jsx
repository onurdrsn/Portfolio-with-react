import React, { useState, useRef, useEffect } from "react";
import { createPortal } from "react-dom";
import { X as XIcon, ZoomIn, ZoomOut, Crop, Upload, RefreshCw, Check } from "lucide-react";

export default function ImageCropModal({ isOpen, onClose, onCropComplete }) {
  const [imageSrc, setImageSrc] = useState(null);
  const [zoom, setZoom] = useState(1);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [aspectRatio, setAspectRatio] = useState(16 / 9); // default 16:9

  const canvasRef = useRef(null);
  const imageRef = useRef(null);
  const fileInputRef = useRef(null);

  useEffect(() => {
    if (!isOpen) {
      setImageSrc(null);
      setZoom(1);
      setPan({ x: 0, y: 0 });
    }
  }, [isOpen]);

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        setImageSrc(reader.result);
        setZoom(1);
        setPan({ x: 0, y: 0 });
      };
      reader.readAsDataURL(file);
    }
  };

  const handleMouseDown = (e) => {
    if (!imageSrc) return;
    setIsDragging(true);
    setDragStart({ x: e.clientX - pan.x, y: e.clientY - pan.y });
  };

  const handleMouseMove = (e) => {
    if (!isDragging) return;
    setPan({
      x: e.clientX - dragStart.x,
      y: e.clientY - dragStart.y,
    });
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  // Render preview canvas
  useEffect(() => {
    if (!imageSrc || !canvasRef.current) return;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const img = new Image();
    img.src = imageSrc;
    img.onload = () => {
      imageRef.current = img;
      const targetWidth = 640;
      const targetHeight = Math.round(640 / aspectRatio);

      canvas.width = targetWidth;
      canvas.height = targetHeight;

      ctx.clearRect(0, 0, targetWidth, targetHeight);
      ctx.fillStyle = "#0f172a";
      ctx.fillRect(0, 0, targetWidth, targetHeight);

      ctx.save();
      ctx.translate(targetWidth / 2 + pan.x, targetHeight / 2 + pan.y);
      ctx.scale(zoom, zoom);

      // Draw image centered
      const drawWidth = targetWidth;
      const drawHeight = (img.height / img.width) * targetWidth;

      ctx.drawImage(img, -drawWidth / 2, -drawHeight / 2, drawWidth, drawHeight);
      ctx.restore();
    };
  }, [imageSrc, zoom, pan, aspectRatio]);

  const handleSaveCrop = () => {
    if (!canvasRef.current || !imageSrc) return;
    const dataUrl = canvasRef.current.toDataURL("image/webp", 0.85);
    onCropComplete(dataUrl);
    onClose();
  };

  if (!isOpen) return null;

  return createPortal(
    <div className="fixed inset-0 z-[9999] w-screen h-screen bg-black/85 backdrop-blur-md p-4 flex items-center justify-center animate-fadeIn">
      <div className="relative w-full max-w-xl bg-[#0d1117] border border-[#1a2035] rounded-2xl shadow-2xl p-5 sm:p-6 text-left flex flex-col max-h-[88vh] overflow-y-auto">
        {/* Modal Header */}
        <div className="flex justify-between items-center mb-4 pb-3 border-b border-[#1a2035]">
          <div className="flex items-center gap-2">
            <Crop size={18} className="text-violet-400" />
            <h2 className="text-base sm:text-lg font-bold text-white">Görsel Yükle ve Kırp</h2>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-lg bg-white/5 text-gray-400 hover:text-white transition-all">
            <XIcon size={18} />
          </button>
        </div>

        {/* Modal Body */}
        <div className="space-y-4">
          {!imageSrc ? (
            <div
              onClick={() => fileInputRef.current?.click()}
              className="border-2 border-dashed border-[#1f2937] hover:border-violet-500/50 rounded-2xl p-8 text-center cursor-pointer transition-all bg-[#161b27]/50 hover:bg-[#161b27] group"
            >
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleFileChange}
                className="hidden"
              />
              <div className="w-14 h-14 rounded-2xl bg-violet-500/10 text-violet-400 border border-violet-500/20 flex items-center justify-center mx-auto mb-3 group-hover:scale-110 transition-transform">
                <Upload size={24} />
              </div>
              <p className="text-sm font-semibold text-white mb-1">Fotoğraf Seç veya Sürükle</p>
              <p className="text-xs text-gray-500">PNG, JPG, WEBP, SVG dosyaları desteklenir</p>
            </div>
          ) : (
            <div className="space-y-4">
              {/* Canvas viewport container */}
              <div
                onMouseDown={handleMouseDown}
                onMouseMove={handleMouseMove}
                onMouseUp={handleMouseUp}
                onMouseLeave={handleMouseUp}
                className="relative w-full rounded-2xl overflow-hidden bg-gray-950 border border-gray-800 cursor-move flex items-center justify-center select-none"
              >
                <canvas ref={canvasRef} className="max-w-full max-h-[380px] object-contain rounded-xl" />
                <div className="absolute bottom-2 left-2 px-2.5 py-1 rounded-lg bg-black/70 backdrop-blur text-[10px] text-gray-400 border border-white/10 pointer-events-none">
                  🔍 Sürükleyerek hizalayın
                </div>
              </div>

              {/* Controls */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 p-3 bg-[#161b27] border border-[#1f2937] rounded-xl">
                {/* Zoom control */}
                <div className="flex items-center gap-2">
                  <ZoomOut size={14} className="text-gray-400" />
                  <input
                    type="range"
                    min="0.5"
                    max="3"
                    step="0.05"
                    value={zoom}
                    onChange={(e) => setZoom(parseFloat(e.target.value))}
                    className="w-full accent-violet-500 cursor-pointer h-1.5 bg-gray-800 rounded-lg"
                  />
                  <ZoomIn size={14} className="text-gray-400" />
                  <span className="text-[11px] text-violet-400 font-mono w-10 text-right">{Math.round(zoom * 100)}%</span>
                </div>

                {/* Aspect ratio selector */}
                <div className="flex items-center justify-end gap-1.5">
                  <span className="text-[10px] text-gray-400 font-semibold uppercase mr-1">Oran:</span>
                  {[
                    { label: "16:9", val: 16 / 9 },
                    { label: "4:3", val: 4 / 3 },
                    { label: "1:1", val: 1 / 1 },
                  ].map((ratio) => (
                    <button
                      key={ratio.label}
                      type="button"
                      onClick={() => setAspectRatio(ratio.val)}
                      className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-all ${
                        aspectRatio === ratio.val
                          ? "bg-violet-600/30 text-violet-300 border border-violet-500/40"
                          : "bg-white/5 text-gray-400 hover:text-white"
                      }`}
                    >
                      {ratio.label}
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex items-center justify-between pt-2">
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="px-3 py-2 rounded-xl text-xs font-medium text-gray-400 hover:text-white bg-white/5 flex items-center gap-1.5"
                >
                  <RefreshCw size={13} /> Farklı Fotoğraf
                </button>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleFileChange}
                  className="hidden"
                />

                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={onClose}
                    className="px-4 py-2 rounded-xl text-xs text-gray-400 hover:text-white bg-white/5"
                  >
                    İptal
                  </button>
                  <button
                    type="button"
                    onClick={handleSaveCrop}
                    className="px-5 py-2 rounded-xl text-xs font-bold bg-violet-600 hover:bg-violet-500 text-white shadow-lg shadow-violet-900/40 flex items-center gap-1.5"
                  >
                    <Check size={14} /> Görseli Kullan
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>,
    document.body
  );
}

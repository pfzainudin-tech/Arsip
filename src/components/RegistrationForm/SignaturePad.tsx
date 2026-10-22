import React, { useRef, useState, useEffect } from 'react';
import { Eraser, CheckCircle2, PenLine, RotateCcw } from 'lucide-react';

interface SignaturePadProps {
  value: string;
  onChange: (dataUrl: string) => void;
  error?: string;
}

export const SignaturePad: React.FC<SignaturePadProps> = ({ value, onChange, error }) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [hasDrawn, setHasDrawn] = useState(Boolean(value));
  const [strokeColor, setStrokeColor] = useState('#0f172a'); // default deep navy/black ink

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Set internal resolution matching display size for crisp lines
    const rect = canvas.getBoundingClientRect();
    const dpr = window.devicePixelRatio || 1;
    
    canvas.width = rect.width * dpr;
    canvas.height = rect.height * dpr;
    ctx.scale(dpr, dpr);

    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.lineWidth = 2.5;

    // If initial value exists, render it
    if (value) {
      const img = new Image();
      img.onload = () => {
        ctx.clearRect(0, 0, rect.width, rect.height);
        ctx.drawImage(img, 0, 0, rect.width, rect.height);
        setHasDrawn(true);
      };
      img.src = value;
    } else {
      ctx.clearRect(0, 0, rect.width, rect.height);
    }
  }, []);

  const getCoordinates = (e: React.MouseEvent | React.TouchEvent) => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };
    const rect = canvas.getBoundingClientRect();

    if ('touches' in e && e.touches.length > 0) {
      return {
        x: e.touches[0].clientX - rect.left,
        y: e.touches[0].clientY - rect.top,
      };
    } else if ('clientX' in e) {
      return {
        x: (e as React.MouseEvent).clientX - rect.left,
        y: (e as React.MouseEvent).clientY - rect.top,
      };
    }
    return { x: 0, y: 0 };
  };

  const startDrawing = (e: React.MouseEvent | React.TouchEvent) => {
    e.preventDefault();
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const { x, y } = getCoordinates(e);
    ctx.strokeStyle = strokeColor;
    ctx.lineWidth = 2.5;
    ctx.beginPath();
    ctx.moveTo(x, y);
    setIsDrawing(true);
    setHasDrawn(true);
  };

  const draw = (e: React.MouseEvent | React.TouchEvent) => {
    if (!isDrawing) return;
    e.preventDefault();
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const { x, y } = getCoordinates(e);
    ctx.lineTo(x, y);
    ctx.stroke();
  };

  const stopDrawing = () => {
    if (!isDrawing) return;
    setIsDrawing(false);
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    // Save as transparent PNG
    const dataUrl = canvas.toDataURL('image/png');
    onChange(dataUrl);
  };

  const handleClear = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const rect = canvas.getBoundingClientRect();
    ctx.clearRect(0, 0, rect.width, rect.height);
    setHasDrawn(false);
    onChange('');
  };

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <label className="block text-sm font-semibold text-slate-700">
          Tanda Tangan Digital <span className="text-rose-500">*</span>
        </label>
        <div className="flex items-center gap-2">
          <span className="text-xs text-slate-500 hidden sm:inline">Warna Tinta:</span>
          <div className="flex items-center gap-1.5 bg-slate-100 p-1 rounded-lg">
            <button
              type="button"
              onClick={() => setStrokeColor('#0f172a')}
              className={`w-5 h-5 rounded-full bg-slate-900 transition-all ${
                strokeColor === '#0f172a' ? 'ring-2 ring-emerald-500 ring-offset-1 scale-110' : 'opacity-70'
              }`}
              title="Tinta Hitam"
            />
            <button
              type="button"
              onClick={() => setStrokeColor('#1e3a8a')}
              className={`w-5 h-5 rounded-full bg-blue-900 transition-all ${
                strokeColor === '#1e3a8a' ? 'ring-2 ring-emerald-500 ring-offset-1 scale-110' : 'opacity-70'
              }`}
              title="Tinta Biru"
            />
          </div>
        </div>
      </div>

      <div className="text-xs text-slate-500">
        Silakan tanda tangan langsung di dalam kotak di bawah ini menggunakan jari (di smartphone/tablet) atau kursor mouse.
      </div>

      <div className={`relative border-2 border-dashed rounded-xl overflow-hidden bg-white shadow-inner transition-colors ${
        error ? 'border-rose-400 bg-rose-50/20' : hasDrawn ? 'border-emerald-400' : 'border-slate-300 hover:border-emerald-300'
      }`}>
        {/* Subtle grid pattern background to show transparency */}
        <div 
          className="absolute inset-0 opacity-15 pointer-events-none"
          style={{
            backgroundImage: `radial-gradient(#94a3b8 1px, transparent 1px)`,
            backgroundSize: '16px 16px'
          }}
        />

        <canvas
          ref={canvasRef}
          onMouseDown={startDrawing}
          onMouseMove={draw}
          onMouseUp={stopDrawing}
          onMouseLeave={stopDrawing}
          onTouchStart={startDrawing}
          onTouchMove={draw}
          onTouchEnd={stopDrawing}
          className="relative w-full h-44 sm:h-52 cursor-crosshair touch-none z-10 block"
        />

        {!hasDrawn && (
          <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none text-slate-400 gap-1.5">
            <PenLine className="w-6 h-6 text-slate-300 animate-pulse" />
            <span className="text-xs font-medium tracking-wide uppercase text-slate-400">
              Goreskan tanda tangan di sini
            </span>
          </div>
        )}

        {hasDrawn && (
          <div className="absolute top-2 right-2 z-20 flex items-center gap-1.5 bg-emerald-50 text-emerald-700 text-xs px-2.5 py-1 rounded-full font-medium border border-emerald-200">
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>Tanda Tangan Siap</span>
          </div>
        )}
      </div>

      <div className="flex items-center justify-between pt-1">
        <button
          type="button"
          onClick={handleClear}
          disabled={!hasDrawn}
          className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
            hasDrawn
              ? 'text-slate-700 bg-slate-100 hover:bg-slate-200 active:scale-95'
              : 'text-slate-300 bg-slate-50 cursor-not-allowed'
          }`}
        >
          <RotateCcw className="w-3.5 h-3.5" />
          <span>Hapus & Ulangi</span>
        </button>

        <span className="text-[11px] text-slate-400 italic">
          *Disimpan otomatis sebagai format PNG transparan
        </span>
      </div>

      {error && (
        <p className="text-xs text-rose-600 font-medium flex items-center gap-1 mt-1">
          <span>⚠️</span> {error}
        </p>
      )}
    </div>
  );
};

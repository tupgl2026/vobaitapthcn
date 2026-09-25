import { useRef, useEffect, useState } from 'react';
import { Eraser, Pencil, Trash2, Undo2 } from 'lucide-react';

interface DrawingCanvasProps {
  onSave: (dataUrl: string) => void;
  initialData?: string;
  disabled?: boolean;
}

export default function DrawingCanvas({ onSave, initialData, disabled }: DrawingCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [color, setColor] = useState('#000000');
  const [lineWidth, setLineWidth] = useState(2);
  const [mode, setMode] = useState<'pencil' | 'eraser'>('pencil');

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Set canvas size based on container
    const resizeCanvas = () => {
      const container = canvas.parentElement;
      if (container) {
        const tempImage = canvas.toDataURL();
        canvas.width = container.clientWidth;
        canvas.height = 300;
        
        // Restore content after resize
        const img = new Image();
        img.src = tempImage;
        img.onload = () => ctx.drawImage(img, 0, 0);
      }
    };

    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);

    if (initialData) {
      const img = new Image();
      img.src = initialData;
      img.onload = () => ctx.drawImage(img, 0, 0);
    }

    return () => window.removeEventListener('resize', resizeCanvas);
  }, [initialData]);

  const startDrawing = (e: React.MouseEvent | React.TouchEvent) => {
    if (disabled) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const rect = canvas.getBoundingClientRect();
    const x = ('touches' in e) ? e.touches[0].clientX - rect.left : (e as React.MouseEvent).clientX - rect.left;
    const y = ('touches' in e) ? e.touches[0].clientY - rect.top : (e as React.MouseEvent).clientY - rect.top;

    ctx.beginPath();
    ctx.moveTo(x, y);
    setIsDrawing(true);
  };

  const draw = (e: React.MouseEvent | React.TouchEvent) => {
    if (!isDrawing || disabled) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const rect = canvas.getBoundingClientRect();
    const x = ('touches' in e) ? e.touches[0].clientX - rect.left : (e as React.MouseEvent).clientX - rect.left;
    const y = ('touches' in e) ? e.touches[0].clientY - rect.top : (e as React.MouseEvent).clientY - rect.top;

    ctx.lineTo(x, y);
    ctx.strokeStyle = mode === 'eraser' ? '#ffffff' : color;
    ctx.lineWidth = mode === 'eraser' ? 20 : lineWidth;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.stroke();
  };

  const stopDrawing = () => {
    setIsDrawing(false);
    if (canvasRef.current && !disabled) {
      onSave(canvasRef.current.toDataURL());
    }
  };

  const clear = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    onSave('');
  };

  return (
    <div className="w-full bg-white border border-slate-200 rounded-xl overflow-hidden shadow-inner relative">
      <div className="bg-slate-50 border-b border-slate-100 p-2 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <button 
            onClick={() => setMode('pencil')}
            className={`p-2 rounded-lg transition-all ${mode === 'pencil' ? 'bg-blue-600 text-white shadow-md' : 'text-slate-500 hover:bg-slate-200'}`}
            title="Bút chì"
          >
            <Pencil size={18} />
          </button>
          <button 
            onClick={() => setMode('eraser')}
            className={`p-2 rounded-lg transition-all ${mode === 'eraser' ? 'bg-blue-600 text-white shadow-md' : 'text-slate-500 hover:bg-slate-200'}`}
            title="Tẩy"
          >
            <Eraser size={18} />
          </button>
          <div className="w-px h-6 bg-slate-200 mx-1"></div>
          <input 
            type="color" 
            value={color}
            onChange={(e) => setColor(e.target.value)}
            className="w-8 h-8 rounded-full border-none cursor-pointer"
          />
        </div>
        <button 
          onClick={clear}
          className="p-2 text-slate-400 hover:text-red-600 transition-colors"
          title="Xóa hết"
        >
          <Trash2 size={18} />
        </button>
      </div>
      
      <canvas
        ref={canvasRef}
        onMouseDown={startDrawing}
        onMouseMove={draw}
        onMouseUp={stopDrawing}
        onMouseOut={stopDrawing}
        onTouchStart={startDrawing}
        onTouchMove={draw}
        onTouchEnd={stopDrawing}
        className={`w-full cursor-crosshair bg-[url('https://www.transparenttextures.com/patterns/notebook.png')] ${disabled ? 'pointer-events-none opacity-80' : ''}`}
        style={{ height: '300px' }}
      />
      
      {!disabled && (
        <div className="absolute bottom-2 right-2 text-[10px] font-bold text-slate-300 uppercase tracking-widest pointer-events-none">
          Vùng viết tay / Vẽ
        </div>
      )}
    </div>
  );
}

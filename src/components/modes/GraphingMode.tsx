import React, { useState, useRef, useEffect, useCallback } from 'react';
import { PlottedFunction, Point2D } from '../../types/graphing';
import { compileGraphFunction } from '../../utils/mathParser';
import { Plus, Trash2, ZoomIn, ZoomOut, RotateCcw, Eye, EyeOff } from 'lucide-react';
import { useToast } from '../../context/ToastContext';

const PRESETS = [
  { label: 'sin(x)', expr: 'sin(x)' },
  { label: 'cos(x)', expr: 'cos(x)' },
  { label: 'x² - 4', expr: 'x^2 - 4' },
  { label: 'x³ - 3x', expr: 'x^3 - 3*x' },
  { label: '1 / x', expr: '1/x' },
  { label: 'e^x', expr: 'e^x' },
  { label: 'ln(x)', expr: 'ln(x)' },
  { label: 'Damped Wave', expr: 'e^(-0.2*x) * sin(2*x)' },
  { label: 'Gaussian', expr: 'e^(-(x^2))' },
];

const COLORS = ['#00f3ff', '#ff007f', '#ffe600', '#10b981', '#a855f7'];

export const GraphingMode: React.FC = () => {
  const { showToast } = useToast();
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  const [functions, setFunctions] = useState<PlottedFunction[]>([
    { id: '1', expression: 'sin(x)', color: '#00f3ff', visible: true, isValid: true },
    { id: '2', expression: '0.2*x^2 - 2', color: '#ff007f', visible: true, isValid: true },
  ]);

  // Viewport camera parameters
  const [centerX, setCenterX] = useState<number>(0);
  const [centerY, setCenterY] = useState<number>(0);
  const [scale, setScale] = useState<number>(40); // Pixels per unit

  // Cursor Inspection state
  const [hoverPoint, setHoverPoint] = useState<Point2D | null>(null);
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const [dragStart, setDragStart] = useState<Point2D>({ x: 0, y: 0 });

  // Add function
  const addFunction = () => {
    if (functions.length >= 5) {
      showToast('Maximum 5 functions supported simultaneously', 'info');
      return;
    }
    const color = COLORS[functions.length % COLORS.length];
    setFunctions((prev) => [
      ...prev,
      {
        id: `${Date.now()}`,
        expression: 'x',
        color,
        visible: true,
        isValid: true,
      },
    ]);
  };

  // Update function
  const updateFunction = (id: string, updates: Partial<PlottedFunction>) => {
    setFunctions((prev) =>
      prev.map((fn) => (fn.id === id ? { ...fn, ...updates } : fn))
    );
  };

  // Remove function
  const removeFunction = (id: string) => {
    if (functions.length <= 1) {
      showToast('Must have at least one function', 'info');
      return;
    }
    setFunctions((prev) => prev.filter((fn) => fn.id !== id));
  };

  // Zoom controls
  const handleZoom = (factor: number) => {
    setScale((prev) => Math.max(5, Math.min(500, prev * factor)));
  };

  const handleReset = () => {
    setCenterX(0);
    setCenterY(0);
    setScale(40);
  };

  // Render Canvas
  const drawGraph = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const width = canvas.width;
    const height = canvas.height;

    // Clear background
    ctx.fillStyle = '#090d16';
    ctx.fillRect(0, 0, width, height);

    // Canvas origin (0,0 in math coordinates)
    const originCanvasX = width / 2 - centerX * scale;
    const originCanvasY = height / 2 + centerY * scale;

    // Grid spacing calculation
    let step = 1;
    if (scale < 15) step = 5;
    else if (scale < 30) step = 2;
    else if (scale > 100) step = 0.5;
    else if (scale > 200) step = 0.2;

    // Draw Grid Lines
    ctx.lineWidth = 1;
    ctx.strokeStyle = '#1e293b';
    ctx.font = '10px monospace';
    ctx.fillStyle = '#64748b';

    // Vertical grid lines
    const startX = Math.floor((-originCanvasX / scale) / step) * step;
    const endX = Math.ceil(((width - originCanvasX) / scale) / step) * step;

    for (let x = startX; x <= endX; x += step) {
      const canvasX = originCanvasX + x * scale;
      ctx.beginPath();
      ctx.moveTo(canvasX, 0);
      ctx.lineTo(canvasX, height);
      ctx.stroke();

      if (Math.abs(x) > 1e-6) {
        ctx.fillText(Number(x.toFixed(2)).toString(), canvasX + 3, originCanvasY - 5);
      }
    }

    // Horizontal grid lines
    const startY = Math.floor((-originCanvasY / scale) / step) * step;
    const endY = Math.ceil(((height - originCanvasY) / scale) / step) * step;

    for (let y = startY; y <= endY; y += step) {
      const canvasY = originCanvasY - y * scale;
      ctx.beginPath();
      ctx.moveTo(0, canvasY);
      ctx.lineTo(width, canvasY);
      ctx.stroke();

      if (Math.abs(y) > 1e-6) {
        ctx.fillText(Number(y.toFixed(2)).toString(), originCanvasX + 5, canvasY - 3);
      }
    }

    // Draw Main Axes (X & Y)
    ctx.lineWidth = 2;
    ctx.strokeStyle = '#475569';

    // X Axis
    ctx.beginPath();
    ctx.moveTo(0, originCanvasY);
    ctx.lineTo(width, originCanvasY);
    ctx.stroke();

    // Y Axis
    ctx.beginPath();
    ctx.moveTo(originCanvasX, 0);
    ctx.lineTo(originCanvasX, height);
    ctx.stroke();

    // Origin (0,0) label
    ctx.fillText('0', originCanvasX + 4, originCanvasY - 4);

    // Plot Functions
    functions.forEach((fn) => {
      if (!fn.visible || !fn.expression.trim()) return;

      const compiled = compileGraphFunction(fn.expression);
      if (!compiled) return;

      ctx.lineWidth = 2.5;
      ctx.strokeStyle = fn.color;
      ctx.beginPath();

      let isDrawing = false;
      const stepPixel = 1.5; // Smooth step size

      for (let px = 0; px <= width; px += stepPixel) {
        const mathX = (px - originCanvasX) / scale;
        const mathY = compiled(mathX);

        if (mathY !== null && isFinite(mathY)) {
          const py = originCanvasY - mathY * scale;

          // Discontinuity filter (e.g. 1/x or tan(x))
          if (py >= -height && py <= height * 2) {
            if (!isDrawing) {
              ctx.moveTo(px, py);
              isDrawing = true;
            } else {
              ctx.lineTo(px, py);
            }
          } else {
            isDrawing = false;
          }
        } else {
          isDrawing = false;
        }
      }
      ctx.stroke();
    });

    // Draw Crosshair and Cursor Inspection
    if (hoverPoint) {
      const hoverCanvasX = originCanvasX + hoverPoint.x * scale;
      const hoverCanvasY = originCanvasY - hoverPoint.y * scale;

      // Crosshairs
      ctx.lineWidth = 1;
      ctx.setLineDash([4, 4]);
      ctx.strokeStyle = '#94a3b8';

      ctx.beginPath();
      ctx.moveTo(hoverCanvasX, 0);
      ctx.lineTo(hoverCanvasX, height);
      ctx.stroke();

      ctx.beginPath();
      ctx.moveTo(0, hoverCanvasY);
      ctx.lineTo(width, hoverCanvasY);
      ctx.stroke();

      ctx.setLineDash([]); // Reset line dash

      // Inspection Point marker
      ctx.fillStyle = '#ffffff';
      ctx.beginPath();
      ctx.arc(hoverCanvasX, hoverCanvasY, 4, 0, Math.PI * 2);
      ctx.fill();

      // Tooltip Card
      const tooltipX = Math.min(width - 150, Math.max(10, hoverCanvasX + 15));
      const tooltipY = Math.min(height - 70, Math.max(20, hoverCanvasY - 20));

      ctx.fillStyle = 'rgba(15, 23, 42, 0.9)';
      ctx.strokeStyle = '#334155';
      ctx.lineWidth = 1;
      ctx.roundRect(tooltipX, tooltipY, 130, 48, 8);
      ctx.fill();
      ctx.stroke();

      ctx.fillStyle = '#94a3b8';
      ctx.font = '10px monospace';
      ctx.fillText(`x: ${hoverPoint.x.toFixed(3)}`, tooltipX + 8, tooltipY + 18);
      ctx.fillStyle = '#38bdf8';
      ctx.fillText(`y: ${hoverPoint.y.toFixed(3)}`, tooltipX + 8, tooltipY + 36);
    }
  }, [centerX, centerY, scale, functions, hoverPoint]);

  // Keep canvas size responsive with DPI support
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const resize = () => {
      const rect = canvas.getBoundingClientRect();
      const dpr = window.devicePixelRatio || 1;
      canvas.width = rect.width * dpr;
      canvas.height = rect.height * dpr;

      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.scale(dpr, dpr);
      }
      drawGraph();
    };

    resize();
    window.addEventListener('resize', resize);
    return () => window.removeEventListener('resize', resize);
  }, [drawGraph]);

  useEffect(() => {
    drawGraph();
  }, [drawGraph]);

  // Mouse Interaction: Pan and Zoom
  const handleMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    setIsDragging(true);
    setDragStart({ x: e.clientX, y: e.clientY });
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const clientX = e.clientX - rect.left;
    const clientY = e.clientY - rect.top;

    if (isDragging) {
      const dx = (e.clientX - dragStart.x) / scale;
      const dy = (e.clientY - dragStart.y) / scale;
      setCenterX((prev) => prev - dx);
      setCenterY((prev) => prev + dy);
      setDragStart({ x: e.clientX, y: e.clientY });
    }

    // Inspect Point
    const mathX = (clientX - rect.width / 2) / scale + centerX;
    const mathY = -(clientY - rect.height / 2) / scale + centerY;
    setHoverPoint({ x: mathX, y: mathY });
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const handleWheel = (e: React.WheelEvent<HTMLCanvasElement>) => {
    e.preventDefault();
    const factor = e.deltaY < 0 ? 1.15 : 0.85;
    handleZoom(factor);
  };

  return (
    <div className="w-full max-w-5xl mx-auto px-4 flex flex-col gap-4">
      {/* Function Inputs & Presets Panel */}
      <div className="p-4 rounded-2xl glass-panel space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="font-bold text-sm text-white uppercase tracking-wider">
            Functions f(x)
          </h3>
          <div className="flex items-center gap-2">
            {/* Presets Dropdown */}
            <select
              onChange={(e) => {
                if (e.target.value) {
                  updateFunction(functions[0].id, { expression: e.target.value });
                  e.target.value = '';
                }
              }}
              defaultValue=""
              className="p-1.5 rounded-lg bg-slate-800 border border-slate-700 text-xs text-white"
            >
              <option value="" disabled>
                Load Preset Function...
              </option>
              {PRESETS.map((p) => (
                <option key={p.label} value={p.expr}>
                  {p.label}
                </option>
              ))}
            </select>

            <button
              onClick={addFunction}
              className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add Function</span>
            </button>
          </div>
        </div>

        {/* Function Row List */}
        <div className="space-y-2">
          {functions.map((fn, idx) => (
            <div
              key={fn.id}
              className="flex items-center gap-2 p-2 rounded-xl bg-slate-900/60 border border-slate-800"
            >
              <span
                className="w-3 h-3 rounded-full shrink-0 shadow-sm"
                style={{ backgroundColor: fn.color }}
              />
              <span className="font-mono text-xs text-slate-400">f{idx + 1}(x) =</span>
              <input
                type="text"
                value={fn.expression}
                onChange={(e) => updateFunction(fn.id, { expression: e.target.value })}
                placeholder="e.g. sin(x) or x^2 - 4"
                className="flex-1 bg-transparent text-white font-mono text-sm focus:outline-none"
              />
              <button
                onClick={() => updateFunction(fn.id, { visible: !fn.visible })}
                title={fn.visible ? 'Hide Function' : 'Show Function'}
                className="p-1 rounded text-slate-400 hover:text-white"
              >
                {fn.visible ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4 opacity-40" />}
              </button>
              <button
                onClick={() => removeFunction(fn.id)}
                title="Remove Function"
                className="p-1 rounded text-slate-400 hover:text-rose-400"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Interactive 2D Graph Canvas */}
      <div className="relative w-full h-[450px] md:h-[500px] rounded-2xl overflow-hidden glass-panel border border-slate-700/60 shadow-2xl">
        <canvas
          ref={canvasRef}
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={() => {
            setIsDragging(false);
            setHoverPoint(null);
          }}
          onWheel={handleWheel}
          className="w-full h-full cursor-crosshair touch-none"
        />

        {/* Floating Zoom & Reset Toolbar */}
        <div className="absolute bottom-4 right-4 flex items-center gap-1.5 p-1.5 rounded-xl bg-slate-900/90 border border-slate-700 backdrop-blur-md shadow-lg">
          <button
            onClick={() => handleZoom(1.25)}
            title="Zoom In"
            className="p-2 rounded-lg hover:bg-slate-800 text-slate-300 hover:text-white transition-colors"
          >
            <ZoomIn className="w-4 h-4" />
          </button>
          <button
            onClick={() => handleZoom(0.8)}
            title="Zoom Out"
            className="p-2 rounded-lg hover:bg-slate-800 text-slate-300 hover:text-white transition-colors"
          >
            <ZoomOut className="w-4 h-4" />
          </button>
          <button
            onClick={handleReset}
            title="Reset Origin (0,0)"
            className="p-2 rounded-lg hover:bg-slate-800 text-slate-300 hover:text-white transition-colors"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
        </div>

        {/* Floating Inspection Legend */}
        <div className="absolute top-4 left-4 p-2 rounded-xl bg-slate-900/80 border border-slate-700 backdrop-blur-md text-[11px] font-mono text-slate-400 space-y-1 pointer-events-none">
          <div>
            Center: ({centerX.toFixed(2)}, {centerY.toFixed(2)})
          </div>
          <div>Zoom Scale: {scale.toFixed(1)} px/unit</div>
          <div className="text-[10px] text-slate-500">Drag to Pan • Wheel to Zoom</div>
        </div>
      </div>
    </div>
  );
};

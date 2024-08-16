"use client"
import React, { useRef, useState, useEffect, MouseEvent } from 'react';

const DrawingApp: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [color, setColor] = useState<string>('#000000');
  const [penSize, setPenSize] = useState<number>(5);
  const [isDrawing, setIsDrawing] = useState<boolean>(false);
  const [isErasing, setIsErasing] = useState<boolean>(false);
  const [canvasSize, setCanvasSize] = useState({ width: window.innerWidth, height: window.innerHeight });

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const context = canvas.getContext('2d');
    if (!context) return;

    // Set canvas size
    canvas.width = canvasSize.width;
    canvas.height = canvasSize.height;

    context.lineCap = 'round';
    context.lineJoin = 'round';

    const handleResize = () => {
      const tempCanvas = document.createElement('canvas');
      const tempContext = tempCanvas.getContext('2d');

      if (tempContext && canvas) {
        // Copy existing canvas to temporary canvas
        tempCanvas.width = canvas.width;
        tempCanvas.height = canvas.height;
        tempContext.drawImage(canvas, 0, 0);

        // Resize the canvas
        setCanvasSize({ width: window.innerWidth, height: window.innerHeight });
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;

        // Draw the temporary canvas back onto the resized canvas
        context.drawImage(tempCanvas, 0, 0);
      }
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [canvasSize]);

  const startDrawing = (e: MouseEvent<HTMLCanvasElement>) => {
    const context = canvasRef.current?.getContext('2d');
    if (!context) return;

    context.beginPath();
    context.moveTo(e.nativeEvent.offsetX, e.nativeEvent.offsetY);
    setIsDrawing(true);
  };

  const draw = (e: MouseEvent<HTMLCanvasElement>) => {
    if (!isDrawing) return;
    const context = canvasRef.current?.getContext('2d');
    if (!context) return;

    context.lineWidth = penSize;
    context.strokeStyle = isErasing ? '#FFFFFF' : color;
    context.lineTo(e.nativeEvent.offsetX, e.nativeEvent.offsetY);
    context.stroke();
  };

  const stopDrawing = () => {
    setIsDrawing(false);
  };

  const toggleEraser = () => {
    setIsErasing(!isErasing);
  };

  return (
    <div>
      <div>
        <label>Color: </label>
        <input
          type="color"
          value={color}
          onChange={(e) => setColor(e.target.value)}
        />
      </div>
      <div>
        <label>Pen Size: </label>
        <input
          type="range"
          min="1"
          max="50"
          value={penSize}
          onChange={(e) => setPenSize(parseInt(e.target.value))}
        />
      </div>
      <div>
        <button onClick={toggleEraser}>
          {isErasing ? 'Switch to Pen' : 'Switch to Eraser'}
        </button>
      </div>
      <canvas
        ref={canvasRef}
        onMouseDown={startDrawing}
        onMouseMove={draw}
        onMouseUp={stopDrawing}
        onMouseLeave={stopDrawing}
      />
    </div>
  );
};

export default function Home() {
  return (
    <main>
      <DrawingApp />
    </main>
  );
}

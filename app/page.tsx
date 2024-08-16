"use client"
import React, { useRef, useState, MouseEvent, useLayoutEffect, useCallback } from 'react';

const DrawingApp: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const canvasContainerRef = useRef<HTMLDivElement>(null);
  const [color, setColor] = useState<string>('#000000');
  const [penSize, setPenSize] = useState<number>(5);
  const [isDrawing, setIsDrawing] = useState<boolean>(false);
  const [isErasing, setIsErasing] = useState<boolean>(false);
  const [search, setSearch] = useState<string>('');

  const startDrawing = useCallback((x: number, y: number) => {
    const context = canvasRef.current?.getContext('2d');
    if (!context) return;

    context.beginPath();
    context.moveTo(x, y);
    setIsDrawing(true);
  }, []);

  const draw = useCallback((x: number, y: number) => {
    if (!isDrawing) return;
    const context = canvasRef.current?.getContext('2d');
    if (!context) return;

    context.lineWidth = penSize;
    context.strokeStyle = isErasing ? '#FFFFFF' : color;
    context.lineTo(x, y);
    context.stroke();
  }, [isDrawing, isErasing, color, penSize]);

  // Touch Event Handlers
  const handleTouchStart = useCallback((e: React.TouchEvent<HTMLCanvasElement>) => {
    const touch = e.touches[0];
    const rect = canvasRef.current?.getBoundingClientRect();
    if (rect) {
      startDrawing(touch.clientX - rect.left, touch.clientY - rect.top);
    }
  }, [startDrawing]);

  const handleTouchMove = useCallback((e: React.TouchEvent<HTMLCanvasElement>) => {
    const touch = e.touches[0];
    const rect = canvasRef.current?.getBoundingClientRect();
    if (rect) {
      draw(touch.clientX - rect.left, touch.clientY - rect.top);
    }
    e.preventDefault(); // Prevent scrolling while drawing
  }, [draw])

  useLayoutEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const canvasContainer = canvasContainerRef.current
    if (!canvasContainer) return;

    const resize = () => {
      const context = canvas.getContext('2d');
      if (!context) return;
      // clone
      const imageData = context.getImageData(0, 0, canvas.width, canvas.height);
      // resize and preserve content
      canvas.width = Math.max(canvasContainer.clientWidth, canvas.width);
      canvas.height = Math.max(canvasContainer.clientHeight, canvas.height);
      // redraw
      context.putImageData(imageData, 0, 0);
      context.lineCap = 'round';
      context.lineJoin = 'round';
    }
    resize()
    window.addEventListener('resize', resize);
    canvas.addEventListener('touchstart', handleTouchStart, { passive: false });
    canvas.addEventListener('touchmove', handleTouchMove, { passive: false });
    return () => {
      canvas.removeEventListener('touchstart', handleTouchStart);
      canvas.removeEventListener('touchmove', handleTouchMove);
      window.removeEventListener('resize', resize);
    }
  }, [handleTouchMove, handleTouchStart]);

  const onMouseDown = (e: MouseEvent<HTMLCanvasElement>) => {
    const context = canvasRef.current?.getContext('2d');
    if (!context) return;

    startDrawing(e.nativeEvent.offsetX, e.nativeEvent.offsetY);
  };

  const onMouseMove = (e: MouseEvent<HTMLCanvasElement>) => {
    if (!isDrawing) return;
    const context = canvasRef.current?.getContext('2d');
    if (!context) return;

    draw(e.nativeEvent.offsetX, e.nativeEvent.offsetY);
  };


  const stopDrawing = () => {
    setIsDrawing(false);
  };

  const tools: {
    name: string;
    icon: string;
    action: () => void;
    isActive: boolean;
  }[] = [
      {
        name: 'eraser',
        icon: 'eraser.svg',
        action: () => {
          setIsErasing(true);
        },
        isActive: isErasing
      },
      {
        name: 'pen',
        icon: 'pen.svg',
        action: () => {
          setIsErasing(false);
        },
        isActive: !isErasing
      },
      {
        name: 'clear',
        icon: 'trash.svg',
        action: () => {
          const context = canvasRef.current?.getContext('2d');
          if (!context) return;
          context.clearRect(0, 0, canvasRef.current?.width || 0, canvasRef.current?.height || 0);
        },
        isActive: false
      }
    ]

  const penSizes: {
    name: string;
    size: number;
  }[] = [
      {
        name: 'x-small',
        size: 1
      },
      {
        name: 'small',
        size: 5
      },
      {
        name: 'medium',
        size: 10
      },
      {
        name: 'large',
        size: 15
      },
      {
        name: 'x-large',
        size: 20
      }
    ]

  const colors: {
    name: string,
    code: string
  }[] = [
      { name: 'black', code: '#000000' },
      { name: 'red', code: '#FF0000' },
      { name: 'green', code: '#00FF00' },
      { name: 'blue', code: '#0000FF' },
      { name: 'yellow', code: '#FFFF00' },
      { name: 'cyan', code: '#00FFFF' },
      { name: 'magenta', code: '#FF00FF' },
      { name: 'white', code: '#FFFFFF' },
    ]

  return (
    <div className='w-dvw h-dvh flex flex-col gap-2 overflow-hidden'>
      <div className='text-xs flex px-3 justify-center'>
        The opposite of simplicity, let the user search and choose instead. Inspired by Craigslist
      </div>
      <input className='input input-bordered m-3 mt-0 flex-shrink-0' type='text'
        onInput={(e: React.ChangeEvent<HTMLInputElement>) => setSearch(e.target.value)}
        value={search} />
      <div className='flex gap-2 flex-wrap mx-3'>
        {
          colors.filter(({ name }) => {
            return name.includes(search)
          }).map(({ name, code }) => {
            return <div key={name}
              onClick={() => {
                setColor(code)
              }}
              className={`btn btn-sm ${color == code ? 'btn-primary' : ''}`}
            >
              {name}
              <div
                className='w-3 h-3'
                style={{ backgroundColor: code }}
              >
              </div>
            </div>
          })
        }
        {
          penSizes.filter(({ name }) => {
            return name.includes(search)
          }).map(({ name, size }) => {
            return <div key={name}
              className={`btn btn-sm ${size == penSize ? 'btn-primary' : ''}`}
              onClick={() => setPenSize(size)}
            >
              {name}
              <div
                className={`rounded-full ${size == penSize ? 'bg-white' : 'bg-black'}`}
                style={{
                  width: size,
                  height: size,
                }}
              />
            </div>
          })
        }
        {
          tools.filter(({ name }) => {
            return name.includes(search)
          }).map(({ name, icon, action, isActive }) => {
            return <div
              className={`btn btn-sm ${isActive ? 'btn-primary' : ''}`}
              key={name} onClick={action}>
              {name}
              <img src={icon} />
            </div>
          })
        }
      </div>
      <div
        ref={canvasContainerRef}
        className="border-4 m-4 border-black rounded-lg overflow-auto flex-grow flex-shrink"
      >
        <canvas
          ref={canvasRef}
          onMouseDown={onMouseDown}
          onMouseMove={onMouseMove}
          onMouseUp={stopDrawing}
          onMouseLeave={stopDrawing}
          onTouchEnd={stopDrawing}
          onTouchCancel={stopDrawing}
        />
      </div>
    </div >
  );
};

export default function Home() {
  return (
    <main>
      <DrawingApp />
    </main>
  );
}

"use client"
import React, { useRef, useState, useEffect, MouseEvent, useLayoutEffect } from 'react';

const DrawingApp: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const canvasContainerRef = useRef<HTMLDivElement>(null);
  const [color, setColor] = useState<string>('#000000');
  const [penSize, setPenSize] = useState<number>(5);
  const [isDrawing, setIsDrawing] = useState<boolean>(false);
  const [isErasing, setIsErasing] = useState<boolean>(false);
  const [search, setSearch] = useState<string>('');

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
    return () => {
      window.removeEventListener('resize', resize);
    }
  }, []);


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

  const tools: {
    name: string;
    icon: string;
    action: () => void;
  }[] = [
      {
        name: 'eraser',
        icon: 'eraser',
        action: () => {
          setIsErasing(true);
        }
      },
      {
        name: 'pen',
        icon: 'pen',
        action: () => {
          setIsErasing(false);
        }
      },
      {
        name: 'clear',
        icon: 'trash',
        action: () => {
          const context = canvasRef.current?.getContext('2d');
          if (!context) return;
          context.clearRect(0, 0, canvasRef.current?.width || 0, canvasRef.current?.height || 0);
        }
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
    <div className='w-screen h-screen flex flex-col gap-2 overflow-hidden'>
      <input className='input input-bordered m-3 flex-shrink-0' type='text'
        onInput={(e: React.ChangeEvent<HTMLInputElement>) => setSearch(e.target.value)}
        value={search} />
      <div className='flex gap-2 flex-wrap mx-3'>
        {
          colors.filter(({ name }) => {
            return name.includes(search)
          }).map(({ name, code }) => {
            return <div key={name}
              className='btn btn-sm'
            >
              {name}
              <div
                className='w-3 h-3'
                style={{ backgroundColor: code }}
                onClick={() => setColor(code)}
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
              className='btn btn-sm'
              onClick={() => setPenSize(size)}
            >
              {name}
              <div
                className='bg-black rounded-full'
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
          }).map(({ name, icon, action }) => {
            return <div
              className='btn btn-sm'
              key={name} onClick={action}>
              {name}
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
          onMouseDown={startDrawing}
          onMouseMove={draw}
          onMouseUp={stopDrawing}
          onMouseLeave={stopDrawing}
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

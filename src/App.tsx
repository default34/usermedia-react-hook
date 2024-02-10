import React, { useRef, useEffect, useState } from 'react';
import { useUserMedia } from './useUserMediaHook';

const CONSTRAINTS = {
  audio: false,
  video: {
    width: { min: 1024, ideal: 1280, max: 1920 },
    height: { min: 576, ideal: 720, max: 1080 },
    facingMode: 'user'
  },
};

function App() {
  const videoRef = useRef() as React.MutableRefObject<HTMLVideoElement>;
  const canvasRef = useRef() as React.MutableRefObject<HTMLCanvasElement>;
  const [snapshot, setSnapshot] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [mediaStream, error] = useUserMedia(CONSTRAINTS);
  
  const onCanPlay = async () => {
    await videoRef.current?.play();
  };
  
  const makeSnapshot = () => {
    const video = videoRef.current;
    const canvas = canvasRef.current;
    
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    
    const ctx = canvas.getContext('2d', { willReadFrequently: true });
    ctx?.clearRect(0, 0, canvas.width, canvas.height);
    ctx?.drawImage(video, 0, 0);
    
    setSnapshot(canvas.toDataURL('image/png'));
  };
  
  const updateClipboard = (str: string) => {
    navigator.clipboard.writeText(str);
  };
  
  useEffect(() => {
    if (mediaStream && videoRef.current && !videoRef.current.srcObject) {
      videoRef.current.srcObject = mediaStream;
    }
  }, [mediaStream]);
  
  useEffect(() => {
    videoRef.current.onloadstart = () => {
      setIsLoading(true);
    };
    
    videoRef.current.onloadeddata = () => {
      setIsLoading(false);
    };
    
    videoRef.current.oncanplay = async () => {
      await onCanPlay();
    };
  }, []);
  
  useEffect(() => {
    if (error) {
      console.log(error);
    }
  }, [error]);
  
  return (
    <div className="h-full w-full flex p-16">
      <div className="h-full w-1/2 px-2 flex flex-col items-center">
        <video
          muted
          autoPlay
          playsInline
          ref={videoRef}
          className="w-full"
        />
        
        <canvas ref={canvasRef} className="hidden"/>
        
        <div className="flex justify-center mt-6">
          {!isLoading && (
            <button
              onClick={makeSnapshot}
              className="bg-slate-500 text-white p-2 rounded-md"
            >
              Make snapshot
            </button>
          )}
          
          {snapshot && (
            <button
              onClick={() => updateClipboard(snapshot)}
              className="bg-slate-500 text-white p-2 rounded-md ml-3"
            >
              Copy base64 string
            </button>
          )}
        </div>
      </div>
      
      <div className="h-full w-1/2 px-2">
        <img src={snapshot} alt="snapshot"/>
        
        {snapshot && (
          <div
            className="mt-6 p-2 h-96 w-full break-words overflow-y-scroll
            overflow-x-hidden border border-solid border-gray-300"
          >
            {snapshot}
          </div>
        )}
      </div>
    </div>
  );
}

export default App;

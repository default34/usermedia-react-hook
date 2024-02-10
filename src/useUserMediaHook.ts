import { useState, useEffect } from "react";

export const useUserMedia = (constraints: MediaStreamConstraints) => {
  const [mediaStream, setMediaStream] = useState<MediaStream | null>(null);
  const [error, setError] = useState<any>(null);
  
  useEffect(() => {
    const enableStream = async () => {
      if (navigator?.mediaDevices && navigator.mediaDevices?.getUserMedia) {
        const originalGetUserMedia = navigator.mediaDevices.getUserMedia.bind(navigator.mediaDevices);
        
        navigator.mediaDevices.getUserMedia = (cs: MediaStreamConstraints): Promise<MediaStream> => {
          return originalGetUserMedia(cs).then(
            stream => Promise.resolve(stream),
            error => Promise.reject(error)
            /*
            Check error description on MDN
            https://developer.mozilla.org/en-US/docs/Web/API/MediaDevices/getUserMedia#exceptions
            * */
          );
        };
      }
      
      try {
        const stream = await navigator.mediaDevices.getUserMedia(constraints);
        setMediaStream(stream);
      } catch (error) {
        if (error instanceof DOMException) {
          const { name, message } = error;
          setError({ name, message });
        }
      }
    };
    
    if (!mediaStream) {
      enableStream();
    }
  }, [mediaStream, constraints]);
  
  useEffect(() => {
    return () => {
      if (!mediaStream) {
        return;
      }
      
      mediaStream.getTracks().forEach((track: MediaStreamTrack) => {
        track.stop();
      });
    }
  }, []);
  
  return [mediaStream, error];
};

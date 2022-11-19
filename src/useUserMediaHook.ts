import { useState, useEffect } from "react";

export const useUserMedia = (constraints: MediaStreamConstraints, onError: (e: string) => void) => {
  const [mediaStream, setMediaStream] = useState<MediaStream | null>(null);

  useEffect(() => {
    const enableStream = async () => {
      if (navigator.mediaDevices.getUserMedia) {
        const origGetUserMedia = navigator.mediaDevices.getUserMedia.bind(navigator.mediaDevices);

        navigator.mediaDevices.getUserMedia = (cs: MediaStreamConstraints): Promise<MediaStream> => {
          return origGetUserMedia(cs).then(
            stream => Promise.resolve(stream),
            error => Promise.reject(error.name)
          );
        };
      }

      try {
        const stream = await navigator.mediaDevices.getUserMedia(constraints);
        setMediaStream(stream);
      } catch(error) {
        onError(error as string);
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

  return mediaStream;
};

import { useEffect, useRef } from "react";

function VideoPlayer() {

  const videoRef = useRef();

  useEffect(() => {

    async function startCamera() {

      const stream = await navigator.mediaDevices.getUserMedia({
        video: true,
        audio: true
      });

      videoRef.current.srcObject = stream;

    }

    startCamera();

  }, []);

  return (
    <div>

      <h3>My Camera</h3>

      <video
        ref={videoRef}
        autoPlay
        playsInline
        muted
        style={{width:"300px"}}
      />

    </div>
  );
}

export default VideoPlayer;
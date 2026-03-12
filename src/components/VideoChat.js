import { useEffect, useRef } from "react";
import socket from "../socket";

function VideoChat() {
  const myVideo = useRef();
  const userVideo = useRef();
  const peerRef = useRef();
  const streamRef = useRef();

  useEffect(() => {
    async function startCamera() {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: true,
        audio: true,
      });
      streamRef.current = stream;
      myVideo.current.srcObject = stream;
    }
    startCamera();
  }, []);

  // ICE & signaling logic remain same
  useEffect(() => {
    socket.on("receive-call", async (data) => {
      const peer = new RTCPeerConnection();
      streamRef.current.getTracks().forEach((track) => {
        peer.addTrack(track, streamRef.current);
      });
      peer.ontrack = (event) => {
        userVideo.current.srcObject = event.streams[0];
      };
      peer.onicecandidate = (event) => {
        if (event.candidate) {
          socket.emit("ice-candidate", { candidate: event.candidate, to: data.from });
        }
      };
      await peer.setRemoteDescription(data.offer);
      const answer = await peer.createAnswer();
      await peer.setLocalDescription(answer);
      socket.emit("make-answer", { answer, to: data.from });
      peerRef.current = peer;
    });

    socket.on("answer-made", async (data) => {
      if (peerRef.current) await peerRef.current.setRemoteDescription(data.answer);
    });

    socket.on("ice-candidate", async (candidate) => {
      if (peerRef.current) await peerRef.current.addIceCandidate(candidate);
    });
  }, []);

  const hangUp = () => {
    if (peerRef.current) {
      peerRef.current.close();
      peerRef.current = null;
    }
    if (userVideo.current) userVideo.current.srcObject = null;
  };

  return (
    <div style={styles.container}>
      <div style={styles.videoWrapper}>
        <h4>My Video</h4>
        <video ref={myVideo} autoPlay muted playsInline style={styles.video} />
      </div>

      <div style={styles.videoWrapper}>
        <h4>Remote Video</h4>
        <video ref={userVideo} autoPlay playsInline style={styles.video} />
      </div>

      <div style={styles.buttons}>
        <button style={styles.button} onClick={() => {
          const id = prompt("Enter user ID to call");
          socket.emit("call-user", { to: id, from: socket.id });
        }}>Call User</button>
        <button style={{...styles.button, backgroundColor: "#e74c3c"}} onClick={hangUp}>Hang Up</button>
      </div>
    </div>
  );
}

const styles = {
  container: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    gap: 15,
  },
  videoWrapper: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
  },
  video: {
    width: 300,
    height: 220,
    borderRadius: 10,
    boxShadow: "0 4px 10px rgba(0,0,0,0.2)",
    backgroundColor: "#000",
  },
  buttons: {
    display: "flex",
    gap: 10,
    marginTop: 10,
  },
  button: {
    padding: "10px 15px",
    borderRadius: 5,
    border: "none",
    backgroundColor: "#3498db",
    color: "#fff",
    cursor: "pointer",
    fontWeight: "bold",
  },
};

export default VideoChat;
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
        audio: true
      });

      streamRef.current = stream;
      myVideo.current.srcObject = stream;
    }

    startCamera();

  }, []);

  const callUser = async (userId) => {
    const peer = new RTCPeerConnection();

    streamRef.current.getTracks().forEach(track => {
      peer.addTrack(track, streamRef.current);
    });

    peer.ontrack = (event) => {
      userVideo.current.srcObject = event.streams[0];
    };

    // ICE Candidate
    peer.onicecandidate = (event) => {
      if (event.candidate) {
        socket.emit("ice-candidate", { candidate: event.candidate, to: userId });
      }
    };

    const offer = await peer.createOffer();
    await peer.setLocalDescription(offer);

    socket.emit("call-user", {
      to: userId,
      from: socket.id,
      offer
    });

    peerRef.current = peer;
  };

  useEffect(() => {

    socket.on("receive-call", async (data) => {
      const peer = new RTCPeerConnection();

      streamRef.current.getTracks().forEach(track => {
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
      await peerRef.current.setRemoteDescription(data.answer);
    });

    socket.on("ice-candidate", async (candidate) => {
      if (peerRef.current) {
        await peerRef.current.addIceCandidate(candidate);
      }
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
    <div>

      <h3>My Video</h3>
      <video ref={myVideo} autoPlay muted playsInline width="300" />

      <h3>Remote Video</h3>
      <video ref={userVideo} autoPlay playsInline width="300" />

      <div style={{marginTop:"10px"}}>
        <button onClick={() => callUser(prompt("Enter user ID to call"))}>Call User</button>
        <button onClick={hangUp} style={{marginLeft:"10px"}}>Hang Up</button>
      </div>

    </div>
  );
}

export default VideoChat;
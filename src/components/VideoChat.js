import { useEffect, useRef, useState } from "react";
import socket from "../socket";

function VideoChat() {
  const myVideo = useRef();
  const userVideo = useRef();
  const peerRef = useRef();
  const streamRef = useRef();

  const [callingId, setCallingId] = useState("");
  const [myId, setMyId] = useState("");
  const [inCall, setInCall] = useState(false);

  const configuration = {
    iceServers: [
      { urls: "stun:stun.l.google.com:19302" },
      {
        urls: "turn:openrelay.metered.ca:80",
        username: "openrelayproject",
        credential: "openrelayproject",
      },
    ],
  };

  // get my ID
  useEffect(() => {
    socket.on("connect", () => {
      setMyId(socket.id);
    });
  }, []);

  // start camera
  useEffect(() => {
    async function startCamera() {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: true,
        audio: true,
      });
      streamRef.current = stream;
      if (myVideo.current) myVideo.current.srcObject = stream;
    }
    startCamera();
  }, []);

  // SOCKET EVENTS
  useEffect(() => {
    // RECEIVE CALL
    socket.on("receive-call", async (data) => {
      const peer = new RTCPeerConnection(configuration);

      streamRef.current.getTracks().forEach((track) =>
        peer.addTrack(track, streamRef.current)
      );

      peer.ontrack = (event) => {
        userVideo.current.srcObject = event.streams[0];
      };

      peer.onicecandidate = (event) => {
        if (event.candidate) {
          socket.emit("ice-candidate", {
            to: data.from,
            candidate: event.candidate,
          });
        }
      };

      await peer.setRemoteDescription(
        new RTCSessionDescription(data.offer)
      );

      const answer = await peer.createAnswer();
      await peer.setLocalDescription(answer);

      socket.emit("make-answer", {
        to: data.from,
        answer,
      });

      peerRef.current = peer;
      setInCall(true);
    });

    // ANSWER RECEIVED
    socket.on("answer-made", async (data) => {
      await peerRef.current.setRemoteDescription(
        new RTCSessionDescription(data.answer)
      );
      setInCall(true);
    });

    // ICE
    socket.on("ice-candidate", async (data) => {
      if (data.candidate) {
        try {
          await peerRef.current.addIceCandidate(data.candidate);
        } catch (err) {
          console.log("ICE error:", err);
        }
      }
    });

    return () => {
      socket.off("receive-call");
      socket.off("answer-made");
      socket.off("ice-candidate");
    };
  }, []);

  // CALL USER
  const callUser = async () => {
    const peer = new RTCPeerConnection(configuration);

    streamRef.current.getTracks().forEach((track) =>
      peer.addTrack(track, streamRef.current)
    );

    peer.ontrack = (event) => {
      userVideo.current.srcObject = event.streams[0];
    };

    peer.onicecandidate = (event) => {
      if (event.candidate) {
        socket.emit("ice-candidate", {
          to: callingId,
          candidate: event.candidate,
        });
      }
    };

    const offer = await peer.createOffer();
    await peer.setLocalDescription(offer);

    socket.emit("call-user", {
      to: callingId,
      offer,
    });

    peerRef.current = peer;
  };

  const hangUp = () => {
    peerRef.current?.close();
    peerRef.current = null;
    userVideo.current.srcObject = null;
    setInCall(false);
  };

  return (
    <div>
      <h3>Your ID: {myId}</h3>

      <video ref={myVideo} autoPlay muted width="300" />
      <video ref={userVideo} autoPlay width="300" />

      {!inCall && (
        <>
          <input
            placeholder="Enter ID"
            value={callingId}
            onChange={(e) => setCallingId(e.target.value)}
          />
          <button onClick={callUser}>Call</button>
        </>
      )}

      {inCall && <button onClick={hangUp}>Hang Up</button>}
    </div>
  );
}

export default VideoChat;
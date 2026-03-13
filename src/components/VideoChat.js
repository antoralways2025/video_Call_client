import { useEffect, useRef, useState } from "react";
import socket from "../socket";

function VideoChat() {
  const myVideo = useRef();
  const userVideo = useRef();
  const peerRef = useRef();
  const streamRef = useRef();

  const [callingId, setCallingId] = useState("");
  const [inCall, setInCall] = useState(false);

  // STUN configuration (VERY IMPORTANT)
  const configuration = {
    iceServers: [
      { urls: "stun:stun.l.google.com:19302" }
    ]
  };

  // Start camera
  useEffect(() => {
    async function startCamera() {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: true,
        audio: true,
      });

      streamRef.current = stream;
      if (myVideo.current) {
        myVideo.current.srcObject = stream;
      }
    }

    startCamera();
  }, []);

  // Signaling listeners
  useEffect(() => {

    // Receive call
    socket.on("receive-call", async (data) => {

      const peer = new RTCPeerConnection(configuration);

      streamRef.current.getTracks().forEach((track) => {
        peer.addTrack(track, streamRef.current);
      });

      peer.ontrack = (event) => {
        if (userVideo.current) {
          userVideo.current.srcObject = event.streams[0];
        }
      };

      peer.onicecandidate = (event) => {
        if (event.candidate) {
          socket.emit("ice-candidate", {
            candidate: event.candidate,
            to: data.from
          });
        }
      };

      await peer.setRemoteDescription(
        new RTCSessionDescription(data.offer)
      );

      const answer = await peer.createAnswer();
      await peer.setLocalDescription(answer);

      socket.emit("make-answer", {
        answer: answer,
        to: data.from
      });

      peerRef.current = peer;
      setInCall(true);
    });

    // Answer received
    socket.on("answer-made", async (data) => {

      if (peerRef.current) {
        await peerRef.current.setRemoteDescription(
          new RTCSessionDescription(data.answer)
        );

        setInCall(true);
      }

    });

    // ICE candidate received
    socket.on("ice-candidate", async (candidate) => {

      if (peerRef.current && candidate) {
        try {
          await peerRef.current.addIceCandidate(candidate);
        } catch (error) {
          console.error("ICE error:", error);
        }
      }

    });

    // Cleanup
    return () => {
      socket.off("receive-call");
      socket.off("answer-made");
      socket.off("ice-candidate");
    };

  }, []);

  // Call user
  const callUser = async (id) => {

    if (!id) return alert("Enter user ID");

    const peer = new RTCPeerConnection(configuration);

    streamRef.current.getTracks().forEach((track) => {
      peer.addTrack(track, streamRef.current);
    });

    peer.ontrack = (event) => {
      if (userVideo.current) {
        userVideo.current.srcObject = event.streams[0];
      }
    };

    peer.onicecandidate = (event) => {
      if (event.candidate) {
        socket.emit("ice-candidate", {
          candidate: event.candidate,
          to: id
        });
      }
    };

    const offer = await peer.createOffer();
    await peer.setLocalDescription(offer);

    socket.emit("call-user", {
      to: id,
      from: socket.id,
      offer: offer
    });

    peerRef.current = peer;
  };

  // Hang up call
  const hangUp = () => {

    if (peerRef.current) {
      peerRef.current.close();
      peerRef.current = null;
    }

    if (userVideo.current) {
      userVideo.current.srcObject = null;
    }

    setInCall(false);
  };

  return (
    <div style={styles.container}>

      <div style={styles.videosContainer}>

        <div style={styles.videoWrapper}>
          <video
            ref={myVideo}
            autoPlay
            muted
            playsInline
            style={styles.video}
          />
          <p style={styles.label}>You</p>
        </div>

        <div style={styles.videoWrapper}>
          <video
            ref={userVideo}
            autoPlay
            playsInline
            style={styles.video}
          />
          <p style={styles.label}>
            {inCall ? "In Call" : "Remote"}
          </p>
        </div>

      </div>

      <div style={styles.controls}>

        {!inCall && (
          <>
            <input
              type="text"
              placeholder="Enter User ID"
              value={callingId}
              onChange={(e) => setCallingId(e.target.value)}
              style={styles.input}
            />

            <button
              style={styles.callButton}
              onClick={() => callUser(callingId)}
            >
              Call
            </button>
          </>
        )}

        {inCall && (
          <button
            style={styles.hangupButton}
            onClick={hangUp}
          >
            Hang Up
          </button>
        )}

      </div>

    </div>
  );
}

const styles = {
  container: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    padding: 20,
    fontFamily: "Arial"
  },

  videosContainer: {
    display: "flex",
    gap: 20,
    flexWrap: "wrap",
    justifyContent: "center",
    marginBottom: 20
  },

  videoWrapper: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center"
  },

  video: {
    width: 320,
    height: 240,
    borderRadius: 12,
    backgroundColor: "#000",
    boxShadow: "0 4px 15px rgba(0,0,0,0.3)"
  },

  label: {
    marginTop: 5,
    fontWeight: "bold",
    color: "#555"
  },

  controls: {
    display: "flex",
    gap: 10,
    flexWrap: "wrap",
    alignItems: "center"
  },

  input: {
    padding: 8,
    borderRadius: 5,
    border: "1px solid #ccc",
    width: 200
  },

  callButton: {
    padding: "10px 20px",
    backgroundColor: "#3498db",
    border: "none",
    borderRadius: 5,
    color: "#fff",
    fontWeight: "bold",
    cursor: "pointer"
  },

  hangupButton: {
    padding: "10px 20px",
    backgroundColor: "#e74c3c",
    border: "none",
    borderRadius: 5,
    color: "#fff",
    fontWeight: "bold",
    cursor: "pointer"
  }
};

export default VideoChat;
import { useEffect, useState } from "react";
import CallButton from "./components/CallButton";
import IncomingCall from "./components/IncomingCall";
import VideoChat from "./components/VideoChat";
import socket from "./socket";

function App() {
  const [myId, setMyId] = useState("");

  useEffect(() => {
    socket.on("connect", () => {
      console.log("My ID:", socket.id);
      setMyId(socket.id);
    });
    return () => {
      socket.off("connect");
    };
  }, []);

  return (
    <div style={styles.container}>
      <h1 style={styles.header}>Video Call App</h1>

      {myId ? (
        <>
          <p style={styles.idText}>Your ID: <b>{myId}</b></p>

          <div style={styles.videoContainer}>
            <VideoChat />
          </div>

          <div style={styles.controls}>
            <CallButton />
            <IncomingCall /> 
          </div>
        </>
      ) : (
        <p style={styles.connecting}>Connecting to server...</p>
      )}
    </div>
  );
}

const styles = {
  container: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    padding: 20,
    fontFamily: "Arial, sans-serif",
    backgroundColor: "#f0f2f5",
    minHeight: "100vh",
  },
  header: {
    marginBottom: 10,
    color: "#333",
  },
  idText: {
    marginBottom: 20,
    color: "#555",
  },
  videoContainer: {
    display: "flex",
    justifyContent: "center",
    gap: 20,
    flexWrap: "wrap",
    marginBottom: 20,
  },
  controls: {
    display: "flex",
    gap: 10,
    flexWrap: "wrap",
  },
  connecting: {
    color: "#888",
  },
};

export default App;
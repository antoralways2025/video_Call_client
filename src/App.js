import { useEffect, useState } from "react";
import CallButton from "./components/CallButton";
import IncomingCall from "./components/IncomingCall";
import VideoChat from "./components/VideoChat";
import socket from "./socket";

function App() {

  const [myId, setMyId] = useState(""); // socket ID রাখার জন্য state

  useEffect(() => {
    socket.on("connect", () => {
      console.log("My ID:", socket.id);
      setMyId(socket.id); // ID আসার পর state update
    });

    // Cleanup listener
    return () => {
      socket.off("connect");
    };
  }, []);

  return (
    <div>
      <h1>Hello Baccah</h1>

      {myId ? (
        <>
          <p>Your Socket ID: {myId}</p>
          <VideoChat />
          <CallButton />
          <IncomingCall />
        </>
      ) : (
        <p>Connecting to server...</p>
      )}
    </div>
  );
}

export default App;
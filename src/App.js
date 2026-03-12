import { useEffect } from "react";
import CallButton from "./components/CallButton";
import IncomingCall from "./components/IncomingCall";
import VideoChat from "./components/VideoChat";
import socket from "./socket";

function App() {

  useEffect(() => {

    socket.on("connect", () => {
      console.log("My ID:", socket.id);
    });

  }, []);

  return (   <div>

      <h1>Video Call App</h1>

      <VideoChat />

      <CallButton />

      <IncomingCall />

   </div>)
     
  
}

export default App;
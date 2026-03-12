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

      <h1> Hello  Baccah _ Your ID: {socket.id}</h1>
        
      <VideoChat />
<div>{socket.id}</div>
      <CallButton />

      <IncomingCall />

   </div>)
     
  
}

export default App;
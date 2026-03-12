import { useEffect, useState } from "react";
import socket from "../socket";

function IncomingCall() {

  const [call, setCall] = useState(null);

  useEffect(() => {

    socket.on("receive-call", (data) => {
      console.log("Incoming call:", data);
      setCall(data);
    });

  }, []);

  const acceptCall = () => {
    console.log("Call Accepted");
  };

  const rejectCall = () => {
    console.log("Call Rejected");
    setCall(null);
  };

  if (!call) return null;

  return (
    <div style={{border:"1px solid black", padding:"20px", marginTop:"20px"}}>

      <h3>📞 Incoming Call</h3>

      <p>From: {call.from}</p>

      <button onClick={acceptCall}>
        Accept
      </button>

      <button onClick={rejectCall} style={{marginLeft:"10px"}}>
        Reject
      </button>

    </div>
  );
}

export default IncomingCall;
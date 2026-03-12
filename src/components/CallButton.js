import { useState } from "react";
import socket from "../socket";

function CallButton() {

  const [userId, setUserId] = useState("");

  const callUser = () => {

    socket.emit("call-user", {
      to: userId,
      from: socket.id,
      signal: "calling data"
    });

  };

  return (
    <div>

      <input
        type="text"
        placeholder="Enter user socket id"
        value={userId}
        onChange={(e) => setUserId(e.target.value)}
      />

      <button onClick={callUser}>
        Call User
      </button>

    </div>
  );
}

export default CallButton;
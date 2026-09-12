import React from "react";

const VoiceAssistant = () => {
  return (
    <button
      style={{
        position: "fixed",
        bottom: "100px",
        left: "20px",
        width: "80px",
        height: "80px",
        borderRadius: "50%",
        background: "red",
        color: "white",
        fontSize: "40px",
        border: "5px solid yellow",
        zIndex: "999999999",
      }}
    >
      AI
    </button>
  );
};

export default VoiceAssistant;
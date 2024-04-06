import React from "react";
import { ibm_plex_serif } from "../fonts";

const AfterUpload = ({ messages }) => {
  return (
    <div>
      {messages.length ? (
        <p>
          {messages.map((m) => (
            <span className="message">{m}</span>
          ))}
        </p>
      ) : (
        <h1>File Upload Successful!</h1>
      )}
    </div>
  );
};

export default AfterUpload;

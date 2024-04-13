import React from "react";
import { ibm_plex_serif } from "../fonts";

const AfterUpload = ({ messages }) => {
  return (
    <div className="">
      {messages.length && (
        <p>
          {messages.map((m) => (
            <span className="message">{m}</span>
          ))}
        </p>
      )}
    </div>
  );
};

export default AfterUpload;

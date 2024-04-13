import React from "react";
import { ibm_plex_serif } from "../fonts";

const AfterUpload = ({ messages }) => {
  const renderTextWithLineBreaks = (text) => {
    return text.split("\n").map((line, index) => <div key={index}>{line}</div>);
  };

  return (
    <div>
      {messages.length ? (
        <div>{renderTextWithLineBreaks(messages)}</div>
      ) : (
        <h1>File Upload Successful!</h1>
      )}
    </div>
  );
};

export default AfterUpload;

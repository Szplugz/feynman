import React from "react";
import { ibm_plex_serif } from "../fonts";

const AfterUpload = ({ message }) => {
  return (
    <div>
      {message.length ? (
        <p className={`${ibm_plex_serif.className}`}>{message}</p>
      ) : (
        <h1>File Upload Successful!</h1>
      )}
    </div>
  );
};

export default AfterUpload;

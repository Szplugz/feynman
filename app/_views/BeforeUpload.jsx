import React from "react";

const BeforeUpload = ({ uploadFile }) => {
  return (
    <div>
      <input
        className="hidden"
        type="file"
        id="file-upload"
        onChange={uploadFile}
      ></input>
      <button
        className="upload-button"
        onClick={() => {
          document.getElementById("file-upload").click();
        }}
      >
        Upload pdf
      </button>
    </div>
  );
};

export default BeforeUpload;

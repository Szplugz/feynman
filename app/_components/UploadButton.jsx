import React from "react";

const UploadButton = ({ handleUpload }) => {
  return (
    <div className="">
      <input
        className="hidden"
        type="file"
        id="file-upload"
        onChange={handleUpload}
      ></input>
      <button
        className="link flex upload-button bg-olive py-4 px-8 rounded-xl text-ivory hover:bg-stone"
        onClick={() => {
          document.getElementById("file-upload").click();
        }}
      >
        <span className="mask h-4 relative p-0 overflow-hidden">
          <div className="link-container [transition:transform_0.4s_ease]">
            <span className="link-title1 leading-4 origin-[right_center] block [transition:transform_0.2s_ease]">
              Upload PDF
            </span>
            <span className="link-title2 leading-4 block [transition:transform_0.2s_ease] rotate-[20deg] origin-[left_center]">
              Upload PDF
            </span>
          </div>
        </span>
      </button>
    </div>
  );
};

export default UploadButton;

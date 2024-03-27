"use client";

import Image from "next/image";

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-between p-24">
      <input className="hidden" type="file" id="file-upload"></input>
      <button
        className="upload-button"
        onClick={() => {
          document.getElementById("file-upload").click();
        }}
      >
        Upload pdf
      </button>
    </main>
  );
}

"use client";

import Image from "next/image";
import PDFViewer from "./components/PDFViewer";

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
      <PDFViewer file="https://courses.engr.illinois.edu/cs421/sp2024/lectures/01-02-intro.pdf"></PDFViewer>
    </main>
  );
}

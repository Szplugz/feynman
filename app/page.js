"use client";

import Image from "next/image";
import { useState, useEffect } from "react";
import AfterUpload from "./_views/AfterUpload";
import BeforeUpload from "./_views/BeforeUpload";

// Pieces of state that live here: hasFileUploaded
// In order for a file to have successfully uploaded, it must be sent to the backend,
// and we must get a 200 from the backend, indicating that the file was able to be successfully parsed to json.

export default function Home() {
  const [file, setFile] = useState(null);
  const [hasFileUploaded, setHasFileUploaded] = useState(false);

  const handleFileChange = (file) => {
    // send file to backend
    // if response from api is ok, set hasFileUploadedToTrue
    file && setHasFileUploaded(true);
  };

  const uploadFile = (event) => {
    setFile(event.target.files[0]);
  };

  useEffect(() => {
    handleFileChange(file);
  }, [file]);

  return (
    <main className="flex min-h-screen flex-col items-center justify-between p-24">
      {hasFileUploaded ? (
        <AfterUpload></AfterUpload>
      ) : (
        <BeforeUpload uploadFile={uploadFile}></BeforeUpload>
      )}
    </main>
  );
}

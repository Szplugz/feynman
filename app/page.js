"use client";

import Image from "next/image";
import { useState, useEffect } from "react";
import AfterUpload from "./_views/AfterUpload";
import BeforeUpload from "./_views/BeforeUpload";

// Pieces of state that live here: hasFileUploaded
// In order for a file to have successfully uploaded, it must be sent to the backend,
// and we must get a 200 from the backend, indicating that the file was the correct format and
// was able to be successfully converted to images
// Once the file has successfully been converted to images, the ui should show a loading state until we recieve the first
// piece of data from the server

export default function Home() {
  const [file, setFile] = useState(null);
  const [hasFileUploaded, setHasFileUploaded] = useState(false);

  const handleFileChange = async (file) => {
    // send file to backend
    console.log("Sending file to backend");
    const formData = new FormData();
    formData.append("files", file);

    const requestOptions = { method: "POST", body: formData };

    const response = await fetch("/api/upload", requestOptions);
    // if response from api is ok, set hasFileUploadedToTrue
    const res = await response.text();
    if (res == "success") {
      setHasFileUploaded(true);
    } else {
      console.log(res);
    }
  };

  const uploadFile = (event) => {
    setFile(event.target.files[0]);
  };

  useEffect(() => {
    file && handleFileChange(file);
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

"use client";

import Image from "next/image";
import { useState, useEffect } from "react";
import Header from "./_components/Header";
import UploadButton from "./_components/UploadButton";
import AfterUpload from "./_views/AfterUpload";
import BeforeUpload from "./_views/BeforeUpload";

// Pieces of state that live here: hasFileUploaded
// In order for a file to have successfully uploaded, it must be sent to the backend,
// and we must get a 200 from the backend, indicating that the file was the correct format and
// was able to be successfully converted to images
// Once the file has successfully been converted to images, the ui should show a loading state until we recieve the first
// piece of data from the server

async function* streamAsyncIterator(stream) {
  // Get a lock on the stream
  const reader = stream.getReader();

  try {
    while (true) {
      // Read from the stream
      const { done, value } = await reader.read();
      // Exit if we're done
      if (done) {
        // If done, yield the last chunk if there is any
        if (value) {
          console.log("reading: ", new TextDecoder().decode(value));
          yield new TextDecoder().decode(value);
        }
        return; // Exit the loop
      }
      // Else yield the chunk
      console.log("reading: ", new TextDecoder().decode(value));
      yield new TextDecoder().decode(value);
    }
  } finally {
    console.log("done");
    reader.releaseLock();
  }
}

export default function Home() {
  const [file, setFile] = useState(null);
  const [hasFileUploaded, setHasFileUploaded] = useState(false);
  const [message, setMessage] = useState("");

  const handleFileChange = async (file) => {
    // send file to backend
    console.log("Sending file to backend");
    setHasFileUploaded(true);
    const formData = new FormData();
    formData.append("files", file);

    const requestOptions = { method: "POST", body: formData };

    const response = await fetch("/api/upload", requestOptions);
    // if response from api is ok, set hasFileUploadedToTrue

    // Each chunk is ~10 words
    for await (const chunk of streamAsyncIterator(response.body)) {
      setMessage((oldMessage) => oldMessage.concat(chunk));
    }
  };

  const uploadFile = (event) => {
    setFile(event.target.files[0]);
  };

  useEffect(() => {
    file && handleFileChange(file);
  }, [file]);

  return (
    <main className="bg-eggshell flex flex-col min-h-screen items-center justify-between py-24">
      <div className="md:max-w-[600px] flex flex-col gap-10">
        <Header></Header>
        {hasFileUploaded ? (
          <>
            <AfterUpload message={message}></AfterUpload>
          </>
        ) : (
          <BeforeUpload uploadFile={uploadFile}></BeforeUpload>
        )}
        <div className="flex justify-center">
          <UploadButton handleUpload={uploadFile}></UploadButton>
        </div>
      </div>
    </main>
  );
}

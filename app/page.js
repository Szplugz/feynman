"use client";

import Image from "next/image";
import { useState, useEffect, Suspense } from "react";
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
      if (done) return;
      // Else yield the chunk
      yield new TextDecoder().decode(value);
    }
  } finally {
    reader.releaseLock();
  }
}

export default function Home() {
  const [file, setFile] = useState(null);
  const [hasFileUploaded, setHasFileUploaded] = useState(false);
  const [messages, setMessages] = useState([]);

  const handleFileChange = async (file) => {
    // send file to backend
    console.log("Sending file to backend");
    setHasFileUploaded(true);
    const formData = new FormData();
    formData.append("files", file);

    const requestOptions = { method: "POST", body: formData };

    const response = await fetch("/api/upload", requestOptions);
    // if response from api is ok, set hasFileUploadedToTrue
    for await (const chunk of streamAsyncIterator(response.body)) {
      setMessages((oldmessages) => [...oldmessages, chunk]);
    }
    // const reader = response.body.getReader();
    // while (true) {
    //   const { done, value } = await reader.read();
    //   if (done) {
    //     // Do something with last chunk of data then exit reader
    //     return;
    //   }
    //   // Otherwise do something here to process current chunk
    //   console.log(new TextDecoder().decode(value));
    // }
    // const res = await response.text();
    // if (res == "success") {
    //   setHasFileUploaded(true);
    // } else {
    //   console.log(res);
    // }

    // const eventsource = new EventSource("/api/upload");

    // eventsource.onmessage = (event) => {
    //   const newMessage = JSON.parse(event.data);
    //   setMessages((prevMessages) => [...prevMessages, newMessage]);
    // };
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
            <AfterUpload></AfterUpload>
            {messages.length ? (
              <div>
                {messages.map((message, index) => (
                  <p key={index}>{message}</p>
                ))}
              </div>
            ) : (
              <div>Loading...</div>
            )}
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

"use client";

import { useState } from "react";

export default function Home() {
  const [file, setFile] = useState<File | null>(null);
  const [result, setResult] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);
  const [preview, setPreview] = useState<string | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0] || null;
    setFile(selectedFile);

    if (selectedFile) {
      setPreview(URL.createObjectURL(selectedFile));
    }
  };

  const handleGenerate = async () => {
    if (!file) {
      alert("Please upload an image first");
      return;
    }

    setLoading(true);
    setResult("");

    try {
      const response = await fetch(
        "/api/caption",
        {
          method: "POST",
          body: file, // IMPORTANT
        }
      );

      const data = await response.json();
      console.log("HF Response:", data);

      if (Array.isArray(data)) {
        setResult(data[0]?.generated_text || "No caption generated");
      } else if (data.error) {
        setResult("Error: " + data.error);
      } else {
        setResult("Unexpected response");
      }
    } catch (error) {
      console.error(error);
      setResult("Request failed");
    }

    setLoading(false);
  };

  return (
    <div style={{ textAlign: "center", padding: "40px" }}>
      <h1>🌐 LENSCRIBE</h1>
      <p>AI Image Captioning</p>

      {/* File Upload */}
      <input type="file" accept="image/*" onChange={handleFileChange} />

      {/* Image Preview */}
      {preview && (
        <div style={{ marginTop: "20px" }}>
          <img
            src={preview}
            alt="Preview"
            style={{ maxWidth: "300px", borderRadius: "10px" }}
          />
        </div>
      )}

      {/* Button */}
      <div style={{ marginTop: "20px" }}>
        <button
          onClick={handleGenerate}
          style={{
            padding: "10px 20px",
            fontSize: "16px",
            cursor: "pointer",
          }}
        >
          Generate Caption
        </button>
      </div>

      {/* Loading */}
      {loading && <p>Generating caption... ⏳</p>}

      {/* Result */}
      {result && (
        <div style={{ marginTop: "20px" }}>
          <h3>Caption:</h3>
          <p>{result}</p>
        </div>
      )}
    </div>
  );
}
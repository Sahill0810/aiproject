"use client";
import { useState } from "react";
import axios from "axios";

export default function Home() {
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [result, setResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [selectedLang, setSelectedLang] = useState("en");

  const upload = async () => {
    if (!file) return;

    const formData = new FormData();
    formData.append("file", file);
    const res = await axios.post(
      "https://lenscribe-api.onrender.com/predict?lang=" + selectedLang,
      formData
    );

    setLoading(true);

    try {
      const res = await axios.post(
        "http://127.0.0.1:8000/predict",
        formData
      );
      setResult(res.data);
    } catch (error) {
      console.error(error);
    }

    setLoading(false);
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-r from-purple-600 to-blue-600 text-white p-4">

      <h1 className="text-5xl font-bold mb-6">🌐 LENSCRIBE</h1>
      <p className="mb-6 text-lg">AI Image Captioning System</p>
      

<div style={{ position: "relative", zIndex: 100 }}>
  <select
    value={selectedLang}
    onChange={(e) => setSelectedLang(e.target.value)}
    style={{
      padding: "8px",
      borderRadius: "5px"
    }}
  >
    <option value="en">English</option>
    <option value="hi">Hindi</option>
    <option value="fr">French</option>
    <option value="es">Spanish</option>
    <option value="de">German</option>
  </select>
</div>

      <input
        type="file"
        className="mb-4"
        onChange={(e) => {
          if (e.target.files) {
            setFile(e.target.files[0]);
            setPreview(URL.createObjectURL(e.target.files[0]));
          }
        }}
      />

      {preview && (
        <img
          src={preview}
          alt="preview"
          className="w-64 h-64 object-cover rounded-lg mb-4 shadow-lg"
        />
      )}

      <button
        onClick={upload}
        className="px-6 py-2 bg-white text-black rounded-lg hover:bg-gray-200"
      >
        Generate Caption
      </button>

      {loading && <p className="mt-4">⏳ Generating...</p>}

      {result && (
        <div className="mt-6 bg-white text-black p-6 rounded-lg shadow-lg w-80 text-center">
    <p><b>English:</b> {result.caption_en}</p>
    <p><b>Translated:</b> {result.caption}</p>
  </div>
)}
    </div>
  );
}
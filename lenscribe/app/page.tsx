"use client";

import { useState, useRef, useCallback } from "react";

export default function Home() {
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [caption, setCaption] = useState<string>("");
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState<"ready" | "processing" | "success" | "error">("ready");
  const [statusText, setStatusText] = useState("READY");
  const [dragging, setDragging] = useState(false);
  const [copied, setCopied] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFile = (selected: File) => {
    setFile(selected);
    setPreview(URL.createObjectURL(selected));
    setCaption("");
    setStatus("ready");
    setStatusText("FILE LOADED");
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (f) handleFile(f);
  };

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragging(false);
    const f = e.dataTransfer.files[0];
    if (f && f.type.startsWith("image/")) handleFile(f);
  }, []);

  const handleGenerate = async () => {
    if (!file) return;
    setLoading(true);
    setCaption("");
    setStatus("processing");
    setStatusText("PROCESSING");

    try {
      const res = await fetch("/api/caption", { method: "POST", body: file });
      const data = await res.json();

      if (data.caption) {
        setCaption(data.caption);
        setStatus("success");
        setStatusText("CAPTION GENERATED");
      } else {
        setCaption(data.error || "Something went wrong.");
        setStatus("error");
        setStatusText("ERROR: " + (data.error ?? "UNKNOWN"));
      }
    } catch {
      setCaption("Request failed. Is the server running?");
      setStatus("error");
      setStatusText("CONNECTION ERROR");
    }

    setLoading(false);
  };

  const copyCaption = () => {
    navigator.clipboard.writeText(caption).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    });
  };

  const statusColor =
    status === "success" ? "#7affb2" :
    status === "error" ? "#ff7a7a" :
    "rgba(255,255,255,0.2)";

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Bebas+Neue&family=DM+Sans:ital,wght@0,300;0,400;0,500;1,300&display=swap');

        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

        body {
          background: #060606;
          min-height: 100vh;
          display: flex;
          align-items: center;
          justify-content: center;
          font-family: 'DM Sans', sans-serif;
        }

        .ls-wrap {
          width: 100%;
          max-width: 780px;
          margin: 0 auto;
          padding: 24px;
        }

        .ls-card {
          background: #0e0e0e;
          border: 0.5px solid rgba(255,255,255,0.08);
          border-radius: 20px;
          overflow: hidden;
          position: relative;
        }

        .ls-grid-bg {
          position: absolute; inset: 0;
          background-image:
            linear-gradient(rgba(255,255,255,0.025) 1px, transparent 1px),
            linear-gradient(90deg, rgba(255,255,255,0.025) 1px, transparent 1px);
          background-size: 44px 44px;
          pointer-events: none;
          z-index: 0;
        }

        .ls-inner { position: relative; z-index: 1; }

        .ls-header {
          padding: 28px 32px 0;
          display: flex;
          align-items: flex-start;
          justify-content: space-between;
        }

        .ls-logo {
          font-family: 'Bebas Neue', sans-serif;
          font-size: 44px;
          color: #fff;
          letter-spacing: 5px;
          line-height: 1;
        }

        .ls-logo-accent { color: #7affb2; }

        .ls-tagline {
          font-size: 10px;
          color: rgba(255,255,255,0.3);
          letter-spacing: 3.5px;
          text-transform: uppercase;
          margin-top: 5px;
        }

        .ls-model-badge {
          background: rgba(122,255,178,0.08);
          border: 0.5px solid rgba(122,255,178,0.25);
          border-radius: 20px;
          padding: 6px 16px;
          font-size: 10px;
          color: #7affb2;
          letter-spacing: 1.5px;
          font-weight: 500;
          text-transform: uppercase;
          margin-top: 4px;
        }

        .ls-body {
          padding: 28px 32px;
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 20px;
        }

        @media (max-width: 560px) {
          .ls-body { grid-template-columns: 1fr; }
        }

        .ls-dropzone {
          border: 1.5px dashed rgba(255,255,255,0.1);
          border-radius: 14px;
          aspect-ratio: 1;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          transition: border-color 0.2s, background 0.2s;
          overflow: hidden;
          position: relative;
          background: rgba(255,255,255,0.015);
        }

        .ls-dropzone:hover,
        .ls-dropzone.dragging {
          border-color: rgba(122,255,178,0.45);
          background: rgba(122,255,178,0.03);
        }

        .ls-dropzone.has-image {
          border-style: solid;
          border-color: rgba(122,255,178,0.3);
          padding: 0;
        }

        .ls-drop-icon {
          width: 52px; height: 52px;
          border: 1px solid rgba(255,255,255,0.12);
          border-radius: 14px;
          display: flex; align-items: center; justify-content: center;
          margin-bottom: 14px;
        }

        .ls-drop-label {
          font-size: 14px;
          font-weight: 500;
          color: rgba(255,255,255,0.6);
          margin-bottom: 4px;
        }

        .ls-drop-sub {
          font-size: 12px;
          color: rgba(255,255,255,0.25);
        }

        .ls-preview {
          width: 100%; height: 100%;
          object-fit: cover;
          border-radius: 12px;
          display: block;
        }

        .ls-right {
          display: flex;
          flex-direction: column;
          gap: 14px;
        }

        .ls-file-card {
          background: rgba(255,255,255,0.03);
          border: 0.5px solid rgba(255,255,255,0.07);
          border-radius: 12px;
          padding: 14px 18px;
        }

        .ls-card-label {
          font-size: 9px;
          letter-spacing: 2.5px;
          text-transform: uppercase;
          color: rgba(255,255,255,0.2);
          margin-bottom: 6px;
        }

        .ls-file-name {
          font-size: 13px;
          color: rgba(255,255,255,0.5);
          word-break: break-all;
          line-height: 1.5;
        }

        .ls-file-name.loaded { color: rgba(255,255,255,0.75); }

        .ls-caption-card {
          background: rgba(122,255,178,0.04);
          border: 0.5px solid rgba(122,255,178,0.15);
          border-radius: 12px;
          padding: 18px;
          flex: 1;
          display: flex;
          flex-direction: column;
          justify-content: space-between;
          min-height: 130px;
        }

        .ls-caption-output {
          font-size: 17px;
          font-weight: 300;
          font-style: italic;
          color: #fff;
          line-height: 1.55;
          flex: 1;
        }

        .ls-caption-output.placeholder {
          font-size: 13px;
          font-style: normal;
          font-weight: 400;
          color: rgba(255,255,255,0.18);
        }

        .ls-copy-btn {
          align-self: flex-end;
          margin-top: 12px;
          background: transparent;
          border: 0.5px solid rgba(122,255,178,0.3);
          border-radius: 8px;
          color: #7affb2;
          font-size: 10px;
          font-family: 'DM Sans', sans-serif;
          font-weight: 500;
          letter-spacing: 1.5px;
          padding: 6px 14px;
          cursor: pointer;
          text-transform: uppercase;
          transition: background 0.15s;
        }

        .ls-copy-btn:hover { background: rgba(122,255,178,0.08); }

        .ls-loader {
          display: flex;
          align-items: center;
          gap: 6px;
          font-size: 10px;
          color: rgba(255,255,255,0.3);
          letter-spacing: 2px;
          text-transform: uppercase;
          height: 20px;
        }

        .ls-dot {
          width: 5px; height: 5px;
          border-radius: 50%;
          background: #7affb2;
          animation: lspulse 1.2s ease-in-out infinite;
        }
        .ls-dot:nth-child(2) { animation-delay: 0.2s; }
        .ls-dot:nth-child(3) { animation-delay: 0.4s; }

        @keyframes lspulse {
          0%, 80%, 100% { opacity: 0.2; transform: scale(0.75); }
          40% { opacity: 1; transform: scale(1); }
        }

        .ls-gen-btn {
          width: 100%;
          padding: 15px;
          background: #7affb2;
          color: #080808;
          border: none;
          border-radius: 12px;
          font-family: 'Bebas Neue', sans-serif;
          font-size: 20px;
          letter-spacing: 3.5px;
          cursor: pointer;
          transition: opacity 0.2s, transform 0.1s;
        }

        .ls-gen-btn:hover:not(:disabled) { opacity: 0.88; }
        .ls-gen-btn:active:not(:disabled) { transform: scale(0.99); }
        .ls-gen-btn:disabled { opacity: 0.3; cursor: not-allowed; }

        .ls-footer {
          padding: 0 32px 24px;
          display: flex;
          justify-content: space-between;
          align-items: center;
        }

        .ls-divider {
          height: 0.5px;
          background: rgba(255,255,255,0.05);
          margin: 0 32px 20px;
        }

        .ls-version {
          font-size: 10px;
          color: rgba(255,255,255,0.1);
          letter-spacing: 1.5px;
        }
      `}</style>

      <div className="ls-wrap">
        <div className="ls-card">
          <div className="ls-grid-bg" />
          <div className="ls-inner">

            <div className="ls-header">
              <div>
                <div className="ls-logo">
                  LENS<span className="ls-logo-accent">CRIBE</span>
                </div>
                <div className="ls-tagline">AI Image Captioning</div>
              </div>
              <div className="ls-model-badge">BLIP Model</div>
            </div>

            <div className="ls-body">
              {/* Drop Zone */}
              <div
                className={`ls-dropzone${preview ? " has-image" : ""}${dragging ? " dragging" : ""}`}
                onClick={() => fileInputRef.current?.click()}
                onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
                onDragLeave={() => setDragging(false)}
                onDrop={handleDrop}
              >
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  style={{ display: "none" }}
                  onChange={handleFileChange}
                />
                {preview ? (
                  <img src={preview} alt="preview" className="ls-preview" />
                ) : (
                  <>
                    <div className="ls-drop-icon">
                      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.45)" strokeWidth="1.5">
                        <rect x="3" y="3" width="18" height="18" rx="3"/>
                        <circle cx="8.5" cy="8.5" r="1.5"/>
                        <path d="M21 15l-5-5L5 21"/>
                      </svg>
                    </div>
                    <div className="ls-drop-label">Drop image here</div>
                    <div className="ls-drop-sub">or click to browse</div>
                  </>
                )}
              </div>

              {/* Right Panel */}
              <div className="ls-right">
                <div className="ls-file-card">
                  <div className="ls-card-label">Selected file</div>
                  <div className={`ls-file-name${file ? " loaded" : ""}`}>
                    {file ? file.name : "No file selected"}
                  </div>
                </div>

                <div className="ls-caption-card">
                  <div className={`ls-caption-output${caption ? "" : " placeholder"}`}>
                    {loading
                      ? "Analyzing image..."
                      : caption
                      ? `"${caption}"`
                      : "Caption will appear here after generation..."}
                  </div>
                  {caption && !loading && (
                    <button className="ls-copy-btn" onClick={copyCaption}>
                      {copied ? "COPIED!" : "COPY"}
                    </button>
                  )}
                </div>

                {loading && (
                  <div className="ls-loader">
                    <div className="ls-dot" />
                    <div className="ls-dot" />
                    <div className="ls-dot" />
                    <span>ANALYZING</span>
                  </div>
                )}

                <button
                  className="ls-gen-btn"
                  onClick={handleGenerate}
                  disabled={!file || loading}
                >
                  GENERATE CAPTION
                </button>
              </div>
            </div>

            <div className="ls-divider" />

            <div className="ls-footer">
              <div style={{ fontSize: "10px", letterSpacing: "1.5px", color: statusColor, textTransform: "uppercase" }}>
                {statusText}
              </div>
              <div className="ls-version">LENSCRIBE v1.0</div>
            </div>

          </div>
        </div>
      </div>
    </>
  );
}
"use client";

import Script from "next/script";
import { useCallback, useState } from "react";

declare global {
  interface Window {
    JSZip?: new () => {
      file: (name: string, blob: Blob) => void;
      generateAsync: (options: { type: "blob" }) => Promise<Blob>;
    };
  }
}

const ASSETS = [
  { url: "/branding/banner.svg", name: "banner.svg" },
  { url: "/branding/avatar.png", name: "avatar.png" },
  { url: "/branding/avatar.svg", name: "avatar.svg" },
  { url: "/branding/logo-mark.svg", name: "logo-mark.svg" },
  { url: "/branding/logo-full.svg", name: "logo-full.svg" },
];

export default function BrandPage() {
  const [busy, setBusy] = useState(false);

  const downloadAll = useCallback(async () => {
    if (busy) return;
    if (!window.JSZip) {
      alert("Zip library still loading, please try again in a moment.");
      return;
    }
    setBusy(true);
    try {
      const zip = new window.JSZip();
      await Promise.all(
        ASSETS.map(async (f) => {
          const res = await fetch(f.url);
          if (!res.ok) throw new Error(`${f.url} → ${res.status}`);
          zip.file(f.name, await res.blob());
        })
      );
      const out = await zip.generateAsync({ type: "blob" });
      const a = document.createElement("a");
      a.href = URL.createObjectURL(out);
      a.download = "whisper-branding.zip";
      document.body.appendChild(a);
      a.click();
      a.remove();
      setTimeout(() => URL.revokeObjectURL(a.href), 1000);
    } catch (err) {
      alert("Zip error: " + (err as Error).message);
    } finally {
      setBusy(false);
    }
  }, [busy]);

  return (
    <main className="brand-root">
      <Script
        src="https://cdnjs.cloudflare.com/ajax/libs/jszip/3.10.1/jszip.min.js"
        strategy="lazyOnload"
      />

      <button
        className="dl-btn dl-btn--floating"
        onClick={downloadAll}
        disabled={busy}
        type="button"
      >
        <span className="ic">⬇</span>
        <span>{busy ? "Preparing…" : "Download all"}</span>
      </button>

      <header>
        <h1>Whisper — Brand Kit</h1>
        <div className="sub">
          Logos, avatar, and banner — ready to use.{" "}
          <span className="filename">logo-mark.svg</span> &amp;{" "}
          <span className="filename">logo-full.svg</span>
        </div>
      </header>

      <section className="section">
        <div className="section-title">
          Logo Mark (short) — <span className="filename">logo-mark.svg</span>
        </div>
        <div className="panel">
          <div className="label">On black · multiple sizes</div>
          <div className="stage dark">
            <div className="sizes">
              {[32, 64, 128, 200].map((h) => (
                <div className="size-block" key={h}>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src="/branding/logo-mark.svg" alt="" style={{ height: h }} />
                  <div className="px">{h} PX</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="section">
        <div className="section-title">
          Logo Full (wide) — <span className="filename">logo-full.svg</span>
        </div>
        <div className="panel">
          <div className="label">On black · multiple sizes</div>
          <div className="stage dark">
            <div className="sizes">
              {[28, 56, 96].map((h) => (
                <div className="size-block" key={h}>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src="/branding/logo-full.svg" alt="" style={{ height: h }} />
                  <div className="px">H {h} PX</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="section">
        <div className="section-title">Dark vs Light backgrounds</div>
        <div className="grid">
          <div className="panel">
            <div className="label">Mark — dark / light</div>
            <div className="compare">
              <div className="stage dark">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src="/branding/logo-mark.svg" alt="" style={{ height: 96 }} />
              </div>
              <div className="stage light">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src="/branding/logo-mark.svg" alt="" style={{ height: 96 }} />
              </div>
            </div>
          </div>
          <div className="panel">
            <div className="label">Full — dark / light</div>
            <div className="compare">
              <div className="stage dark">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src="/branding/logo-full.svg" alt="" style={{ height: 60 }} />
              </div>
              <div className="stage light">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src="/branding/logo-full.svg" alt="" style={{ height: 60 }} />
              </div>
            </div>
          </div>
        </div>
        <div className="sub small">
          Note: the SVGs are white. On the light panels above I apply a{" "}
          <code>filter: invert(1)</code> in CSS to simulate a black version.
        </div>
      </section>

      <section className="section">
        <div className="section-title">Twitter assets</div>
        <div className="grid">
          <div className="panel">
            <div className="label">avatar.png</div>
            <div className="stage dark">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src="/branding/avatar.png"
                alt="Whisper avatar"
                style={{ width: 180, height: 180, borderRadius: "50%" }}
              />
            </div>
          </div>
          <div className="panel">
            <div className="label">banner.svg</div>
            <div className="stage dark">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src="/branding/banner.svg"
                alt="Whisper banner"
                style={{ width: "100%", height: "auto", borderRadius: 8 }}
              />
            </div>
          </div>
        </div>
      </section>

      <footer className="dl-footer">
        <button
          className="dl-btn"
          onClick={downloadAll}
          disabled={busy}
          type="button"
        >
          <span className="ic">⬇</span>
          <span>{busy ? "Preparing…" : "Download all (.zip)"}</span>
        </button>
        <span className="hint">
          Includes: banner.svg, avatar.svg, avatar.png, logo-mark.svg,
          logo-full.svg
        </span>
      </footer>

      <style>{`
        .brand-root {
          background: #0a0a0a;
          color: #f5f5f5;
          padding: 48px 64px;
          line-height: 1.4;
          min-height: 100vh;
          font-family: -apple-system, "Helvetica Neue", Helvetica, Arial, sans-serif;
        }
        .brand-root header { margin-bottom: 48px; }
        .brand-root h1 { font-weight: 800; font-size: 32px; letter-spacing: -1px; }
        .brand-root .sub { color: #888; margin-top: 6px; font-size: 14px; }
        .brand-root .sub.small { margin-top: 16px; font-size: 12px; }
        .brand-root code {
          font-family: ui-monospace, "SF Mono", Menlo, monospace;
          background: #161616;
          padding: 1px 6px;
          border-radius: 4px;
          font-size: 12px;
        }

        .brand-root .section { margin-bottom: 64px; }
        .brand-root .section-title {
          font-size: 13px;
          text-transform: uppercase;
          letter-spacing: 2px;
          color: #888;
          margin-bottom: 24px;
          border-bottom: 1px solid #222;
          padding-bottom: 12px;
        }

        .brand-root .grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 32px;
        }

        .brand-root .panel {
          border: 1px solid #222;
          border-radius: 12px;
          overflow: hidden;
        }
        .brand-root .panel .label {
          padding: 14px 20px;
          font-size: 12px;
          color: #888;
          letter-spacing: 1px;
          text-transform: uppercase;
          border-bottom: 1px solid #222;
        }
        .brand-root .panel .stage {
          padding: 56px 32px;
          display: flex;
          align-items: center;
          justify-content: center;
          min-height: 220px;
        }
        .brand-root .stage.dark { background: #000; }
        .brand-root .stage.light { background: #ffffff; }
        .brand-root .stage.light img { filter: invert(1); }

        .brand-root .sizes {
          display: flex;
          align-items: center;
          justify-content: space-around;
          gap: 32px;
          flex-wrap: wrap;
          width: 100%;
        }
        .brand-root .size-block { display: flex; flex-direction: column; align-items: center; gap: 8px; }
        .brand-root .size-block .px { font-size: 11px; color: #555; letter-spacing: 1px; }

        .brand-root .filename {
          display: inline-block;
          font-family: ui-monospace, "SF Mono", Menlo, monospace;
          font-size: 12px;
          color: #5da8ff;
          background: #0a1a2e;
          padding: 4px 10px;
          border-radius: 4px;
        }

        .brand-root .dl-btn {
          display: inline-flex;
          align-items: center;
          gap: 10px;
          background: #ffffff;
          color: #000;
          border: none;
          font-family: inherit;
          font-weight: 700;
          font-size: 14px;
          letter-spacing: -0.2px;
          padding: 12px 22px;
          border-radius: 999px;
          cursor: pointer;
          transition: transform 0.1s ease, background 0.15s ease;
        }
        .brand-root .dl-btn:hover { background: #e8e8e8; }
        .brand-root .dl-btn:active { transform: scale(0.97); }
        .brand-root .dl-btn:disabled { opacity: 0.5; cursor: progress; }
        .brand-root .dl-btn .ic { font-size: 16px; }
        .brand-root .dl-btn--floating {
          position: fixed;
          top: 24px;
          right: 24px;
          z-index: 100;
          box-shadow: 0 8px 24px rgba(0,0,0,0.5);
        }

        .brand-root .compare {
          display: grid;
          grid-template-columns: 1fr 1fr;
        }
        .brand-root .compare .stage { min-height: 180px; }

        .brand-root .dl-footer {
          text-align: center;
          padding: 48px 0 16px;
          border-top: 1px solid #222;
          margin-top: 24px;
        }
        .brand-root .dl-footer .hint { display: block; margin-top: 12px; font-size: 12px; color: #555; }

        @media (max-width: 700px) {
          .brand-root { padding: 32px 20px; }
          .brand-root .grid { grid-template-columns: 1fr; }
        }
      `}</style>
    </main>
  );
}

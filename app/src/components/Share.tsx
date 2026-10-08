"use client";
import { useState } from "react";
export function Share({ title }: { title: string }) {
  const [status, setStatus] = useState("");
  return (
    <div className="share">
      <span>SHARE THIS STORY</span>
      <button
        onClick={async () => {
          try {
            await navigator.clipboard.writeText(location.href);
            setStatus("Link copied");
          } catch {
            setStatus("Copy the address from your browser");
          }
        }}
      >
        Copy link ↗
      </button>
      <button
        onClick={() => {
          location.href = `mailto:?subject=${encodeURIComponent(title)}&body=${encodeURIComponent(location.href)}`;
        }}
      >
        Email
      </button>
      <span role="status">{status}</span>
    </div>
  );
}

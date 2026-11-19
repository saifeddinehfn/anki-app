
"use client";

import { useState } from "react";

export default function Home() {
  const [showAnswer, setShowAnswer] = useState(false);

  return (
    <main style={{
      minHeight: "100vh",
      background: "#f8fafc",
      padding: "40px 20px",
      fontFamily: "Arial, sans-serif",
      textAlign: "center"
    }}>
      <h1 style={{ color: "#2563eb" }}>
        🧠 Anki App
      </h1>

      <p>Learn smarter, remember longer.</p>

      <div style={{
        background: "white",
        padding: "40px 20px",
        borderRadius: "16px",
        maxWidth: "450px",
        margin: "40px auto",
        boxShadow: "0 4px 20px #00000015"
      }}>
        <h2>
          {showAnswer
            ? "Paris 🇫🇷"
            : "What is the capital of France?"}
        </h2>

        <button
          onClick={() => setShowAnswer(!showAnswer)}
          style={{
            background: "#2563eb",
            color: "white",
            border: "none",
            padding: "12px 24px",
            borderRadius: "8px",
            cursor: "pointer"
          }}
        >
          {showAnswer ? "Show Question" : "Show Answer"}
        </button>
      </div>
    </main>
  );
}

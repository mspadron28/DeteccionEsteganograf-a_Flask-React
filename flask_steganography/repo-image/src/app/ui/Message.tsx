"use client";

import React from "react";

interface MessageProps {
  type: "success" | "error" | "info";
  text: string;
}

export default function Message({ type, text }: MessageProps) {
  const colors = {
    success: "bg-green-500",
    error: "bg-red-500",
    info: "bg-blue-500",
  };

  return (
    <div
      className={`fixed top-4 right-4 px-4 py-2 rounded-md text-white ${colors[type]}`}
    >
      {text}
    </div>
  );
}

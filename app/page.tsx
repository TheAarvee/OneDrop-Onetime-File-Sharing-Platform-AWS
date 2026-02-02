"use client";

import { useEffect, useState } from "react";

export default function Home() {
  const [html, setHtml] = useState("");

  useEffect(() => {
    fetch("/index.html")
      .then((res) => res.text())
      .then((data) => {
        setHtml(data);
      });
  }, []);

  useEffect(() => {
    if (!html) return;

    // Re-run scripts (Framer animations)
    const scripts = document.querySelectorAll("script");
    scripts.forEach((oldScript) => {
      const newScript = document.createElement("script");
      Array.from(oldScript.attributes).forEach((attr) =>
        newScript.setAttribute(attr.name, attr.value)
      );
      newScript.innerHTML = oldScript.innerHTML;
      oldScript.replaceWith(newScript);
    });

    // Hide scrollbar globally
    document.documentElement.style.overflow = "hidden";
    document.body.style.overflow = "hidden";

    return () => {
      document.documentElement.style.overflow = "";
      document.body.style.overflow = "";
    };
  }, [html]);

  return (
    <div
      dangerouslySetInnerHTML={{ __html: html }}
      suppressHydrationWarning
    />
  );
}

import React from "react";
import V4Hero from "./V4Hero";
import V4BentoGrid from "./V4BentoGrid";
import V4Portfolio from "./V4Portfolio";
import V4Timeline from "./V4Timeline";
import V4Contact from "./V4Contact";
import Footer from "../Footer";

export default function Version4Home() {
  return (
    <div
      className="v4 relative min-h-screen bg-ink text-paper selection:bg-paper selection:text-ink"
    >
      {/* Main Content Landmark */}
      <main id="main-content" tabIndex={-1} className="relative z-10 bg-ink focus:outline-none">
        <V4Hero />
        <V4BentoGrid />
        <V4Portfolio />
        <V4Timeline />
        <V4Contact />
      </main>

      {/* Footer Landmark */}
      <Footer />
    </div>
  );
}

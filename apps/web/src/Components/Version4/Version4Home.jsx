import React from "react";
import V4ParticleCanvas from "./V4ParticleCanvas";
import V4Hero from "./V4Hero";
import V4BentoGrid from "./V4BentoGrid";
import V4Portfolio from "./V4Portfolio";
import V4Timeline from "./V4Timeline";
import V4Contact from "./V4Contact";
import Footer from "../Footer";

// NOTE: We intentionally do NOT use content-visibility:auto here.
// Safari < 26 has incomplete support for containIntrinsicSize "auto none" syntax
// which causes sections to render with 0 height and become invisible.
// Instead we use a straightforward approach: all sections are in the DOM,
// background is always gray-950, no white can ever show through.

export default function Version4Home() {
  return (
    // bg-gray-950 = #030712 — MUST match index.html body background
    // This prevents ANY white showing through during scroll/transitions
    <div
      className="relative min-h-screen bg-gray-950 text-gray-200 overflow-x-hidden selection:bg-violet-600 selection:text-white"
      style={{ overscrollBehavior: "none" }}
    >
      {/* Dynamic Interactive Particle Canvas Background — desktop only */}
      <V4ParticleCanvas />

      {/* Main Content Sections */}
      <div className="relative z-10 bg-gray-950">
        <V4Hero />
        <V4BentoGrid />
        <V4Portfolio />
        <V4Timeline />
        <V4Contact />
        <Footer />
      </div>
    </div>
  );
}

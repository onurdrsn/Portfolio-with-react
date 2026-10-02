import React from "react";
import V4ParticleCanvas from "./V4ParticleCanvas";
import V4Hero from "./V4Hero";
import V4BentoGrid from "./V4BentoGrid";
import V4Portfolio from "./V4Portfolio";
import V4Timeline from "./V4Timeline";
import V4Contact from "./V4Contact";
import Footer from "../Footer";

// content-visibility wrapper: skips rendering offscreen sections
// This directly prevents the "load-on-scroll white flash" by deferring paint
function LazySection({ children, minHeight = "400px" }) {
  return (
    <div
      style={{
        contentVisibility: "auto",
        containIntrinsicSize: `auto none auto ${minHeight}`,
      }}
    >
      {children}
    </div>
  );
}

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
        {/* Hero is always rendered — it's above the fold */}
        <V4Hero />

        {/* Below-fold sections: deferred with content-visibility */}
        <LazySection minHeight="600px">
          <V4BentoGrid />
        </LazySection>

        <LazySection minHeight="800px">
          <V4Portfolio />
        </LazySection>

        <LazySection minHeight="500px">
          <V4Timeline />
        </LazySection>

        <LazySection minHeight="600px">
          <V4Contact />
        </LazySection>

        <LazySection minHeight="100px">
          <Footer />
        </LazySection>
      </div>
    </div>
  );
}

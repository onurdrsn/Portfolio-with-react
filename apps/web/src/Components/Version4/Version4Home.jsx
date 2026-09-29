import React from "react";
import V4ParticleCanvas from "./V4ParticleCanvas";
import V4Hero from "./V4Hero";
import V4BentoGrid from "./V4BentoGrid";
import V4Portfolio from "./V4Portfolio";
import V4Timeline from "./V4Timeline";
import V4Contact from "./V4Contact";
import Footer from "../Footer";

export default function Version4Home() {
  return (
    <div className="relative min-h-screen text-gray-200 overflow-x-hidden selection:bg-violet-600 selection:text-white">
      {/* Dynamic Interactive Particle Canvas Background */}
      <V4ParticleCanvas />

      {/* Main Content Sections */}
      <div className="relative z-10">
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

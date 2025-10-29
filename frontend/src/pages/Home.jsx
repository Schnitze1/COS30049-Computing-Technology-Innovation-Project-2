/**
 * @file home.jsx
 * @description This file defines the main homepage component, which assembles
 * the primary sections of the landing page.
 */

import React from "react";
import HeroSection from "../components/misc/HeroSection";
import ContentIsland from "../components/misc/ContentIsland";

/**
 * Renders the application's homepage.
 * This component combines a full-screen hero section with an informational
 * content island to create the main landing page experience.
 */
export default function Home() {
  return (
    <>
      <HeroSection />
      <ContentIsland />
    </>
  );
}
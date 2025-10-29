/**
 * @file About.jsx
 * @description This file defines the main "About" page component, which assembles
 * several smaller components to create the page layout.
 */

import React from "react";
import AboutHero from "../components/about/AboutHero";
import AboutGallery from "../components/about/AboutGallery";
import AboutMission from "../components/about/AboutMission";
import ScrollProgressBar from "../components/misc/ScrollProgressBar";

/**
 * Renders the "About" page of the application.
 * This page provides users with information about the project's purpose
 * and mission.
 */
export default function About() {
  return (
    <>
      <AboutHero />
      <AboutGallery />
      <ScrollProgressBar />
      <AboutMission />
    </>
  );
}
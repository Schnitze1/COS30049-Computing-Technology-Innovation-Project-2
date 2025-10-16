import React from "react";
import AboutHero from "../components/about/AboutHero";
import AboutGallery from "../components/about/AboutGallery";
import AboutMission from "../components/about/AboutMission";
import ScrollProgressBar from "../components/ScrollProgressBar";

const About = () => {
  return (
    <>
      <AboutHero />
      <AboutGallery />
      <ScrollProgressBar />
      <AboutMission />
    </>
  );
};

export default About;

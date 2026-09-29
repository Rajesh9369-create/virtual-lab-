import Hero from "../components/Hero";
import LearningLoop from "../components/LearningLoop";
import Domains from "../components/Domains";
import TheoryToExperience from "../components/TheoryToExperience";
import Journey from "../components/Journey";
import LabPreview from "../components/LabPreview";
import Principle from "../components/Principle";
import FinalCTA from "../components/FinalCTA";

/** The premium homepage — a product experience, top to bottom. */
export default function Home() {
  return (
    <>
      <Hero />
      <LearningLoop />
      <Domains />
      <TheoryToExperience />
      <Journey />
      <LabPreview />
      <Principle />
      <FinalCTA />
    </>
  );
}

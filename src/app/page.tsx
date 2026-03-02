import Hero from "@/components/Hero";
import Features from "@/components/Features";
import HowItWorks from "@/components/HowItWorks";
import ModelSelector from "@/components/ModelSelector";
import InstallSection from "@/components/InstallSection";
import Footer from "@/components/Footer";

export default function Home() {
  return (
    <main>
      <Hero />
      <Features />
      <HowItWorks />
      <ModelSelector />
      <InstallSection />
      <Footer />
    </main>
  );
}

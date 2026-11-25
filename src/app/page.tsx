import Preloader from "@/components/motion/Preloader";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import Hero from "@/components/sections/Hero";
import ChannelMarquee from "@/components/sections/ChannelMarquee";
import Statement from "@/components/sections/Statement";
import Services from "@/components/sections/Services";
import Workflow from "@/components/sections/Workflow";
import VoiceShowcase from "@/components/sections/VoiceShowcase";
import Commerce from "@/components/sections/Commerce";
import Industries from "@/components/sections/Industries";
import Process from "@/components/sections/Process";
import Faq from "@/components/sections/Faq";
import Pricing from "@/components/sections/Pricing";
import Contact from "@/components/sections/Contact";
import AssistantWidget from "@/components/assistant/AssistantWidget";

/**
 * Effects map (shakirc.com/animations):
 *  01 Hover effects ........ Industries deck + lifting service cards
 *  02 Smooth loader ......... Preloader
 *  03 3D motion ............. Hero ParticleSphere
 *  04 Entrance reveal ....... PixelReveal (voice phone, footer wordmark) + preloader dissolve
 *  05 Micro interaction ..... MagneticButton (+ hover pulse ring)
 *  06 Parallax .............. Hero layers, Voice/Commerce floats, layered Contact scene
 *  Bonus: card fan (Services), text mask (all headings), text decrypt (eyebrows),
 *         text reveal on scroll (Statement)
 */
export default function Home() {
  return (
    <>
      <Preloader />
      <Navbar />
      <main>
        <Hero />
        <ChannelMarquee />
        <Statement />
        <Services />
        <Workflow />
        <VoiceShowcase />
        <Commerce />
        <Industries />
        <Process />
        <Pricing />
        <Faq />
        <Contact />
      </main>
      <Footer />
      <AssistantWidget />
    </>
  );
}

import Navbar from "@/components/Navbar";
import Hero from "@/components/Hero";
import Stats from "@/components/Stats";
import Catalog from "@/components/Catalog";
import Coupons from "@/components/Coupons";
import Differentials from "@/components/Differentials";
import Testimonials from "@/components/Testimonials";
import About from "@/components/About";
import Contact from "@/components/Contact";
import Footer from "@/components/Footer";
import WhatsAppFab from "@/components/WhatsAppFab";

const Index = () => {
  return (
    <main className="min-h-screen bg-background">
      <Navbar />
      <Hero />
      <Stats />
      <Catalog />
      <Coupons />
      <Differentials />
      <Testimonials />
      <About />
      <Contact />
      <Footer />
      <WhatsAppFab />
    </main>
  );
};

export default Index;

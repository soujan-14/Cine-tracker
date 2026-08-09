import { Navbar } from '@/components/layout/Navbar';
import { HeroSection } from '@/components/home/HeroSection';
import { TrendingSection } from '@/components/home/TrendingSection';
import { TopGrossingSection } from '@/components/home/TopGrossingSection';
import { UpcomingSection } from '@/components/home/UpcomingSection';
import { Footer } from '@/components/layout/Footer';

export default function HomePage() {
  return (
    <main className="min-h-screen bg-[#0B0B0B] text-white">
      <Navbar />
      <HeroSection />
      <div className="space-y-10 pb-16">
        <TrendingSection />
        <TopGrossingSection />
        <UpcomingSection />
      </div>
      <Footer />
    </main>
  );
}

import { useAuth } from '../context/AuthContext';
import { useSEO } from '../hooks/useSEO';
import Navbar from '../components/layout/Navbar';
import Footer from '../components/layout/Footer';
import HeroSection from '../components/landing/HeroSection';
import StatsSection from '../components/landing/StatsSection';
import FeaturesSection from '../components/landing/FeaturesSection';
import HowItWorksSection from '../components/landing/HowItWorksSection';
import FAQSection from '../components/landing/FAQSection';
import CTASection from '../components/landing/CTASection';
import DashboardNav, { DashboardHeader } from '../components/dashboard/DashboardLayout';
import FileManager from '../components/FileManager';

function LandingPage() {
  useSEO({
    title: 'Secure Cloud Storage',
    description:
      'CloudDrive is a secure personal cloud workspace with encrypted cloud storage, verified login access, and a modern file manager. Upload, organize, and download files from anywhere.',
    path: '/',
  });

  return (
    <div className="landing-page">
      <Navbar />
      <main>
        <HeroSection />
        <StatsSection />
        <FeaturesSection />
        <HowItWorksSection />
        <FAQSection />
        <CTASection />
      </main>
      <Footer />
    </div>
  );
}

function DashboardPage() {
  const { user } = useAuth();

  useSEO({
    title: 'My Drive',
    description: 'Manage your CloudDrive files — upload, search, rename, and download from your personal cloud storage dashboard.',
    path: '/',
    noindex: true,
  });

  return (
    <div className="dashboard-layout">
      <DashboardNav />
      <main className="dashboard-main">
        <DashboardHeader user={user} />
        <FileManager />
      </main>
    </div>
  );
}

export default function Home() {
  const { user } = useAuth();
  return user ? <DashboardPage /> : <LandingPage />;
}

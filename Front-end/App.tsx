import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Header from './components/Header';
import HeroSection from './components/HeroSection';
import HowItWorksSection from './components/HowItWorksSection';
import PlansSection from './components/PlansSection';
import ThemesSection from './components/ThemesSection';
import CakeOfTheMonthSection from './components/CakeOfTheMonthSection';
import TestimonialsSection from './components/TestimonialsSection';
import CreateYourOwnCakeSection from './components/CreateYourOwnCakeSection';
import BusinessModelSection from './components/BusinessModelSection';
import Footer from './components/Footer';
import OnboardingModal from './components/OnboardingModal';
import CheckoutModal from './components/CheckoutModal';
import AuthModal from './components/AuthModal';
import AdminPage from './components/AdminPage';
import LazyLoadWrapper from './components/LazyLoadWrapper';
import { Plan } from './types';
import { AuthProvider } from './contexts/AuthContext';

const App: React.FC = () => {
  const [activeSection, setActiveSection] = useState('hero');
  const [isQuizModalOpen, setIsQuizModalOpen] = useState(false);
  const [isCheckoutModalOpen, setIsCheckoutModalOpen] = useState(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [authModalView, setAuthModalView] = useState<'login' | 'signup'>('login');
  const [selectedPlan, setSelectedPlan] = useState<Plan | null>(null);

  useEffect(() => {
    const sections = document.querySelectorAll('section');
    const options = {
      root: null,
      rootMargin: '-100px 0px -50% 0px',
      threshold: 0,
    };

    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          setActiveSection(entry.target.id);
        }
      });
    }, options);

    sections.forEach(section => {
      if(section.id) observer.observe(section)
    });

    return () => sections.forEach(section => {
      if(section.id) observer.unobserve(section)
    });
  }, []);

  const handleSelectPlan = (plan: Plan) => {
    setSelectedPlan(plan);
    setIsCheckoutModalOpen(true);
  };
  
  const handleOpenLogin = () => {
    setAuthModalView('login');
    setIsAuthModalOpen(true);
  };
  
  const handleOpenSignUp = () => {
    setAuthModalView('signup');
    setIsAuthModalOpen(true);
  };

  const MainLayout = () => (
    <div className="bg-[#FFFAF0] font-sans">
      <Header 
        activeSection={activeSection}
        onLogin={handleOpenLogin}
        onSignUp={handleOpenSignUp}
      />
      <main>
        <section id="hero"><HeroSection onOpenModal={() => setIsQuizModalOpen(true)} /></section>
        <section id="como-funciona"><HowItWorksSection /></section>
        <section id="planos"><PlansSection onSelectPlan={handleSelectPlan} /></section>
        <LazyLoadWrapper>
          <section id="temas"><ThemesSection /></section>
        </LazyLoadWrapper>
        <LazyLoadWrapper>
            <section id="bolo-do-mes"><CakeOfTheMonthSection onOpenModal={() => setIsQuizModalOpen(true)} /></section>
        </LazyLoadWrapper>
          <LazyLoadWrapper>
          <section id="depoimentos"><TestimonialsSection /></section>
        </LazyLoadWrapper>
        <LazyLoadWrapper>
          <section id="crie-seu-bolo"><CreateYourOwnCakeSection /></section>
        </LazyLoadWrapper>
        <LazyLoadWrapper>
          <section id="negocio"><BusinessModelSection /></section>
        </LazyLoadWrapper>
      </main>
      <Footer />

      <OnboardingModal isOpen={isQuizModalOpen} onClose={() => setIsQuizModalOpen(false)} />
      
      {selectedPlan && (
          <CheckoutModal 
              isOpen={isCheckoutModalOpen} 
              onClose={() => setIsCheckoutModalOpen(false)} 
              plan={selectedPlan}
              onOpenLogin={handleOpenLogin}
          />
      )}

      <AuthModal 
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        initialView={authModalView}
      />
    </div>
  );


  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route path="/admin" element={<AdminPage />} />
          <Route path="/*" element={<MainLayout />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
};

export default App;

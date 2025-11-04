import React, { useState, useEffect, useRef } from 'react';
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
import { Plan, User } from './types';
import { AuthProvider, useAuth } from './contexts/AuthContext';

const AppContent: React.FC = () => {
  const { user } = useAuth();
  const [activeSection, setActiveSection] = useState('hero');
  const [isQuizModalOpen, setIsQuizModalOpen] = useState(false);
  const [isCheckoutModalOpen, setIsCheckoutModalOpen] = useState(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [authModalView, setAuthModalView] = useState<'login' | 'signup'>('login');
  const [selectedPlan, setSelectedPlan] = useState<Plan | null>(null);
  
  // Ref to track previous user state to detect login event
  const prevUserRef = useRef<User | null>(null);

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

  // Effect to handle post-login actions
  useEffect(() => {
    // If user just logged in (prev was null, current is not) AND there's a plan selected
    if (!prevUserRef.current && user && selectedPlan) {
      setIsAuthModalOpen(false); // Close login modal
      setIsCheckoutModalOpen(true); // Open checkout modal
    }
    prevUserRef.current = user;
  }, [user, selectedPlan]);


  const handleSelectPlan = (plan: Plan) => {
    setSelectedPlan(plan);
    if (user) {
      setIsCheckoutModalOpen(true);
    } else {
      handleOpenSignUp();
    }
  };
  
  const handleOpenLogin = () => {
    setAuthModalView('login');
    setIsAuthModalOpen(true);
  };
  
  const handleOpenSignUp = () => {
    setAuthModalView('signup');
    setIsAuthModalOpen(true);
  };

  return (
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
      
      {selectedPlan && user && (
          <CheckoutModal 
              isOpen={isCheckoutModalOpen} 
              onClose={() => {
                setIsCheckoutModalOpen(false);
                setSelectedPlan(null); // Clear selected plan when closing modal
              }} 
              plan={selectedPlan}
              onOpenLogin={handleOpenLogin}
          />
      )}

      <AuthModal 
        isOpen={isAuthModalOpen}
        onClose={() => {
          setIsAuthModalOpen(false);
          if(!user) {
            setSelectedPlan(null); // If user closes modal without logging in, forget the plan
          }
        }}
        initialView={authModalView}
      />
    </div>
  );
};


const App: React.FC = () => {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route path="/admin" element={<AdminPage />} />
          <Route path="/*" element={<AppContent />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;
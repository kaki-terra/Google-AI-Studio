import React, { useState, useEffect, Suspense, lazy } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Header from './components/Header';
import HeroSection from './components/HeroSection';
import LazyLoadWrapper from './components/LazyLoadWrapper';
import SectionPlaceholder from './components/SectionPlaceholder';
import { AuthProvider } from './contexts/AuthContext';
import { Plan } from './types';

// --- Lazy load components ---
const HowItWorksSection = lazy(() => import('./components/HowItWorksSection'));
const PlansSection = lazy(() => import('./components/PlansSection'));
const ThemesSection = lazy(() => import('./components/ThemesSection'));
const CakeOfTheMonthSection = lazy(() => import('./components/CakeOfTheMonthSection'));
const TestimonialsSection = lazy(() => import('./components/TestimonialsSection'));
const CreateYourOwnCakeSection = lazy(() => import('./components/CreateYourOwnCakeSection'));
const BusinessModelSection = lazy(() => import('./components/BusinessModelSection'));
const Footer = lazy(() => import('./components/Footer'));
const OnboardingModal = lazy(() => import('./components/OnboardingModal'));
const CheckoutModal = lazy(() => import('./components/CheckoutModal'));
const AdminPage = lazy(() => import('./components/AdminPage'));
const AuthModal = lazy(() => import('./components/AuthModal'));

const MainLayout: React.FC = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState<Plan | null>(null);
  const [activeSection, setActiveSection] = useState('');
  const [authModal, setAuthModal] = useState<{isOpen: boolean, view: 'login' | 'sign_up'}>({isOpen: false, view: 'login'});

  const handleOpenModal = () => setIsModalOpen(true);
  const handleCloseModal = () => setIsModalOpen(false);
  
  const handleOpenAuthModal = (view: 'login' | 'sign_up') => setAuthModal({isOpen: true, view});
  const handleCloseAuthModal = () => setAuthModal({isOpen: false, view: 'login'});

  const handleOpenCheckout = (plan: Plan) => {
    setSelectedPlan(plan);
    setIsCheckoutOpen(true);
  };
  const handleCloseCheckout = () => {
    setIsCheckoutOpen(false);
    setSelectedPlan(null);
  };

  useEffect(() => {
    const sectionIds = ['como-funciona', 'planos', 'temas', 'delicia-do-mes', 'depoimentos', 'crie-seu-bolo', 'negocio'];
    
    const handleScroll = () => {
      let currentSection = '';
      for (const id of sectionIds) {
        const section = document.getElementById(id);
        if (section) {
          const rect = section.getBoundingClientRect();
          if (rect.top <= 100 && rect.bottom >= 100) {
            currentSection = id;
            break;
          }
        }
      }
      setActiveSection(currentSection);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();

    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);


  return (
    <div className="bg-[#FFF9F2] min-h-screen text-[#5D4037]">
      <Header 
        onOpenModal={handleOpenModal} 
        activeSection={activeSection}
        onLogin={() => handleOpenAuthModal('login')}
        onSignUp={() => handleOpenAuthModal('sign_up')}
      />
      <main>
        <HeroSection onOpenModal={handleOpenModal} />
        
        <div id="como-funciona">
          <LazyLoadWrapper placeholder={<SectionPlaceholder className="h-[500px]" />}>
            <HowItWorksSection />
          </LazyLoadWrapper>
        </div>
        
        <div id="planos">
          <LazyLoadWrapper placeholder={<SectionPlaceholder className="h-[750px]" />}>
            <PlansSection onSelectPlan={handleOpenCheckout} />
          </LazyLoadWrapper>
        </div>
        
        <div id="temas">
          <LazyLoadWrapper placeholder={<SectionPlaceholder className="h-[600px]" />}>
            <ThemesSection />
          </LazyLoadWrapper>
        </div>
        
        <div id="delicia-do-mes">
          <LazyLoadWrapper placeholder={<SectionPlaceholder className="h-[650px]" />}>
            <CakeOfTheMonthSection onOpenModal={handleOpenModal} />
          </LazyLoadWrapper>
        </div>
        
        <div id="depoimentos">
          <LazyLoadWrapper placeholder={<SectionPlaceholder className="h-[550px]" />}>
            <TestimonialsSection />
          </LazyLoadWrapper>
        </div>
        
        <div id="crie-seu-bolo">
          <LazyLoadWrapper placeholder={<SectionPlaceholder className="h-[850px]" />}>
            <CreateYourOwnCakeSection />
          </LazyLoadWrapper>
        </div>

        <div id="negocio">
          <LazyLoadWrapper placeholder={<SectionPlaceholder className="h-[700px]" />}>
            <BusinessModelSection />
          </LazyLoadWrapper>
        </div>
      </main>

      <LazyLoadWrapper placeholder={<SectionPlaceholder className="h-[320px]" />}>
          <Footer />
      </LazyLoadWrapper>
      
      {isModalOpen && (
        <Suspense fallback={<div className="fixed inset-0 bg-black bg-opacity-50 z-50" />}>
          <OnboardingModal isOpen={isModalOpen} onClose={handleCloseModal} />
        </Suspense>
      )}

      {isCheckoutOpen && selectedPlan && (
        <Suspense fallback={<div className="fixed inset-0 bg-black bg-opacity-50 z-50" />}>
          <CheckoutModal isOpen={isCheckoutOpen} onClose={handleCloseCheckout} plan={selectedPlan} />
        </Suspense>
      )}

      {authModal.isOpen && (
        <Suspense fallback={<div className="fixed inset-0 bg-black bg-opacity-50 z-50" />}>
          <AuthModal 
            isOpen={authModal.isOpen} 
            onClose={handleCloseAuthModal} 
            initialView={authModal.view}
          />
        </Suspense>
      )}
    </div>
  );
};


const App: React.FC = () => {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Suspense fallback={<div className="w-full h-screen bg-[#FFF9F2]" />}>
          <Routes>
            <Route path="/" element={<MainLayout />} />
            <Route path="/admin" element={<AdminPage />} />
          </Routes>
        </Suspense>
      </AuthProvider>
    </BrowserRouter>
  );
};


export default App;
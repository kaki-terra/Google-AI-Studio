import React, { useState } from 'react';

interface NavLinkProps {
  href: string;
  activeSection: string;
  children: React.ReactNode;
  onLinkClick?: () => void;
  className?: string;
}

const NavLink: React.FC<NavLinkProps> = ({ href, activeSection, children, onLinkClick, className }) => {
  const isActive = activeSection === href.substring(1);

  const handleClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
    e.preventDefault();
    const targetId = href.substring(1);
    const targetElement = document.getElementById(targetId);
    if (targetElement) {
      const headerOffset = 80;
      const elementPosition = targetElement.getBoundingClientRect().top;
      const offsetPosition = elementPosition + window.pageYOffset - headerOffset;

      window.scrollTo({
         top: offsetPosition,
         behavior: "smooth"
      });
    }
    if (onLinkClick) {
      onLinkClick();
    }
  };

  return (
    <a 
      href={href} 
      onClick={handleClick}
      className={`${className} transition-colors pb-1 cursor-pointer ${isActive ? 'text-[#D99A9A] font-bold border-b-2 border-[#D99A9A]' : 'text-gray-600 hover:text-[#BF8B8B]'}`}
    >
      {children}
    </a>
  );
};

interface HeaderProps {
  onOpenModal: () => void;
  activeSection: string;
}

const Header: React.FC<HeaderProps> = ({ onOpenModal, activeSection }) => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const navLinks = [
    { href: '#como-funciona', label: 'Como Funciona' },
    { href: '#planos', label: 'Planos' },
    { href: '#temas', label: 'Temas' },
    { href: '#negocio', label: 'O Negócio' },
  ];

  const handleOpenModalAndCloseMenu = () => {
    onOpenModal();
    setIsMobileMenuOpen(false);
  }

  return (
    <header className="bg-[#FFFAF0] shadow-md sticky top-0 z-50">
      <div className="container mx-auto px-6 py-3 flex justify-between items-center">
        <div className="text-3xl font-brand text-[#D99A9A]">
          BoloFlix
        </div>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex space-x-8 items-center">
          {navLinks.map(link => (
            <NavLink key={link.href} href={link.href} activeSection={activeSection}>{link.label}</NavLink>
          ))}
        </nav>
        <button
          onClick={onOpenModal}
          className="hidden md:block bg-[#E5B8B8] text-white px-6 py-2 rounded-full hover:bg-[#D99A9A] transition-transform hover:scale-105 shadow-sm"
          aria-label="Iniciar assinatura"
        >
          Assine Agora
        </button>

        {/* Mobile Menu Button */}
        <div className="md:hidden">
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="text-gray-600 hover:text-[#D99A9A]"
            aria-label="Abrir menu"
          >
            {isMobileMenuOpen ? (
              <svg xmlns="http://www.w3.org/2000/svg" className="h-7 w-7" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            ) : (
              <svg xmlns="http://www.w3.org/2000/svg" className="h-7 w-7" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16m-7 6h7" />
              </svg>
            )}
          </button>
        </div>
      </div>

      {/* Mobile Menu Panel */}
      {isMobileMenuOpen && (
        <div className="md:hidden bg-[#FFFAF0] shadow-lg absolute w-full left-0 top-full flex flex-col items-center space-y-4 py-6">
          {navLinks.map(link => (
            <NavLink 
              key={link.href} 
              href={link.href} 
              activeSection={activeSection} 
              onLinkClick={() => setIsMobileMenuOpen(false)}
              className="text-lg"
            >
              {link.label}
            </NavLink>
          ))}
          <button
            onClick={handleOpenModalAndCloseMenu}
            className="bg-[#E5B8B8] text-white px-8 py-3 mt-4 rounded-full hover:bg-[#D99A9A] transition-transform hover:scale-105 shadow-sm text-lg"
            aria-label="Iniciar assinatura"
          >
            Assine Agora
          </button>
        </div>
      )}
    </header>
  );
};

export default Header;
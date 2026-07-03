'use client';
import { useState, useEffect } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Home, Briefcase, Mail, Menu, X, Github, Linkedin, Twitter } from 'lucide-react';

export const FloatingNavbar = ({ config }) => {
  const [visible, setVisible] = useState(true);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [lastScrollY, setLastScrollY] = useState(0);

  // Hide desktop nav on scroll down, show on scroll up
  useEffect(() => {
    const handleScroll = () => {
      const currentY = window.scrollY;
      if (currentY > lastScrollY && currentY > 100) {
        setVisible(false);
      } else {
        setVisible(true);
      }
      setLastScrollY(currentY);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [lastScrollY]);

  // Close menu when clicking outside
  useEffect(() => {
    if (!mobileOpen) return;
    const close = () => setMobileOpen(false);
    document.addEventListener('click', close);
    return () => document.removeEventListener('click', close);
  }, [mobileOpen]);

  const navItems = [
    { name: 'Home', icon: Home, href: '#hero' },
    { name: 'Projects', icon: Briefcase, href: '#projects' },
    { name: 'Contact', icon: Mail, href: '#contact' },
  ];

  // Social links from DB config, fallback to defaults
  const socialLinks = [
    config?.githubUrl && { name: 'GitHub', icon: Github, href: config.githubUrl },
    config?.linkedinUrl && { name: 'LinkedIn', icon: Linkedin, href: config.linkedinUrl },
    config?.twitterUrl && { name: 'Twitter', icon: Twitter, href: config.twitterUrl },
  ].filter(Boolean);

  const handleNavClick = (e, href) => {
    e.preventDefault();
    e.stopPropagation();
    setMobileOpen(false);
    const element = document.querySelector(href);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  const toggleMenu = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setMobileOpen(prev => !prev);
  };

  return (
    <>
      {/* ── DESKTOP NAV: animated floating pill ── */}
      <motion.nav
        initial={{ y: -100 }}
        animate={{ y: visible ? 0 : -100 }}
        transition={{ duration: 0.3 }}
        className="hidden sm:flex fixed top-4 left-1/2 -translate-x-1/2 z-50 px-4 w-full max-w-xl"
      >
        <div className="w-full bg-black/40 backdrop-blur-xl border border-white/10 rounded-full px-6 py-3 shadow-2xl shadow-purple-500/20 flex items-center justify-center gap-6">
          {navItems.map((item) => (
            <a
              key={item.name}
              href={item.href}
              onClick={(e) => handleNavClick(e, item.href)}
              className="text-gray-300 hover:text-white transition-all duration-300 flex items-center gap-2 group"
            >
              <item.icon size={18} className="group-hover:scale-110 transition-transform" />
              <span className="text-sm font-medium">{item.name}</span>
            </a>
          ))}
          {socialLinks.map((social) => (
            <a
              key={social.name}
              href={social.href}
              target="_blank"
              rel="noopener noreferrer"
              className="text-gray-400 hover:text-white transition-all duration-300 p-2 hover:bg-white/5 rounded-full"
              aria-label={social.name}
            >
              <social.icon size={16} />
            </a>
          ))}
        </div>
      </motion.nav>

      {/* ── MOBILE: fixed hamburger button top-right ── */}
      {/* Always visible, never hides on scroll */}
      <div className="sm:hidden fixed top-4 right-4 z-[9999]">
        <button
          type="button"
          onClick={toggleMenu}
          className="w-11 h-11 bg-black/70 backdrop-blur-xl border border-white/20 rounded-full flex items-center justify-center text-white shadow-lg shadow-purple-500/20 active:scale-95 transition-transform"
          style={{ touchAction: 'manipulation', WebkitTapHighlightColor: 'transparent' }}
          aria-label="Toggle menu"
          aria-expanded={mobileOpen}
        >
          <AnimatePresence mode="wait" initial={false}>
            {mobileOpen ? (
              <motion.span
                key="close"
                initial={{ rotate: -90, opacity: 0 }}
                animate={{ rotate: 0, opacity: 1 }}
                exit={{ rotate: 90, opacity: 0 }}
                transition={{ duration: 0.15 }}
              >
                <X size={20} />
              </motion.span>
            ) : (
              <motion.span
                key="open"
                initial={{ rotate: 90, opacity: 0 }}
                animate={{ rotate: 0, opacity: 1 }}
                exit={{ rotate: -90, opacity: 0 }}
                transition={{ duration: 0.15 }}
              >
                <Menu size={20} />
              </motion.span>
            )}
          </AnimatePresence>
        </button>

        {/* Dropdown — anchored to the right below the button */}
        <AnimatePresence>
          {mobileOpen && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: -8 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: -8 }}
              transition={{ duration: 0.15 }}
              onClick={(e) => e.stopPropagation()}
              className="absolute top-14 right-0 w-52 bg-black/90 backdrop-blur-xl border border-white/10 rounded-2xl p-3 shadow-2xl shadow-purple-500/20"
            >
              <div className="flex flex-col gap-1">
                {navItems.map((item) => (
                  <a
                    key={item.name}
                    href={item.href}
                    onClick={(e) => handleNavClick(e, item.href)}
                    className="flex items-center gap-3 px-3 py-2.5 text-gray-300 hover:text-white hover:bg-white/5 active:bg-white/10 rounded-xl transition-all duration-200"
                    style={{ touchAction: 'manipulation', WebkitTapHighlightColor: 'transparent' }}
                  >
                    <item.icon size={18} className="text-purple-400 shrink-0" />
                    <span className="text-sm font-medium">{item.name}</span>
                  </a>
                ))}

                {socialLinks.length > 0 && (
                  <>
                    <div className="my-1 border-t border-white/10" />
                    <div className="flex gap-2 px-3 py-1.5">
                      {socialLinks.map((social) => (
                        <a
                          key={social.name}
                          href={social.href}
                          target="_blank"
                          rel="noopener noreferrer"
                          aria-label={social.name}
                          className="p-2 text-gray-400 hover:text-white bg-white/5 hover:bg-white/10 rounded-lg transition-all"
                          style={{ touchAction: 'manipulation', WebkitTapHighlightColor: 'transparent' }}
                        >
                          <social.icon size={16} />
                        </a>
                      ))}
                    </div>
                  </>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </>
  );
};

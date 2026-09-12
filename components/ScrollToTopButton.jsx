'use client';

import React, { useState, useEffect, useRef } from 'react';
import { ChevronUp } from 'lucide-react';

export default function ScrollToTopButton() {
  const [isVisible, setIsVisible] = useState(false);
  const scrollRef = useRef(null);

  useEffect(() => {
    const contentElement = document.querySelector('.dashboard-content');
    if (!contentElement) return;

    const handleScroll = () => {
      const { scrollHeight, scrollTop, clientHeight } = contentElement;
      const isAtBottom = scrollHeight - scrollTop - clientHeight < 100;
      const isScrolled = scrollTop > 300;

      setIsVisible(isScrolled || isAtBottom);
    };

    contentElement.addEventListener('scroll', handleScroll);
    return () => contentElement.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToTop = () => {
    const contentElement = document.querySelector('.dashboard-content');
    if (contentElement) {
      contentElement.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  return isVisible ? (
    <button
      onClick={scrollToTop}
      ref={scrollRef}
      className="fixed bottom-6 right-6 z-30 p-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-full shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-110 md:bottom-8 md:right-8"
      aria-label="Scroll vers le haut"
      title="Aller en haut"
    >
      <ChevronUp className="w-5 h-5" />
    </button>
  ) : null;
}

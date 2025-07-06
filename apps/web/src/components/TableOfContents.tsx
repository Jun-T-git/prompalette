'use client';

import { useState } from 'react';
import { Menu, X } from 'lucide-react';

interface TOCSection {
  id: string;
  title: string;
  icon: React.ComponentType<{ className?: string }>;
}

interface TableOfContentsProps {
  sections: TOCSection[];
}

export function TableOfContents({ sections }: TableOfContentsProps) {
  const [isOpen, setIsOpen] = useState(false);

  const handleSectionClick = (id: string) => {
    setIsOpen(false);
    
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ 
        behavior: 'smooth',
        block: 'start' 
      });
    }
  };

  return (
    <>
      {/* Mobile TOC Toggle */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="fixed top-4 right-4 z-50 lg:hidden p-2 sm:p-3 bg-white/95 backdrop-blur-md rounded-xl sm:rounded-2xl shadow-xl border border-gray-200/30"
        aria-label="目次を開く"
      >
        {isOpen ? <X className="w-4 h-4 sm:w-5 sm:h-5" /> : <Menu className="w-4 h-4 sm:w-5 sm:h-5" />}
      </button>

      {/* Desktop TOC */}
      <nav className="fixed left-4 xl:left-6 top-1/2 -translate-y-1/2 z-40 hidden lg:block">
        <div className="bg-white/95 backdrop-blur-md rounded-2xl shadow-2xl border border-gray-200/30 p-4 xl:p-6 max-w-[200px] xl:max-w-xs">
          <h3 className="text-sm font-semibold text-gray-800 mb-4 flex items-center gap-2">
            <Menu className="w-4 h-4" />
            目次
          </h3>
          <ul className="space-y-3">
            {sections.map((section) => {
              const Icon = section.icon;
              return (
                <li key={section.id}>
                  <button
                    onClick={() => handleSectionClick(section.id)}
                    className="flex items-center gap-3 text-sm text-gray-600 hover:text-indigo-500 transition-colors w-full text-left group"
                  >
                    <Icon className="w-4 h-4 group-hover:scale-110 transition-transform" />
                    {section.title}
                  </button>
                </li>
              );
            })}
          </ul>
        </div>
      </nav>

      {/* Mobile TOC Overlay */}
      {isOpen && (
        <div className="fixed inset-0 z-40 lg:hidden">
          <div className="absolute inset-0 bg-black/30 backdrop-blur-md" onClick={() => setIsOpen(false)} />
          <div className="absolute top-16 sm:top-20 right-4 bg-white/95 backdrop-blur-sm rounded-2xl shadow-2xl border border-gray-200/30 p-4 sm:p-6 min-w-[220px] sm:min-w-[250px] max-w-[300px]">
            <h3 className="text-sm font-semibold text-gray-800 mb-4 flex items-center gap-2">
              <Menu className="w-4 h-4" />
              目次
            </h3>
            <ul className="space-y-3">
              {sections.map((section) => {
                const Icon = section.icon;
                return (
                  <li key={section.id}>
                    <button
                      onClick={() => handleSectionClick(section.id)}
                      className="flex items-center gap-3 text-sm text-gray-600 hover:text-indigo-500 transition-colors w-full text-left group"
                    >
                      <Icon className="w-4 h-4 group-hover:scale-110 transition-transform" />
                      {section.title}
                    </button>
                  </li>
                );
              })}
            </ul>
          </div>
        </div>
      )}
    </>
  );
}
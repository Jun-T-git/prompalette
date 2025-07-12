'use client';

import { useState } from 'react';
import { Menu, X } from 'lucide-react';

interface TOCSubsection {
  id: string;
  title: string;
}

interface TOCSection {
  id: string;
  title: string;
  icon: React.ComponentType<{ className?: string }>;
  subsections?: TOCSubsection[];
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
      <nav className="hidden lg:block">
        <div className="bg-white/95 backdrop-blur-md rounded-2xl shadow-2xl border border-gray-200/30 p-4 xl:p-6">
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
                  {section.subsections && (
                    <ul className="ml-7 mt-2 space-y-2">
                      {section.subsections.map((subsection) => (
                        <li key={subsection.id}>
                          <button
                            onClick={() => handleSectionClick(subsection.id)}
                            className="flex items-center text-xs text-gray-500 hover:text-indigo-400 transition-colors w-full text-left"
                          >
                            <span className="w-1.5 h-1.5 bg-gray-300 rounded-full mr-2 flex-shrink-0"></span>
                            {subsection.title}
                          </button>
                        </li>
                      ))}
                    </ul>
                  )}
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
                    {section.subsections && (
                      <ul className="ml-7 mt-2 space-y-2">
                        {section.subsections.map((subsection) => (
                          <li key={subsection.id}>
                            <button
                              onClick={() => handleSectionClick(subsection.id)}
                              className="flex items-center text-xs text-gray-500 hover:text-indigo-400 transition-colors w-full text-left"
                            >
                              <span className="w-1.5 h-1.5 bg-gray-300 rounded-full mr-2 flex-shrink-0"></span>
                              {subsection.title}
                            </button>
                          </li>
                        ))}
                      </ul>
                    )}
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
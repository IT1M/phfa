'use client';

import { useState } from 'react';
import { Menu, X, Home, Search, FileText, User, Settings } from 'lucide-react';
import Link from 'next/link';

export default function MobileNavigation() {
  const [isOpen, setIsOpen] = useState(false);

  const navItems = [
    { icon: Home, label: 'Home', href: '/' },
    { icon: Search, label: 'Search', href: '/search' },
    { icon: FileText, label: 'Documents', href: '/documents' },
    { icon: User, label: 'Patients', href: '/patients' },
    { icon: Settings, label: 'Settings', href: '/settings' },
  ];

  return (
    <>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="fixed top-4 left-4 z-50 p-3 bg-blue-600 rounded-lg shadow-lg md:hidden min-w-[44px] min-h-[44px]"
        aria-label="Toggle menu"
      >
        {isOpen ? (
          <X className="w-6 h-6 text-white" />
        ) : (
          <Menu className="w-6 h-6 text-white" />
        )}
      </button>

      {isOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 md:hidden"
          onClick={() => setIsOpen(false)}
        />
      )}

      <nav
        className={`fixed top-0 left-0 h-full w-64 bg-white shadow-xl z-40 transform transition-transform duration-300 md:translate-x-0 ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="p-6 pt-20">
          <h2 className="text-xl font-bold text-gray-800 mb-6">Medical Archive</h2>
          <ul className="space-y-2">
            {navItems.map((item) => (
              <li key={item.href}>
                <Link
                  href={item.href}
                  onClick={() => setIsOpen(false)}
                  className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-100 active:bg-gray-200 transition-colors min-h-[44px]"
                >
                  <item.icon className="w-5 h-5 text-gray-600" />
                  <span className="text-gray-700">{item.label}</span>
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </nav>
    </>
  );
}

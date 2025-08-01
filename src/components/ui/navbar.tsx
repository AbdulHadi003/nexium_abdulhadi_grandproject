'use client';

import { usePathname, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { auth } from '../../lib/firebase';
import { onAuthStateChanged, signOut } from 'firebase/auth';
import Link from 'next/link';
import clsx from 'clsx';
import NavigateButtonWithBadge from './navigateButtonWithBadge';

const navItems = [
  { label: 'Home', path: '/dashboard' },
  { label: 'Mood', path: '/mood' },
  { label: 'Journal', path: '/journal' },
  { label: 'Habits', path: '/habits' },
];

export default function NavBar() {
  const router = useRouter();
  const pathname = usePathname();

  const [userEmail, setUserEmail] = useState<string | null>(null);
  const [showMenu, setShowMenu] = useState(false);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUserEmail(user?.email ?? null);
    });
    return () => unsubscribe();
  }, []);

  const handleLogout = async () => {
    try {
      await signOut(auth);
      router.push('/');
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  const userInitial = userEmail?.[0]?.toUpperCase() ?? '';

  return (
    <nav className="flex items-center justify-between px-6 py-4 bg-gradient-to-br from-indigo-50 via-white to-cyan-50 shadow-sm border-b border-gray-100">
      {/* Left: Logo and Nav Links */}
      <div className="flex items-center space-x-6">
        {/* Logo */}
        <div className="flex items-center space-x-3">
          <div className="w-9 h-9 bg-gradient-to-br from-indigo-500 to-cyan-500 rounded-xl flex items-center justify-center">
            <i className="ri-heart-pulse-line text-white text-xl"></i>
          </div>
          <span className="text-xl font-bold text-gray-800">Wellness Journey</span>
        </div>

        {/* Nav Links */}
        <div className="hidden md:flex space-x-2">
          {navItems.map((item) => (
            <Link
              key={item.path}
              href={item.path}
              className={clsx(
                'px-4 py-2 text-sm rounded-xl transition-all font-medium',
                pathname === item.path
                  ? 'bg-gradient-to-r from-indigo-100 to-cyan-100 text-indigo-800 shadow'
                  : 'text-gray-700 hover:bg-white/70 border border-white/50'
              )}
            >
              {item.label}
            </Link>
          ))}

          {/* Alerts button with badge */}
          <NavigateButtonWithBadge label="Alerts" route="alerts" />
        </div>
      </div>

      {/* Right: User Avatar */}
      {userInitial && (
        <div className="relative">
          <div
            onClick={() => setShowMenu(!showMenu)}
            className="w-9 h-9 flex items-center justify-center rounded-full bg-gradient-to-br from-indigo-500 to-cyan-500 text-white font-semibold cursor-pointer hover:brightness-110 transition"
            title={userEmail ?? ''}
          >
            {userInitial}
          </div>

          {showMenu && (
            <div className="absolute right-0 mt-2 w-36 bg-white border border-gray-200 shadow-xl rounded-md z-50">
              <button
                onClick={handleLogout}
                className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-gray-100"
              >
                Logout
              </button>
            </div>
          )}
        </div>
      )}
    </nav>
  );
}

'use client';

import { usePathname, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { auth } from '../../lib/firebase';
import { onAuthStateChanged, signOut } from 'firebase/auth';
import { ArrowLeftIcon } from '@heroicons/react/24/solid';

export default function NavBar() {
  const router = useRouter();
  const pathname = usePathname();

  const [userEmail, setUserEmail] = useState<string | null>(null);
  const [showMenu, setShowMenu] = useState(false);

  // Listen to auth state
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUserEmail(user?.email ?? null);
    });
    return () => unsubscribe();
  }, []);

  // Back button behavior
  const handleBack = () => {
    if (pathname === '/dashboard') {
      router.refresh();
    } else {
      router.back();
    }
  };

  // Logout logic
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
    <nav className="relative flex items-center justify-between px-6 py-4 bg-emerald-100 shadow-md">
      <div className="flex items-center space-x-4">
        <button
          onClick={handleBack}
          className="p-2 rounded-full hover:bg-emerald-200 transition"
          title="Go Back"
        >
          <ArrowLeftIcon className="h-5 w-5 text-emerald-800" />
        </button>

        {/* Logo */}
        <h1 className="text-lg font-bold text-emerald-900 select-none">MindWell</h1>
      </div>

      {/* User Initial and Dropdown */}
      {userInitial && (
        <div className="relative">
          <div
            onClick={() => setShowMenu(!showMenu)}
            className="w-8 h-8 flex items-center justify-center rounded-full bg-emerald-700 text-white font-semibold cursor-pointer"
            title={userEmail ?? ''}
          >
            {userInitial}
          </div>

          {showMenu && (
            <div className="absolute right-0 mt-2 w-32 bg-white border border-gray-200 shadow-lg rounded-md z-50">
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

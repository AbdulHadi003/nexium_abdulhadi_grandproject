'use client';

import { auth, provider } from '../../lib/firebase';
import { signInWithPopup } from 'firebase/auth';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { useState } from 'react';

export default function AuthButtons() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = async () => {
    setIsLoading(true);
    try {
      await signInWithPopup(auth, provider);
      router.push('/dashboard');
    } catch (error) {
      console.error("Login error", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-2xl shadow-xl p-8 border border-gray-100 w-full max-w-md">
      <div className="text-center mb-6">
        <h2 className="text-2xl font-bold text-gray-800 mb-2">Get Started Today</h2>
        <p className="text-gray-600">Join thousands on their wellness journey</p>
      </div>

      <button
        onClick={handleLogin}
        disabled={isLoading}
        className="w-full bg-white border-2 border-gray-200 text-gray-700 py-4 px-6 rounded-xl font-medium hover:bg-gray-50 hover:border-gray-300 transition-all duration-200 flex items-center justify-center disabled:opacity-70 disabled:cursor-not-allowed whitespace-nowrap cursor-pointer shadow-sm"
      >
        {isLoading ? (
          <div className="flex items-center">
            <i className="ri-loader-4-line animate-spin mr-3 text-xl w-6 h-6 flex items-center justify-center"></i>
            Signing you in...
          </div>
        ) : (
          <div className="flex items-center">
            <Image
              src="/images/google.png"
              alt="Google"
              width={20}
              height={20}
              className="mr-3"
            />
            Continue with Google
          </div>
        )}
      </button>

      <p className="text-center text-xs text-gray-500 mt-4">
        By continuing, you agree to our Terms of Service and Privacy Policy
      </p>
    </div>
  );
}

'use client';

import { auth, provider } from '../../lib/firebase';
import { signInWithPopup } from 'firebase/auth';
import { useRouter } from 'next/navigation';
import Image from 'next/image';

export default function AuthButtons() {
  const router = useRouter();

  const handleLogin = async () => {
    try {
      await signInWithPopup(auth, provider);
      router.push('/dashboard');
    } catch (error) {
      console.error("Login error", error);
    }
  };

  return (
    <div className="flex pt-90 pl-200 ">
      <div className="bg-emerald-100 bg-opacity-90 p-8 rounded-xl shadow-md text-center w-100 max-w-sm">
        <h1 className="text-xl font-semibold mb-6 text-emerald-900">
          Get started with MindWell
        </h1>
      <button
        onClick={handleLogin}
        className="flex items-center justify-center w-full bg-amber-50 border border-gray-300 px-5 py-3 rounded-md shadow hover:shadow-md transition"
      >
        <Image
          src="/images/google.png"
          alt="Google"
          width={20}
          height={20}
          className="mr-2"
        />
        <span className="text-sm font-medium text-emerald-900">Login with Google</span>
      </button>
    </div>
    </div>
  );
}
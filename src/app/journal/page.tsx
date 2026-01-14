'use client';

import { InputForm } from "@/components/ui/journalForm"; 
import NavBar from '@/components/ui/navbar';
import useAuthGuard from '@/hooks/useAuthGuard';


export default function Journal() {
  const loading = useAuthGuard();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-gray-500">Checking authentication...</p>
      </div>
    );
  }
  return (
    <><NavBar />
    <br/><br/><br/>
    <div className="p-8">
      <h1 className="text-2xl font-bold text-gray-800 mb-6">Journal</h1>
      <InputForm />
    </div></>
  );
}
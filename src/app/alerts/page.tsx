"use client";
import AlertList from '@/components/ui/alertList';
import NavBar from '@/components/ui/navbar';
import useAuthGuard from '@/hooks/useAuthGuard';


export default function AlertsPage() {
  const loading = useAuthGuard();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-gray-500">Checking authentication...</p>
      </div>
    );
  }
  return (
    <>
      <NavBar />
      <main className="max-w-3xl mx-auto mt-10">
        <AlertList />
      </main>
    </>
  );
}

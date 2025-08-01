import AlertList from '@/components/ui/alertList';
import NavBar from '@/components/ui/navbar';

export default function AlertsPage() {
  return (
    <>
      <NavBar />
      <main className="max-w-3xl mx-auto mt-10">
        <AlertList />
      </main>
    </>
  );
}

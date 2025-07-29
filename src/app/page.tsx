import AuthButtons from '@/components/ui/authbuttons';

export default function Home() {
  return (
    <main className="min-h-screen bg-cover bg-center flex items-center justify-center"
      style={{ backgroundImage: "url('/images/home.jpg')" }}
    >
      <AuthButtons />
    </main>
  );
}

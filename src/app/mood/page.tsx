import MoodTracker from "@/components/ui/moodTracker";
import NavBar from '@/components/ui/navbar';

export default function MoodPage() {
  return (
    <>
      <NavBar />
    <main className="min-h-screen bg-gray-100">
      <MoodTracker />
    </main>
    </>
  );
}
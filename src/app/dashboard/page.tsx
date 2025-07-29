import NavBar from '@/components/ui/navbar';
import NavigateButton from "@/components/ui/navigatebutton";
export default function Dashboard() {
  return (
    <>
      <NavBar />
      <div className="p-6">
              <h1 className="text-2xl font-bold text-gray-800">Welcome to the Dashboard</h1>
              <NavigateButton label="Mood" route="mood" />
              <NavigateButton label="Journal" route="journal" />
              <NavigateButton label="Habits" route="habits" />
              <NavigateButton label="Email Alerts" route="email-alerts" />
      </div>
    </>

  );
}
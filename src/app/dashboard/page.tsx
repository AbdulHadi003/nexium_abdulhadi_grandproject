import NavBar from '@/components/ui/navbar';
import NavigateButton from '@/components/ui/navigatebutton';
import NavigateButtonWithBadge from '@/components/ui/navigateButtonWithBadge';
import Alert from '@/components/ui/alert';

export default function Dashboard() {
  return (
    <>
      <Alert />
      <NavBar />
      <div className="p-6">
        <h1 className="text-2xl font-bold text-gray-800">Welcome to the Dashboard</h1>
        <NavigateButton label="Mood" route="mood" />
        <NavigateButton label="Journal" route="journal" />
        <NavigateButton label="Habits" route="habits" />
        <NavigateButtonWithBadge label="Alerts" route="alerts" />
      </div>
    </>
  );
}

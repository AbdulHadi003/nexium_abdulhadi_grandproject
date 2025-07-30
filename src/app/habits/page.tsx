import { HabitForm } from "@/components/ui/habitForm";


export default function Habits() {
  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold text-gray-800 mb-6">Habits</h1>
      <HabitForm />
    </div>
  );
}

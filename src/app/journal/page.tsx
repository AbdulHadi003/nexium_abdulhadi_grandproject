import { InputForm } from "@/components/ui/journalForm"; 
import NavBar from '@/components/ui/navbar';


export default function Journal() {
  return (
    <><NavBar />
    <div className="p-8">
      <h1 className="text-2xl font-bold text-gray-800 mb-6">Journal</h1>
      <InputForm />
    </div></>
  );
}
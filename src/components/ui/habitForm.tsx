"use client";

import { useEffect, useState } from "react";
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "@/lib/firebase";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";

type HabitEntry = {
  created_at: string;
  writing: string;
};

const HABITS = [
  "Daily exercise",
  "10-12 water glasses",
  "8 hours of sleep",
  "Limited use of social media",
  "Healthy diet",
];

export function HabitForm() {
  const [uid, setUid] = useState<string | null>(null);
  const [submittedToday, setSubmittedToday] = useState(false);
  const [habitStates, setHabitStates] = useState<Record<string, boolean>>({});
  const [history, setHistory] = useState<HabitEntry[]>([]);
  const [expandedIndex, setExpandedIndex] = useState<number | null>(null);
  const [selectedEntry, setSelectedEntry] = useState<string | null>(null);
  const [analysis, setAnalysis] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        setUid(user.uid);

        const res = await fetch("/api/habits/check-today", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ id: user.uid }),
        });

        const result = await res.json();
        setSubmittedToday(result.submitted);

        const histRes = await fetch("/api/habits/history", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ id: user.uid }),
        });

        const hist = await histRes.json();
        setHistory(Array.isArray(hist) ? hist : []);
      }

      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const handleCheckboxChange = (label: string) => {
    setHabitStates((prev) => ({
      ...prev,
      [label]: !prev[label],
    }));
  };

  const convertHabitsToString = () => {
    return HABITS.map((habit) => `${habit} = ${habitStates[habit] ? "yes" : "no"}`).join(", ");
  };

  const handleSubmit = async () => {
    if (!uid) return;

    const writing = convertHabitsToString();

    const res = await fetch("/api/habits/insert", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: uid, writing }),
    });

    if (res.status === 409) {
      toast.info("You've already submitted your habits today.");
      setSubmittedToday(true);
      return;
    }

    if (!res.ok) {
      toast.error("Failed to submit habits.");
      return;
    }

    toast.success("Habits submitted successfully.");
    setSubmittedToday(true);
    setHabitStates({});
  };

  const handleAnalyze = async (text: string) => {
    setAnalysis("Analyzing...");
    try {
      const res = await fetch("/api/habits/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text, type: "habit" }),
      });

      const result = await res.json();
      setAnalysis(result.analysis || "AI did not return an analysis.");
    } catch (err) {
      console.error("Analysis error:", err);
      setAnalysis("Error analyzing entry.");
    }
  };

  if (loading) return <p className="text-center text-gray-500">Loading...</p>;

  return (
    <div className="flex flex-col lg:flex-row gap-6 bg-white py-12 px-4">
      {/* Left - Habit History */}
      <div className="w-full lg:w-1/4 border-r pr-4">
        <h2 className="text-lg font-semibold mb-2">Previous Habit Entries</h2>
        <div className="space-y-4 max-h-[400px] overflow-y-auto">
          {history.map((entry, idx) => {
            const isSelected = selectedEntry === entry.writing;
            const hasAnalysis = isSelected && analysis !== null && analysis !== "Analyzing...";
            const isExpanded = expandedIndex === idx;

            return (
              <div
                key={idx}
                className={`border p-3 rounded shadow-sm bg-gray-50 ${
                  isSelected ? "ring-2 ring-green-400" : ""
                }`}
              >
                <p className="text-sm text-gray-700 font-medium">{entry.created_at}</p>
                <p className="text-sm mt-1">
                  {isExpanded ? entry.writing : `${entry.writing.slice(0, 80)}${entry.writing.length > 80 ? "..." : ""}`}
                </p>

                <div className="flex gap-2 mt-2">
                  <button
                    onClick={() => setExpandedIndex(isExpanded ? null : idx)}
                    className="text-xs text-blue-600 hover:underline"
                  >
                    {isExpanded ? "Show Less" : "Read More"}
                  </button>

                  {!isSelected ? (
                    <button
                      onClick={() => {
                        setSelectedEntry(entry.writing);
                        setAnalysis(null);
                      }}
                      className="text-xs text-green-600 hover:underline"
                    >
                      Get AI Suggestions
                    </button>
                  ) : (
                    <>
                      {!hasAnalysis ? (
                        <button
                          onClick={() => handleAnalyze(entry.writing)}
                          className="text-xs text-green-800 hover:underline font-semibold"
                        >
                          Analyze with AI
                        </button>
                      ) : (
                        <button
                          onClick={() => {
                            setSelectedEntry(null);
                            setAnalysis(null);
                          }}
                          className="text-xs text-red-600 hover:underline font-semibold"
                        >
                          Undo Selection
                        </button>
                      )}
                    </>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Center - Habit Checkboxes */}
      <div className="w-full lg:w-1/2">
        <h1 className="text-2xl font-bold text-gray-800 mb-6">Daily Habits</h1>
        {submittedToday ? (
          <div className="text-center text-green-700 font-medium">
            ✅ You`ve already submitted your habits for today.
          </div>
        ) : (
          <div className="space-y-4 bg-white p-6 rounded shadow-md">
            {HABITS.map((habit) => (
              <div key={habit} className="flex items-center space-x-2">
                <Checkbox
                  id={habit}
                  checked={habitStates[habit] || false}
                  onCheckedChange={() => handleCheckboxChange(habit)}
                />
                <label htmlFor={habit} className="text-sm font-medium text-gray-700">
                  {habit}
                </label>
              </div>
            ))}
            <div className="flex justify-center mt-6">
              <Button onClick={handleSubmit} variant="outline">
                Submit Habits
              </Button>
            </div>
          </div>
        )}
      </div>

      {/* Right - AI Analysis */}
      <div className="w-full lg:w-1/4 border-l pl-4">
        <h2 className="text-lg font-semibold mb-2">AI Suggestions</h2>
        {selectedEntry && (
          <div className="text-sm text-gray-800 whitespace-pre-wrap">
            <p className="font-medium mb-1">Selected Entry:</p>
            <p className="text-gray-600 mb-2 max-h-40 overflow-y-auto border p-2 rounded bg-neutral-50">
              {selectedEntry}
            </p>
            <p className="font-medium mt-4">AI Response:</p>
            <p className="text-gray-800 border p-2 rounded bg-amber-50 mt-1">
              {analysis || "Click 'Analyze with AI' to get insights."}
            </p>
          </div>
        )}
        {!selectedEntry && (
          <p className="text-sm text-gray-500">Select a habit entry to get suggestions.</p>
        )}
      </div>
    </div>
  );
}

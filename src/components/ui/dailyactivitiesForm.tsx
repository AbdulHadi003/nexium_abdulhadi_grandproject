'use client';
import { useEffect, useState } from "react";
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "@/lib/firebase";
import { toast } from "sonner";
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

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-cyan-50 flex items-center justify-center">
        <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-8">
          <div className="flex items-center space-x-3">
            <i className="ri-loader-4-line animate-spin text-indigo-500 text-2xl w-8 h-8 flex items-center justify-center"></i>
            <p className="text-gray-600 font-medium">Loading your daily activities...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-cyan-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          
          {/* Left - Habit History */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6 h-fit">
              <div className="flex items-center mb-6">
                <div className="w-10 h-10 bg-gradient-to-br from-purple-400 to-purple-500 rounded-lg flex items-center justify-center mr-3">
                  <i className="ri-history-line text-white text-lg w-5 h-5 flex items-center justify-center"></i>
                </div>
                <h2 className="text-lg font-bold text-gray-900">Previous Entries</h2>
              </div>
              
              <div className="space-y-3 max-h-96 overflow-y-auto">
                {history.length === 0 ? (
                  <p className="text-sm text-gray-500 text-center py-8">No previous entries yet</p>
                ) : (
                  history.map((entry, idx) => {
                    const isSelected = selectedEntry === entry.writing;
                    const hasAnalysis = isSelected && analysis !== null && analysis !== "Analyzing...";
                    const isExpanded = expandedIndex === idx;

                    return (
                      <div
                        key={idx}
                        className={`p-4 border rounded-xl transition-all duration-200 cursor-pointer ${
                          isSelected 
                            ? "border-green-300 bg-green-50 shadow-md" 
                            : "border-gray-200 bg-gray-50 hover:border-indigo-300 hover:shadow-sm"
                        }`}
                      >
                        <div className="flex items-center justify-between mb-2">
                          <p className="text-xs font-medium text-gray-600">
                            {new Date(entry.created_at).toLocaleDateString()}
                          </p>
                          <i className="ri-more-2-line text-gray-400 w-4 h-4 flex items-center justify-center"></i>
                        </div>
                        
                        <p className="text-sm text-gray-700 mb-3">
                          {isExpanded ? entry.writing : `${entry.writing.slice(0, 80)}${entry.writing.length > 80 ? "..." : ""}`}
                        </p>

                        <div className="flex gap-2">
                          <button
                            onClick={() => setExpandedIndex(isExpanded ? null : idx)}
                            className="text-xs text-indigo-600 hover:text-indigo-700 font-medium whitespace-nowrap cursor-pointer"
                          >
                            {isExpanded ? "Show Less" : "Read More"}
                          </button>

                          {!isSelected ? (
                            <button
                              onClick={() => {
                                setSelectedEntry(entry.writing);
                                setAnalysis(null);
                              }}
                              className="text-xs text-green-600 hover:text-green-700 font-medium whitespace-nowrap cursor-pointer"
                            >
                              Get AI Insights
                            </button>
                          ) : (
                            <>
                              {!hasAnalysis ? (
                                <button
                                  onClick={() => handleAnalyze(entry.writing)}
                                  className="text-xs text-green-700 hover:text-green-800 font-semibold whitespace-nowrap cursor-pointer"
                                >
                                  Analyze with AI
                                </button>
                              ) : (
                                <button
                                  onClick={() => {
                                    setSelectedEntry(null);
                                    setAnalysis(null);
                                  }}
                                  className="text-xs text-red-600 hover:text-red-700 font-semibold whitespace-nowrap cursor-pointer"
                                >
                                  Clear Selection
                                </button>
                              )}
                            </>
                          )}
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          </div>

          {/* Center - Habit Tracker */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-8">
              <div className="text-center mb-8">
                <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-pink-500 rounded-2xl flex items-center justify-center mb-4 mx-auto">
                  <i className="ri-task-line text-white text-2xl w-8 h-8 flex items-center justify-center"></i>
                </div>
                <h1 className="text-2xl font-bold text-gray-900 mb-2">Daily Activities Tracker</h1>
                <p className="text-gray-600">Build consistent healthy routines for better wellness</p>
              </div>

              {submittedToday ? (
                <div className="text-center py-12">
                  <div className="w-20 h-20 bg-gradient-to-br from-green-400 to-green-500 rounded-full flex items-center justify-center mb-6 mx-auto">
                    <i className="ri-check-line text-white text-3xl w-10 h-10 flex items-center justify-center"></i>
                  </div>
                  <h3 className="text-xl font-bold text-green-700 mb-2">Great job!</h3>
                  <p className="text-green-600 font-medium">You`ve already submitted your daily activities for today.</p>
                  <p className="text-gray-500 text-sm mt-2">Come back tomorrow to keep your progress on track!</p>
                </div>
              ) : (
                <div className="space-y-6">
                  <div className="grid gap-4">
                    {HABITS.map((habit) => (
                      <div key={habit} className="flex items-center p-4 bg-gradient-to-r from-gray-50 to-gray-100 rounded-xl border border-gray-200 hover:border-purple-300 hover:shadow-sm transition-all duration-200">
                        <Checkbox
                          id={habit}
                          checked={habitStates[habit] || false}
                          onCheckedChange={() => handleCheckboxChange(habit)}
                          className="mr-4"
                        />
                        <label 
                          htmlFor={habit} 
                          className={`text-base font-medium flex-1 cursor-pointer ${
                            habitStates[habit] ? 'text-green-700' : 'text-gray-700'
                          }`}
                        >
                          {habit}
                        </label>
                        {habitStates[habit] && (
                          <div className="w-8 h-8 bg-gradient-to-br from-green-400 to-green-500 rounded-full flex items-center justify-center">
                            <i className="ri-check-line text-white text-sm w-4 h-4 flex items-center justify-center"></i>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>

                  <div className="text-center pt-6 border-t border-gray-200">
                    <button
                      onClick={handleSubmit}
                      className="bg-gradient-to-r from-purple-500 to-pink-500 text-white px-8 py-3 rounded-xl font-semibold hover:shadow-lg transform hover:scale-105 transition-all duration-200 whitespace-nowrap cursor-pointer"
                    >
                      <i className="ri-save-line mr-2 w-5 h-5 flex items-center justify-center"></i>
                      Submit Today`s Activities
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Right - AI Analysis */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6 h-fit">
              <div className="flex items-center mb-6">
                <div className="w-10 h-10 bg-gradient-to-br from-indigo-400 to-cyan-400 rounded-lg flex items-center justify-center mr-3">
                  <i className="ri-brain-line text-white text-lg w-5 h-5 flex items-center justify-center"></i>
                </div>
                <h2 className="text-lg font-bold text-gray-900">AI Insights</h2>
              </div>

              {selectedEntry ? (
                <div className="space-y-4">
                  <div>
                    <p className="text-sm font-medium text-gray-700 mb-2">Selected Entry:</p>
                    <div className="p-3 bg-gradient-to-br from-gray-50 to-gray-100 rounded-lg border border-gray-200 max-h-32 overflow-y-auto">
                      <p className="text-sm text-gray-700">{selectedEntry}</p>
                    </div>
                  </div>

                  <div>
                    <p className="text-sm font-medium text-gray-700 mb-2">AI Analysis:</p>
                    <div className="p-4 bg-gradient-to-br from-amber-50 to-yellow-50 rounded-lg border border-amber-200 min-h-24">
                      {analysis === "Analyzing..." ? (
                        <div className="flex items-center space-x-2">
                          <i className="ri-loader-4-line animate-spin text-amber-600 w-4 h-4 flex items-center justify-center"></i>
                          <p className="text-sm text-amber-700 font-medium">Analyzing your habits...</p>
                        </div>
                      ) : (
                        <p className="text-sm text-gray-800 whitespace-pre-wrap leading-relaxed">
                          {analysis || "Click 'Analyze with AI' to get personalized insights about your habits."}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              ) : (
                <div className="text-center py-8">
                  <div className="w-16 h-16 bg-gradient-to-br from-gray-200 to-gray-300 rounded-full flex items-center justify-center mb-4 mx-auto">
                    <i className="ri-lightbulb-line text-gray-500 text-xl w-6 h-6 flex items-center justify-center"></i>
                  </div>
                  <p className="text-sm text-gray-500 leading-relaxed">
                    Select a Activities entry from your history to get AI-powered insights and suggestions for improvement.
                  </p>
                </div>
              )}
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
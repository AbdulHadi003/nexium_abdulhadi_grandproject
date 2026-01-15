'use client';

import { useCallback, useEffect, useState } from "react";
import { auth } from "@/lib/firebase";
import { onAuthStateChanged } from "firebase/auth";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";

import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Tooltip,
  Legend,
} from "chart.js";
import { Bar } from "react-chartjs-2";

ChartJS.register(CategoryScale, LinearScale, BarElement, Tooltip, Legend);

const MOODS = ["angry", "sad", "lazy", "happy", "excited", "tired", "heartbroken", "playful"];

type MoodEntry = { created_at: string; mood_: string };

export default function MoodTracker() {
  const [uid, setUid] = useState<string | null>(null);
  const [selectedMood, setSelectedMood] = useState<string | null>(null);
  const [history, setHistory] = useState<MoodEntry[]>([]);
  const [analysis, setAnalysis] = useState<string | null>(null);
  const [previousAnalysis, setPreviousAnalysis] = useState<string | null>(null);
  const [duration, setDuration] = useState<number | "all" | "">("");
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [graphDuration, setGraphDuration] = useState<number | "all" | "">("");
  const [graphError, setGraphError] = useState<string | null>(null);
  const [moodDistribution, setMoodDistribution] = useState<Record<string, number> | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const handleGraphData = useCallback(() => {
    if (!uid || !history.length || !graphDuration) {
      setMoodDistribution(null);
      setGraphError(null);
      return;
    }

    let filtered: MoodEntry[] = [];
    if (graphDuration === "all") {
      filtered = history;
    } else {
      // take last N entries
      filtered = history.slice(-graphDuration);
    }

  if (graphDuration !== "all" && filtered.length < graphDuration) {
  setMoodDistribution(null);
  setGraphError(`Not enough data: expected ${graphDuration} entries, got ${filtered.length}.`);
  return;
}


    const total = filtered.length;
    const counts: Record<string, number> = {};
    filtered.forEach(({ mood_ }) => {
      counts[mood_] = (counts[mood_] || 0) + 1;
    });

    const percentages: Record<string, number> = {};
    for (const mood in counts) {
      percentages[mood] = parseFloat(((counts[mood] / total) * 100).toFixed(2));
    }

    setMoodDistribution(percentages);
    setGraphError(null);
  }, [uid, history, graphDuration]);

  useEffect(() => {
    handleGraphData();
  }, [graphDuration, history, handleGraphData]);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        setUid(user.uid);
        await loadMoodHistory(user.uid);
      }
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  const loadMoodHistory = async (uid: string) => {
    const res = await fetch("/api/mood/history", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: uid }),
    });
    const data = await res.json();
    setHistory(Array.isArray(data) ? data : []);
  };


 const handleSubmit = async () => {
  if (!selectedMood || !uid) {
    toast.error("Please select a mood first.");
    return;
  }
  try {
    const res = await fetch("/api/mood/insert", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ uid, mood_: selectedMood }),
    });
    if (!res.ok) {
      throw new Error("Request failed");
    }
    toast.success("Mood entered successfully");
    setTimeout(() => {
      setSelectedMood(null);
    }, 800);
    await loadMoodHistory(uid);
  } catch (error) {
    toast.error("Failed to submit mood. Please try again.");
  }
};


  const handleAnalyze = async () => {
    if (!uid || !duration) return;
    setErrorMessage("");
    setIsAnalyzing(true);

    let filtered: MoodEntry[] = [];
    if (duration === "all") {
      filtered = history;
      if (!filtered.length) {
        setErrorMessage("Not enough data for analysis.");
        setIsAnalyzing(false);
        return;
      }
    } else {
      filtered = history.slice(-duration);
if (typeof duration === "number" && filtered.length < duration) {
  setErrorMessage(`Not enough data: expected ${duration} entries, got ${filtered.length}.`);
  setIsAnalyzing(false);
  return;
}

    }

    const text = filtered.map(e => e.mood_).join(" ");
    try {
      const res = await fetch("/api/mood/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text }),
      });
      const result = await res.json();
      setPreviousAnalysis(analysis ?? "");
      setAnalysis(result.analysis || "No insights returned.");
    } catch {
      setErrorMessage("Something went wrong during analysis.");
    }
    setIsAnalyzing(false);
  };
  useEffect(() => {
  if (errorMessage) {
    const timeout = setTimeout(() => setErrorMessage(null), 5000);
    return () => clearTimeout(timeout); // cleanup
  }
}, [errorMessage]);

useEffect(() => {
  if (graphError) {
    const timeout = setTimeout(() => setGraphError(null), 5000);
    return () => clearTimeout(timeout); // cleanup
  }
}, [graphError]);


const handleUndo = () => {
  setAnalysis(null);
  setPreviousAnalysis(null);
  toast.info("Analysis removed.");
};


  const getMoodIcon = (mood: string) => {
    const icons: Record<string, string> = {
  angry: "ri-emotion-sad-fill",       
  sad: "ri-emotion-sad-line",
  lazy: "ri-moon-line",     
  happy: "ri-emotion-happy-line",
  excited: "ri-heart-3-line",
  tired: "ri-zzz-line",        
  heartbroken: "ri-emotion-unhappy-line",
  playful: "ri-emotion-laugh-line",
};

    return icons[mood] || "ri-emotion-normal-line";
  };

  const getMoodColor = (mood: string) => {
    const colors: Record<string, string> = {
      angry: "from-red-400 to-red-500",
      sad: "from-blue-400 to-blue-500",
      lazy: "from-gray-400 to-gray-500",
      happy: "from-yellow-400 to-yellow-500",
      excited: "from-pink-400 to-pink-500",
      tired: "from-purple-400 to-purple-500",
      heartbroken: "from-indigo-400 to-indigo-500",
      playful: "from-green-400 to-green-500",
    };
    return colors[mood] || "from-gray-400 to-gray-500";
  };

  if (loading) return <p className="text-center py-10">Loading...</p>;

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-cyan-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-6 py-8">
        <div className="max-w-6xl mx-auto text-center">
          <h1 className="text-3xl font-bold text-gray-900">Mood Tracker</h1>
          <p className="text-gray-600 mt-2 text-lg">Track and analyze your daily moods</p>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-6 py-12 space-y-8">
        {/* Mood Selection */}
        <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-6">How are you feeling today?</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-4">
            {MOODS.map(mood => (
              <button
                key={mood}
                onClick={() => setSelectedMood(mood)}
                className={`p-4 rounded-2xl border-2 transition-all duration-300 transform hover:-translate-y-1 hover:shadow-lg ${
                  selectedMood === mood
                    ? "border-indigo-500 bg-indigo-50 shadow-lg"
                    : "border-gray-200 hover:border-gray-300"
                }`}
              >
                <div className={`w-12 h-12 mx-auto mb-2 bg-gradient-to-br ${getMoodColor(mood)} rounded-xl flex items-center justify-center shadow-md`}>
                  <i className={`${getMoodIcon(mood)} text-white text-xl`}></i>
                </div>
                <p className="text-sm font-medium text-gray-700 capitalize">{mood}</p>
              </button>
            ))}
          </div>
        </div>

        {/* Submit Mood */}
        {selectedMood && (
          <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-8 text-center">
            <div className={`w-20 h-20 mx-auto mb-4 bg-gradient-to-br ${getMoodColor(selectedMood)} rounded-2xl flex items-center justify-center shadow-lg`}>
              <i className={`${getMoodIcon(selectedMood)} text-white text-3xl`}></i>
            </div>
            <p className="text-lg text-gray-700 mb-4">
              Selected mood: <span className="font-semibold capitalize text-gray-900">{selectedMood}</span>
            </p>
            <Button onClick={handleSubmit} className="bg-gradient-to-r from-indigo-500 to-purple-500 text-white px-8 py-3 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300">
              Save Mood
            </Button>
          </div>
        )}

        {/* Controls: Analysis & Graph */}
        <div className="grid md:grid-cols-2 gap-8">
          {/* Analysis */}
          <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-8">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Mood Analysis</h3>
            <div className="space-y-4">
              <select
                value={duration}
                onChange={e => setDuration(e.target.value === "all" ? "all" : (Number(e.target.value) || ""))}
                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              >
                <option value="">Select duration</option>
                <option value="5">Last 5 entries</option>
                <option value="15">Last 15 entries</option>
                <option value="30">Last 30 entries</option>
                <option value="all">All time</option>
              </select>
              <Button onClick={handleAnalyze}
                disabled={isAnalyzing || !duration}
                className="w-full bg-gradient-to-r from-blue-500 to-cyan-500 text-white py-3 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 disabled:opacity-50"
              >
                {isAnalyzing ? "Analyzing..." : "Analyze Mood Patterns"}
              </Button>
            </div>
          </div>

          {/* Graph Distribution */}
          <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-8">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Mood Distribution</h3>
            <div className="space-y-4">
              <select
                value={graphDuration}
                onChange={e => setGraphDuration(e.target.value === "all" ? "all" : (Number(e.target.value) || ""))}
                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              >
                <option value="">Select duration</option>
                <option value="5">Last 5 entries</option>
                <option value="15">Last 15 entries</option>
                <option value="30">Last 30 entries</option>
                <option value="all">All time</option>
              </select>
              <Button onClick={handleGraphData}
                disabled={!graphDuration}
                className="w-full bg-gradient-to-r from-green-500 to-emerald-500 text-white py-3 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 disabled:opacity-50"
              >
                Generate Graph
              </Button>
            </div>
          </div>
        </div>

        {/* Chart */}
        {moodDistribution && (
          <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-8">
            <h3 className="text-lg font-semibold text-gray-900 mb-6">Mood Distribution Chart</h3>
            <div className="h-80">
              <Bar
                data={{
                  labels: Object.keys(moodDistribution),
                  datasets: [{
                    label: "Mood %",
                    data: Object.values(moodDistribution),
                    backgroundColor: "rgba(59, 130, 246, 0.5)",
                    borderColor: "rgba(59, 130, 246, 1)",
                    borderWidth: 1,
                    borderRadius: 8,
                  }],
                }}
                options={{
                  scales: {
                    y: {
                      beginAtZero: true,
                      max: 100,
                      ticks: { callback: (val) => `${val}%` },
                    },
                    x: {
                      grid: { display: false },
                    },
                  },
                }}
              />
            </div>
          </div>
        )}

        {/* Errors */}
        {(errorMessage || graphError) && (
          <div className="bg-red-50 border border-red-200 rounded-2xl p-6">
            <div className="flex items-center">
              <div className="w-8 h-8 bg-red-100 rounded-lg flex items-center justify-center mr-3">
                <i className="ri-error-warning-line text-red-500"></i>
              </div>
              <p className="text-red-700">{errorMessage || graphError}</p>
            </div>
          </div>
        )}

        {/* Analysis Result */}
        {analysis && (
          <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-8">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Analysis Results</h3>
            <div className="prose prose-gray max-w-none">
              <p className="text-gray-700 leading-relaxed">{analysis}</p>
              {previousAnalysis !== null && (
  <Button onClick={handleUndo} variant="outline">
    Undo
  </Button>
)}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

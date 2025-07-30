"use client";

import { useCallback,useEffect, useState } from "react";
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

type MoodEntry = {
  created_at: string;
  mood_: string;
};

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
    if (history.length < graphDuration) {
      setMoodDistribution(null);
      setGraphError("Not enough data for selected duration.");
      return;
    }
    filtered = history.slice(-graphDuration);
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
    if (!selectedMood || !uid) return;

    const res = await fetch("/api/mood/insert", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ uid, mood_: selectedMood }),
    });

    if (!res.ok) return toast.error("Failed to submit mood.");

    toast.success("Mood submitted!");
    setSelectedMood(null);
    await loadMoodHistory(uid);
  };


  const handleAnalyze = async () => {
  if (!uid || !duration) return;

  setErrorMessage("");
  setIsAnalyzing(true);

  let filtered: MoodEntry[] = [];

  if (duration === "all") {
    filtered = history;
    if (filtered.length < 1) {
      setErrorMessage("Not enough data for analysis.");
      setIsAnalyzing(false);
      return;
    }
  } else {
    if (history.length < duration) {
      setErrorMessage("Not enough data for selected duration.");
      setIsAnalyzing(false);
      return;
    }
    filtered = history.slice(-duration);
  }

  const text = filtered.map((e) => e.mood_).join(" ");

  try {
    const res = await fetch("/api/mood/analyze", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ text }),
    });

    const result = await res.json();

    // Store the current analysis for undo
    setPreviousAnalysis(analysis);
    setAnalysis(result.analysis || "No insights returned.");
  } catch {
    setErrorMessage("Something went wrong during analysis.");
  }

  setIsAnalyzing(false);
};

const handleUndo = () => {
  setAnalysis(previousAnalysis);
  setPreviousAnalysis(null); // one-step undo only
};

  if (loading) return <p className="text-center">Loading...</p>;

  return (
    <div className="flex flex-col lg:flex-row gap-6 bg-white-full py-12 px-4">
      {/* Left: History */}
      <div className="w-full lg:w-1/4 border-r pr-4">
        <h2 className="text-lg font-semibold mb-2">Mood History</h2>
        <div className="space-y-2 max-h-[400px] overflow-y-auto">
          {history.map((entry, idx) => (
            <div key={idx} className="border p-2 rounded bg-slate-50">
              <p className="text-sm text-gray-700">{entry.created_at}</p>
              <p className="text-sm capitalize text-blue-600">{entry.mood_}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Center: Mood Select */}
      <div className="w-full lg:w-1/2">
        <h1 className="text-xl font-bold mb-4">How are you feeling?</h1>
        <div className="grid grid-cols-3 gap-4 mb-6">
          {MOODS.map((mood) => (
            <button
              key={mood}
              className={`border p-2 rounded text-center capitalize ${
                selectedMood === mood ? "bg-green-200" : "bg-gray-100"
              }`}
              onClick={() => setSelectedMood(mood)}
            >
              {mood}
            </button>
          ))}
        </div>
        <Button onClick={handleSubmit} disabled={!selectedMood}>
  Submit Mood
</Button>

{/* Graphical Mood Analysis */}
<div className="mt-8">
  <h2 className="text-lg font-semibold mb-2">Mood Frequency Graph</h2>
  <select
  value={graphDuration}
  onChange={(e) =>
    setGraphDuration(e.target.value === "all" ? "all" : parseInt(e.target.value))
  }
  className="w-full border p-2 rounded mb-4"
>
  <option value="" disabled hidden>
    Select Data Duration
  </option>
  <option value="5">Last 5 entries</option>
  <option value="15">Last 15 entries</option>
  <option value="30">Last 30 entries</option>
  <option value="all">All time</option>
</select>


  {graphError && <p className="text-red-500">{graphError}</p>}

  {moodDistribution && (
    <Bar
      data={{
        labels: Object.keys(moodDistribution),
        datasets: [
          {
            label: "Mood %",
            data: Object.values(moodDistribution),
            backgroundColor: "rgba(59, 130, 246, 0.5)", // Tailwind blue-500
            borderColor: "rgba(59, 130, 246, 1)",
            borderWidth: 1,
          },
        ],
      }}
      options={{
        scales: {
          y: {
            beginAtZero: true,
            max: 100,
            ticks: {
              callback: function (value) {
                return value + "%";
              },
            },
          },
        },
      }}
    />
  )}
</div>


      </div>

      {/* Right: Analysis */}
      <div className="w-full lg:w-1/4 border-l pl-4">
        <h2 className="text-lg font-semibold mb-2">AI Mood Insights</h2>

        <div className="space-y-3">
          <select
  value={duration}
  onChange={(e) =>
    setDuration(e.target.value === "all" ? "all" : parseInt(e.target.value))
  }
  className="w-full border p-2 rounded"
>
  <option value="" disabled hidden>
    Select Data Duration
  </option>
  <option value="5">Last 5 entries</option>
  <option value="15">Last 15 entries</option>
  <option value="30">Last 30 entries</option>
  <option value="all">All time</option>
</select>


<div className="flex gap-2">
  <Button onClick={handleAnalyze} disabled={isAnalyzing}>
    Analyze with AI
  </Button>

  {analysis && (
    <Button onClick={handleUndo} variant="outline">
      Undo
    </Button>
  )}
</div>
          {isAnalyzing && <p className="text-sm text-gray-500">Analyzing...</p>}
          {errorMessage && <p style={{ color: "red", marginTop: "8px" }}>{errorMessage}</p>}

          {analysis && (
            <div className="mt-4 p-3 rounded bg-yellow-50 border text-sm whitespace-pre-wrap">
              {analysis}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

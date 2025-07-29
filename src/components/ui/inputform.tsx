"use client";

import { useEffect, useState } from "react";
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "@/lib/firebase";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Textarea } from "@/components/ui/textarea";

const FormSchema = z.object({
  username: z.string().min(50, "Content must be at least 50 characters"),
});

type JournalEntry = {
  created_at: string;
  writing: string;
};

export function InputForm() {
  const form = useForm<z.infer<typeof FormSchema>>({
    resolver: zodResolver(FormSchema),
    defaultValues: {
      username: "",
    },
  });
  const [expandedIndex, setExpandedIndex] = useState<number | null>(null);
  const [uid, setUid] = useState<string | null>(null);
  const [submittedToday, setSubmittedToday] = useState(false);
  const [history, setHistory] = useState<JournalEntry[]>([]);
  const [selectedWriting, setSelectedWriting] = useState<string | null>(null);
  const [analysis, setAnalysis] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  // Load UID and today's status
 useEffect(() => {
  const unsubscribe = onAuthStateChanged(auth, async (user) => {
    if (user) {
      setUid(user.uid);

      // Check if submitted today
      const res = await fetch("/api/check-today", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: user.uid }),
      });

      const result = await res.json();
      setSubmittedToday(result.submitted);

      // **Replace your existing history fetch code with this:**
      const histRes = await fetch("/api/history", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: user.uid }),
      });

      const hist = await histRes.json();

      console.log("History from API:", hist); // DEBUG OUTPUT

      if (Array.isArray(hist)) {
        setHistory(hist);
      } else {
        setHistory([]); // fallback empty array
        console.error("History is not an array:", hist);
      }
    }
    setLoading(false);
  });

  return () => unsubscribe();
}, []);


  const handleSubmit = async (data: z.infer<typeof FormSchema>) => {
    if (!uid) return;

    try {
      const res = await fetch("/api/insert", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: uid, writing: data.username }),
      });

      if (res.status === 409) {
        toast.info("You've already submitted your journal today.");
        setSubmittedToday(true);
        return;
      }

      if (!res.ok) throw new Error("Failed to submit");

      toast.success("Journal submitted successfully.");
      setSubmittedToday(true);
      form.reset();
    } catch (error) {
      console.error(error);
      toast.error("Submission failed.");
    }
  };

const handleAnalyze = async (text: string) => {
  setAnalysis("Analyzing...");
  try {
    const res = await fetch("/api/analyze", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ text }),
    });

    const result = await res.json();
    console.log("AI analysis result:", result); // 👈 Add this

    setAnalysis(result.analysis || "AI did not return an analysis.");
  } catch (err) {
    console.error("Failed to analyze:", err);
    setAnalysis("Error analyzing entry.");
  }
};


  if (loading) return <p className="text-center text-gray-500">Loading...</p>;

  return (
    <div className="flex flex-col lg:flex-row gap-6 bg-white py-12 px-4">
      {/* Left: History */}
      <div className="w-full lg:w-1/4 border-r pr-4">
        <h2 className="text-lg font-semibold mb-2">Previous Journals</h2>
        <div className="space-y-4 max-h-[400px] overflow-y-auto">
          {history.map((entry, idx) => {
  const isSelected = selectedWriting === entry.writing;
  const hasAnalysis = isSelected && analysis !== null && analysis !== "Analyzing...";
  const isExpanded = expandedIndex === idx;

  return (
    <div key={idx} className={`border p-3 rounded shadow-sm bg-gray-50 ${isSelected ? "ring-2 ring-green-400" : ""}`}>
      <p className="text-sm text-gray-700 font-medium">{entry.created_at}</p>

      <p className="text-sm mt-1">
        {isExpanded
          ? entry.writing
          : `${entry.writing.slice(0, 80)}${entry.writing.length > 80 ? "..." : ""}`}
      </p>

      <div className="flex gap-2 mt-2">
        <button
          onClick={(e) => {
            e.stopPropagation();
            setExpandedIndex(isExpanded ? null : idx);
          }}
          className="text-xs text-blue-600 hover:underline"
        >
          {isExpanded ? "Show Less" : "Read More"}
        </button>

        {!isSelected ? (
          <button
            onClick={() => {
              setSelectedWriting(entry.writing);
              setAnalysis(null); // reset analysis
            }}
            className="text-xs text-green-600 hover:underline"
          >
            Select to Analyze
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
                  setSelectedWriting(null);
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

      {/* Center: Form */}
      <div className="w-full lg:w-1/2">
        <h1 className="text-2xl font-bold text-gray-800 mb-6">Journal</h1>
        {submittedToday ? (
          <div className="text-center text-green-700 font-medium">
            ✅ You`ve already submitted your journal for today.
          </div>
        ) : (
          <Form {...form}>
            <form
              onSubmit={form.handleSubmit(handleSubmit)}
              className="space-y-6 bg-white p-6 rounded shadow-md"
            >
              <FormField
                control={form.control}
                name="username"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Write about your day</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Share your feelings, thoughts, and reflections..."
                        className="h-60 resize-none border px-3 py-2 rounded-md"
                        {...field}
                      />
                    </FormControl>
                    <FormDescription>
                      Your journal will be stored securely.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <div className="flex justify-center">
                <Button type="submit" variant="outline">
                  that&apos;s all for today!
                </Button>
              </div>
            </form>
          </Form>
        )}
      </div>

      {/* Right: AI Analysis */}
      <div className="w-full lg:w-1/4 border-l pl-4">
        <h2 className="text-lg font-semibold mb-2">AI Analysis</h2>
        {selectedWriting && (
          <div className="text-sm text-gray-800 whitespace-pre-wrap">
            <p className="font-medium mb-1">Selected Entry:</p>
            <p className="text-gray-600 mb-2 max-h-40 overflow-y-auto border p-2 rounded bg-neutral-50">
              {selectedWriting}
            </p>
            <p className="font-medium mt-4">AI Response:</p>
            <p className="text-gray-800 border p-2 rounded bg-amber-50 mt-1">
              {analysis || "Click 'Analyze with AI' to get insights."}
            </p>
          </div>
        )}
        {!selectedWriting && (
          <p className="text-sm text-gray-500">
            Select a journal entry to analyze with AI.
          </p>
        )}
      </div>
    </div>
  );
}

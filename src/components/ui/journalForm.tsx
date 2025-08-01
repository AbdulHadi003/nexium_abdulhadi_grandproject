'use client';
import { useEffect, useState } from "react";
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "@/lib/firebase";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";

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

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        setUid(user.uid);

        const res = await fetch("/api/journal/check-today", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ id: user.uid }),
        });

        const result = await res.json();
        setSubmittedToday(result.submitted);

        const histRes = await fetch("/api/journal/history", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ id: user.uid }),
        });

        const hist = await histRes.json();
        console.log("History from API:", hist);

        if (Array.isArray(hist)) {
          setHistory(hist);
        } else {
          setHistory([]);
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
      const res = await fetch("/api/journal/insert", {
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
      const res = await fetch("/api/journal/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text }),
      });

      const result = await res.json();
      console.log("AI analysis result:", result);

      setAnalysis(result.analysis || "AI did not return an analysis.");
    } catch (err) {
      console.error("Failed to analyze:", err);
      setAnalysis("Error analyzing entry.");
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-cyan-50 flex items-center justify-center">
        <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-8">
          <div className="flex items-center space-x-3">
            <i className="ri-loader-4-line animate-spin text-indigo-500 text-2xl w-8 h-8 flex items-center justify-center"></i>
            <p className="text-gray-600 font-medium">Loading your journal...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-cyan-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          
          {/* Left - Journal History */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6 h-fit">
              <div className="flex items-center mb-6">
                <div className="w-10 h-10 bg-gradient-to-br from-blue-400 to-blue-500 rounded-lg flex items-center justify-center mr-3">
                  <i className="ri-history-line text-white text-lg w-5 h-5 flex items-center justify-center"></i>
                </div>
                <h2 className="text-lg font-bold text-gray-900">Previous Journals</h2>
              </div>
              
              <div className="space-y-3 max-h-96 overflow-y-auto">
                {history.length === 0 ? (
                  <p className="text-sm text-gray-500 text-center py-8">No previous entries yet</p>
                ) : (
                  history.map((entry, idx) => {
                    const isSelected = selectedWriting === entry.writing;
                    const hasAnalysis = isSelected && analysis !== null && analysis !== "Analyzing...";
                    const isExpanded = expandedIndex === idx;

                    return (
                      <div
                        key={idx}
                        className={`p-4 border rounded-xl transition-all duration-200 cursor-pointer ${
                          isSelected 
                            ? "border-green-300 bg-green-50 shadow-md" 
                            : "border-gray-200 bg-gray-50 hover:border-blue-300 hover:shadow-sm"
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
                            onClick={(e) => {
                              e.stopPropagation();
                              setExpandedIndex(isExpanded ? null : idx);
                            }}
                            className="text-xs text-blue-600 hover:text-blue-700 font-medium whitespace-nowrap cursor-pointer"
                          >
                            {isExpanded ? "Show Less" : "Read More"}
                          </button>

                          {!isSelected ? (
                            <button
                              onClick={() => {
                                setSelectedWriting(entry.writing);
                                setAnalysis(null);
                              }}
                              className="text-xs text-green-600 hover:text-green-700 font-medium whitespace-nowrap cursor-pointer"
                            >
                              Select to Analyze
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
                                    setSelectedWriting(null);
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

          {/* Center - Journal Form */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-8">
              <div className="text-center mb-8">
                <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-500 rounded-2xl flex items-center justify-center mb-4 mx-auto">
                  <i className="ri-book-line text-white text-2xl w-8 h-8 flex items-center justify-center"></i>
                </div>
                <h1 className="text-2xl font-bold text-gray-900 mb-2">Daily Journal</h1>
                <p className="text-gray-600">Express your thoughts and reflections</p>
              </div>

              {submittedToday ? (
                <div className="text-center py-12">
                  <div className="w-20 h-20 bg-gradient-to-br from-green-400 to-green-500 rounded-full flex items-center justify-center mb-6 mx-auto">
                    <i className="ri-check-line text-white text-3xl w-10 h-10 flex items-center justify-center"></i>
                  </div>
                  <h3 className="text-xl font-bold text-green-700 mb-2">Well done!</h3>
                  <p className="text-green-600 font-medium">You`ve already submitted your journal for today.</p>
                  <p className="text-gray-500 text-sm mt-2">Take some time to reflect on your entries!</p>
                </div>
              ) : (
                <Form {...form}>
                  <form
                    onSubmit={form.handleSubmit(handleSubmit)}
                    className="space-y-6"
                  >
                    <FormField
                      control={form.control}
                      name="username"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-base font-semibold text-gray-800 flex items-center">
                            <i className="ri-edit-line mr-2 text-blue-500 w-5 h-5 flex items-center justify-center"></i>
                            Write about your day
                          </FormLabel>
                          <FormControl>
                            <Textarea
                              placeholder="Share your feelings, thoughts, and reflections... What made you happy today? What challenges did you face? How are you feeling right now?"
                              className="h-64 resize-none border-2 border-gray-200 rounded-xl px-4 py-4 text-base leading-relaxed focus:border-blue-400 focus:ring-2 focus:ring-blue-100 transition-all duration-200"
                              {...field}
                            />
                          </FormControl>
                          <FormDescription className="text-sm text-gray-500 flex items-center">
                            <i className="ri-lock-line mr-1 w-4 h-4 flex items-center justify-center"></i>
                            Your journal entries are stored securely and privately.
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <div className="text-center pt-4 border-t border-gray-200">
                      <button
                        type="submit"
                        className="bg-gradient-to-r from-blue-500 to-purple-500 text-white px-8 py-3 rounded-xl font-semibold hover:shadow-lg transform hover:scale-105 transition-all duration-200 whitespace-nowrap cursor-pointer"
                      >
                        <i className="ri-save-line mr-2 w-5 h-5 flex items-center justify-center"></i>
                        That`s all for today!
                      </button>
                    </div>
                  </form>
                </Form>
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
                <h2 className="text-lg font-bold text-gray-900">AI Analysis</h2>
              </div>

              {selectedWriting ? (
                <div className="space-y-4">
                  <div>
                    <p className="text-sm font-medium text-gray-700 mb-2">Selected Entry:</p>
                    <div className="p-3 bg-gradient-to-br from-gray-50 to-gray-100 rounded-lg border border-gray-200 max-h-32 overflow-y-auto">
                      <p className="text-sm text-gray-700 leading-relaxed">{selectedWriting}</p>
                    </div>
                  </div>

                  <div>
                    <p className="text-sm font-medium text-gray-700 mb-2">AI Insights:</p>
                    <div className="p-4 bg-gradient-to-br from-amber-50 to-yellow-50 rounded-lg border border-amber-200 min-h-24">
                      {analysis === "Analyzing..." ? (
                        <div className="flex items-center space-x-2">
                          <i className="ri-loader-4-line animate-spin text-amber-600 w-4 h-4 flex items-center justify-center"></i>
                          <p className="text-sm text-amber-700 font-medium">Analyzing your journal...</p>
                        </div>
                      ) : (
                        <p className="text-sm text-gray-800 whitespace-pre-wrap leading-relaxed">
                          {analysis || "Click 'Analyze with AI' to get personalized insights about your thoughts and emotions."}
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
                    Select a journal entry from your history to get AI-powered emotional insights and personalized feedback.
                  </p>
                </div>
              )}
            </div>

            {/* Writing Tips */}
            <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6 mt-6">
              <div className="flex items-center mb-4">
                <div className="w-8 h-8 bg-gradient-to-br from-yellow-400 to-orange-400 rounded-lg flex items-center justify-center mr-2">
                  <i className="ri-lightbulb-line text-white text-sm w-4 h-4 flex items-center justify-center"></i>
                </div>
                <h3 className="text-base font-bold text-gray-900">Writing Tips</h3>
              </div>
              
              <div className="space-y-2 text-xs text-gray-600">
                <p>• Write for at least 5 minutes without stopping</p>
                <p>• Focus on your feelings and thoughts</p>
                <p>• Be honest and authentic with yourself</p>
                <p>• Dont worry about grammar or spelling</p>
                <p>• Try to write at the same time each day</p>
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
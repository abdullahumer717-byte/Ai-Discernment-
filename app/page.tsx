"use client";

import React, { useState, useEffect } from 'react';
import { 
  Award, 
  BookOpen, 
  CheckCircle, 
  ChevronRight, 
  Compass, 
  Cpu, 
  Edit3, 
  HelpCircle, 
  Info, 
  Layers, 
  Lightbulb, 
  MessageSquare, 
  Play, 
  Plus, 
  RefreshCw, 
  Save, 
  Sparkles, 
  Star, 
  Target, 
  ThumbsUp, 
  TrendingUp, 
  UserCheck, 
  Zap,
  ArrowRight,
  Eye,
  FileText
} from 'lucide-react';

interface Explanation {
  key: string;
  title: string;
  text: string;
  profile: string;
  profileName: string;
  profileDescription: string;
}

interface RefinedResult {
  refinedExplanation: string;
  changeSummary: Array<{
    category: string;
    description: string;
  }>;
}

interface LoopAdherence {
  productAdherence: string;
  processAdherence: string;
  performanceAdherence: string;
}

interface LoopOutput {
  taskOutput: string;
  adherenceAnalysis: LoopAdherence;
}

interface RefinedLoopOutput {
  refinedOutput: string;
  refinementNotes: {
    productChanges: string;
    processChanges: string;
    performanceChanges: string;
  };
}

interface Iteration {
  version: number;
  output: string;
  productChanges?: string;
  processChanges?: string;
  performanceChanges?: string;
  ratings?: {
    product: number;
    process: number;
    performance: number;
  };
  critique?: string;
}

export default function Home() {
  const [activeTab, setActiveTab] = useState<'expertise' | 'project' | 'workbook'>('expertise');

  // --- LOCAL PERSISTENCE ---
  const [savedReflections, setSavedReflections] = useState(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('ai_discernment_reflections');
      if (saved) {
        try {
          return JSON.parse(saved);
        } catch (e) {
          console.error(e);
        }
      }
    }
    return {
      mostChallenging: '',
      complementDescription: '',
      scrutinySignals: '',
      generalNotes: ''
    };
  });

  const saveReflections = (updated: typeof savedReflections) => {
    setSavedReflections(updated);
    localStorage.setItem('ai_discernment_reflections', JSON.stringify(updated));
  };

  // --- MODULE 1: DOMAIN EXPERTISE STATE ---
  const [expertDomain, setExpertDomain] = useState('Large Format Film Photography');
  const [expertAspect, setExpertAspect] = useState('Controlling Depth of Field using Tilt-Shift Lens Movements');
  
  const [isGeneratingExplanations, setIsGeneratingExplanations] = useState(false);
  const [explanations, setExplanations] = useState<Explanation[]>([]);
  const [shuffledExplanations, setShuffledExplanations] = useState<Explanation[]>([]);
  const [revealed, setRevealed] = useState(false);
  
  // Quiz states
  const [userGuesses, setUserGuesses] = useState<Record<string, string>>({}); // index -> profile
  const [bestExplanationKey, setBestExplanationKey] = useState<string>('');
  const [worstExplanationKey, setWorstExplanationKey] = useState<string>('');
  const [expertFeedback, setExpertFeedback] = useState('');
  
  // Refinement states
  const [isRefining, setIsRefining] = useState(false);
  const [refinedResult, setRefinedResult] = useState<RefinedResult | null>(null);

  // Shuffles explanations so order is random for the blind test
  const startDomainWorkout = async () => {
    if (!expertDomain.trim() || !expertAspect.trim()) return;
    setIsGeneratingExplanations(true);
    setRevealed(false);
    setRefinedResult(null);
    setUserGuesses({});
    setBestExplanationKey('');
    setWorstExplanationKey('');
    setExpertFeedback('');
    
    try {
      const res = await fetch('/api/gemini/explanations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ domain: expertDomain, aspect: expertAspect })
      });
      const data = await res.json();
      if (data.explanations) {
        setExplanations(data.explanations);
        // Shuffle for the blind test
        const shuffled = [...data.explanations].sort(() => Math.random() - 0.5);
        setShuffledExplanations(shuffled);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsGeneratingExplanations(false);
    }
  };

  const handleRefineExpertExplanation = async () => {
    const chosenText = explanations.find(e => e.key === worstExplanationKey)?.text || explanations[0]?.text;
    if (!chosenText || !expertFeedback.trim()) return;

    setIsRefining(true);
    try {
      const res = await fetch('/api/gemini/refine', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          domain: expertDomain,
          aspect: expertAspect,
          chosenExplanationText: chosenText,
          critique: expertFeedback
        })
      });
      const data = await res.json();
      if (data.refinedExplanation) {
        setRefinedResult(data);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsRefining(false);
    }
  };


  // --- MODULE 2: DESCRIPTION-DISCERNMENT LOOP STATE ---
  const [taskGoal, setTaskGoal] = useState('Create a step-by-step troubleshooting guide for a sourdough bread that fails to rise.');
  const [productDesc, setProductDesc] = useState('A highly readable, structured Markdown guide of about 250 words. Use distinct bold subheadings, bullet lists for action steps, and include a final key summary box.');
  const [processDesc, setProcessDesc] = useState('Analyze root causes from the perspective of micro-biology (yeast health vs enzyme activity). Apply the 5-Whys framework to uncover starter health issues.');
  const [performanceDesc, setPerformanceDesc] = useState('Act as an analytical, expert bread scientist. Avoid fluffy marketing intros. Present information with technical gravity, using professional baking terms like autolyse, hydration, and ambient proofing.');

  const [isGeneratingLoop, setIsGeneratingLoop] = useState(false);
  const [loopIterations, setLoopIterations] = useState<Iteration[]>([]);
  const [currentRating, setCurrentRating] = useState({ product: 8, process: 8, performance: 8 });
  const [loopFeedback, setLoopFeedback] = useState('');
  const [isLoopRefining, setIsLoopRefining] = useState(false);

  const startLoopPlayground = async () => {
    if (!taskGoal.trim()) return;
    setIsGeneratingLoop(true);
    setLoopIterations([]);
    setLoopFeedback('');
    
    try {
      const res = await fetch('/api/gemini/describe-loop', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ taskGoal, productDesc, processDesc, performanceDesc })
      });
      const data = await res.json();
      if (data.taskOutput) {
        setLoopIterations([
          {
            version: 1,
            output: data.taskOutput,
            productChanges: data.adherenceAnalysis?.productAdherence,
            processChanges: data.adherenceAnalysis?.processAdherence,
            performanceChanges: data.adherenceAnalysis?.performanceAdherence,
          }
        ]);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsGeneratingLoop(false);
    }
  };

  const handleRefineLoop = async () => {
    if (loopIterations.length === 0 || !loopFeedback.trim()) return;
    setIsLoopRefining(true);

    const latestIteration = loopIterations[loopIterations.length - 1];
    
    try {
      const res = await fetch('/api/gemini/describe-loop-refine', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          taskGoal,
          productDesc,
          processDesc,
          performanceDesc,
          previousOutput: latestIteration.output,
          feedback: loopFeedback,
          iterationCount: loopIterations.length + 1
        })
      });
      const data = await res.json();
      if (data.refinedOutput) {
        // Save ratings & feedback on previous iteration
        const updatedIterations = [...loopIterations];
        updatedIterations[updatedIterations.length - 1] = {
          ...latestIteration,
          ratings: { ...currentRating },
          critique: loopFeedback
        };

        setLoopIterations([
          ...updatedIterations,
          {
            version: updatedIterations.length + 1,
            output: data.refinedOutput,
            productChanges: data.refinementNotes?.productChanges,
            processChanges: data.refinementNotes?.processChanges,
            performanceChanges: data.refinementNotes?.performanceChanges,
          }
        ]);
        
        // Reset critique & default sliders
        setLoopFeedback('');
        setCurrentRating({ product: 8, process: 8, performance: 8 });
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsLoopRefining(false);
    }
  };


  // --- PRESET SELECTION HANDLERS ---
  const applyPreset = (domain: string, aspect: string) => {
    setExpertDomain(domain);
    setExpertAspect(aspect);
  };

  const applyLoopPreset = (goal: string, prod: string, proc: string, perf: string) => {
    setTaskGoal(goal);
    setProductDesc(prod);
    setProcessDesc(proc);
    setPerformanceDesc(perf);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 lg:px-8 font-sans">
      
      {/* HEADER SECTION */}
      <header className="mb-10 text-center md:text-left border-b border-[#EBEAE6] pb-8 animate-fade-in-up">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-emerald-50 text-emerald-700 text-xs font-semibold rounded-full border border-emerald-100 mb-3">
              <Sparkles className="w-3.5 h-3.5" />
              Capstone Training Studio
            </div>
            <h1 className="text-4xl font-bold font-display tracking-tight text-[#0F172A]">
              AI Discernment Coach
            </h1>
            <p className="text-sm md:text-base text-gray-600 mt-2 max-w-3xl">
              Become an elite prompt engineer by mastering multi-dimensional evaluation. Practice spotting subtle AI gaps using your domain expertise, and design perfect instruction-feedback loops.
            </p>
          </div>
          
          <div className="flex items-center gap-2 self-center md:self-end bg-white p-1.5 border border-[#E1E0DA] rounded-xl shadow-xs">
            <button
              onClick={() => setActiveTab('expertise')}
              className={`px-4 py-2 text-xs font-medium rounded-lg transition-all ${
                activeTab === 'expertise'
                  ? 'bg-[#0F172A] text-white shadow-sm'
                  : 'text-gray-600 hover:text-[#0F172A] hover:bg-gray-50'
              }`}
            >
              1. Expertise Workout
            </button>
            <button
              onClick={() => setActiveTab('project')}
              className={`px-4 py-2 text-xs font-medium rounded-lg transition-all ${
                activeTab === 'project'
                  ? 'bg-[#0F172A] text-white shadow-sm'
                  : 'text-gray-600 hover:text-[#0F172A] hover:bg-gray-50'
              }`}
            >
              2. Loop Playground
            </button>
            <button
              onClick={() => setActiveTab('workbook')}
              className={`px-4 py-2 text-xs font-medium rounded-lg transition-all ${
                activeTab === 'workbook'
                  ? 'bg-[#0F172A] text-white shadow-sm'
                  : 'text-gray-600 hover:text-[#0F172A] hover:bg-gray-50'
              }`}
            >
              3. Reflection Journal
            </button>
          </div>
        </div>
      </header>

      {/* MAIN CONTAINER */}
      <main className="grid grid-cols-1 gap-8 animate-fade-in-up">

        {/* ========================================================================= */}
        {/* MODULE 1: DOMAIN EXPERTISE WORKOUT */}
        {/* ========================================================================= */}
        {activeTab === 'expertise' && (
          <div className="space-y-8">
            <div className="bg-white rounded-2xl border border-[#E1E0DA] p-6 shadow-xs">
              <div className="flex items-start gap-4 mb-6">
                <div className="p-3 bg-emerald-50 text-emerald-700 rounded-xl">
                  <Compass className="w-6 h-6" />
                </div>
                <div>
                  <h2 className="text-xl font-bold font-display text-[#0F172A]">
                    Domain Expertise Workout
                  </h2>
                  <p className="text-xs text-gray-500 mt-1">
                    Spot AI over-generalization, academic density, and narrative hallucinations. Train your expert eye to inspect AI accuracy (Product), structure (Process), and tone (Performance).
                  </p>
                </div>
              </div>

              {/* Preset selectors to help user start instantly */}
              <div className="mb-6">
                <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">
                  Quick-Start Expertise Presets
                </p>
                <div className="flex flex-wrap gap-2">
                  <button 
                    onClick={() => applyPreset("Large Format Photography", "Controlling depth of field using tilt-shift bellows movements")}
                    className="px-3 py-1.5 text-xs bg-gray-50 hover:bg-gray-100 border border-gray-200 rounded-lg text-gray-700 font-medium transition-all"
                  >
                    📷 Photography bellows
                  </button>
                  <button 
                    onClick={() => applyPreset("Culinary Arts", "The chemistry of sourdough wild yeast vs. lactobacilli in long fermentation")}
                    className="px-3 py-1.5 text-xs bg-gray-50 hover:bg-gray-100 border border-gray-200 rounded-lg text-gray-700 font-medium transition-all"
                  >
                    🍞 Sourdough chemistry
                  </button>
                  <button 
                    onClick={() => applyPreset("Byzantine Military History", "Comparing defensive strategies during the Arab-Byzantine wars (Battle of Yarmouk)")}
                    className="px-3 py-1.5 text-xs bg-gray-50 hover:bg-gray-100 border border-gray-200 rounded-lg text-gray-700 font-medium transition-all"
                  >
                    ⚔️ Byzantine defense
                  </button>
                  <button 
                    onClick={() => applyPreset("React & Web Performance", "Analyzing hydration mismatches & server-component boundary rendering optimization")}
                    className="px-3 py-1.5 text-xs bg-gray-50 hover:bg-gray-100 border border-gray-200 rounded-lg text-gray-700 font-medium transition-all"
                  >
                    ⚛️ Hydration boundaries
                  </button>
                </div>
              </div>

              {/* Form input */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1">
                    Your Expert Domain
                  </label>
                  <input 
                    type="text" 
                    value={expertDomain}
                    onChange={(e) => setExpertDomain(e.target.value)}
                    placeholder="e.g. Classic Coffee Roasting, Haskell Programming"
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1">
                    Specific Technical Aspect / Topic
                  </label>
                  <input 
                    type="text" 
                    value={expertAspect}
                    onChange={(e) => setExpertAspect(e.target.value)}
                    placeholder="e.g. First crack roasting chemistry, Monad transformer safety"
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 text-sm"
                  />
                </div>
              </div>

              <div className="mt-6 flex justify-end">
                <button
                  onClick={startDomainWorkout}
                  disabled={isGeneratingExplanations}
                  className="flex items-center gap-2 px-6 py-3 bg-[#0F172A] hover:bg-emerald-600 active:bg-emerald-700 text-white font-medium rounded-xl transition-all shadow-sm disabled:opacity-50 text-sm"
                >
                  {isGeneratingExplanations ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin" />
                      Generating 3 Explanations...
                    </>
                  ) : (
                    <>
                      <Cpu className="w-4 h-4" />
                      Generate Explanation Blind-Test
                    </>
                  )}
                </button>
              </div>
            </div>

            {/* EXPLANATIONS LIST */}
            {shuffledExplanations.length > 0 && (
              <div className="space-y-8">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-bold font-display text-[#0F172A] flex items-center gap-2">
                    <Layers className="w-5 h-5 text-emerald-600" />
                    The Blind Evaluation Deck
                  </h3>
                  <span className="text-xs text-gray-500 bg-gray-100 border border-gray-200 px-3 py-1 rounded-full">
                    3 distinct hidden profiles generated. Inspect them closely!
                  </span>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  {shuffledExplanations.map((item, idx) => (
                    <div 
                      key={idx} 
                      className="bg-white rounded-2xl border border-[#E1E0DA] flex flex-col h-full overflow-hidden shadow-xs hover:border-gray-400 transition-all"
                    >
                      <div className="px-5 py-4 bg-gray-50 border-b border-[#E1E0DA] flex items-center justify-between">
                        <span className="text-xs font-semibold text-[#0F172A] uppercase tracking-wider bg-white border border-gray-200 px-3 py-1 rounded-lg">
                          Explanation Option {idx + 1}
                        </span>
                        {revealed && (
                          <span className={`text-xs px-2.5 py-1 rounded-full font-semibold ${
                            item.profile === 'rigid_academic' 
                              ? 'bg-amber-100 text-amber-800' 
                              : item.profile === 'over_generalizer' 
                                ? 'bg-indigo-100 text-indigo-800' 
                                : 'bg-rose-100 text-rose-800'
                          }`}>
                            {item.profileName}
                          </span>
                        )}
                      </div>

                      <div className="p-6 flex-1 flex flex-col justify-between">
                        <div className="prose prose-sm text-gray-700 leading-relaxed mb-6 whitespace-pre-wrap">
                          <h4 className="text-md font-bold text-gray-900 mb-2">{item.title}</h4>
                          {item.text}
                        </div>

                        {/* Blind Quiz Interactive fields */}
                        <div className="border-t border-gray-100 pt-4 mt-auto">
                          <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-2">
                            Which Persona Profile is this?
                          </label>
                          <select 
                            value={userGuesses[idx] || ''}
                            onChange={(e) => setUserGuesses({ ...userGuesses, [idx]: e.target.value })}
                            disabled={revealed}
                            className="w-full text-xs px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-emerald-500/50 focus:border-emerald-500 text-gray-700"
                          >
                            <option value="">-- Choose Profile Guess --</option>
                            <option value="over_generalizer">Slick Over-Generalizer (Subtle Omission)</option>
                            <option value="rigid_academic">Rigid Academic (Dry, Dense but Flawless)</option>
                            <option value="analogous_hallucinator">Creative Storyteller (Engaging with 1 Hallucination)</option>
                          </select>
                        </div>
                      </div>

                      {/* Revealed Profile Details */}
                      {revealed && (
                        <div className="p-5 bg-emerald-50/50 border-t border-[#E1E0DA]">
                          <p className="text-xs font-bold text-emerald-800 flex items-center gap-1.5 mb-2">
                            <Info className="w-3.5 h-3.5" />
                            Why this was written this way:
                          </p>
                          <p className="text-xs text-gray-600 leading-relaxed">
                            {item.profileDescription}
                          </p>
                          <div className="mt-3 flex items-center gap-2">
                            {userGuesses[idx] === item.profile ? (
                              <span className="text-[10px] bg-emerald-100 text-emerald-800 font-semibold px-2 py-0.5 rounded-full flex items-center gap-1">
                                <CheckCircle className="w-2.5 h-2.5" /> Correct Profile Guess!
                              </span>
                            ) : (
                              <span className="text-[10px] bg-red-50 text-red-700 font-semibold px-2 py-0.5 rounded-full">
                                Guess: {userGuesses[idx] ? 'Mismatched' : 'None entered'}
                              </span>
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>

                {/* DISCERNMENT EVAL PANEL */}
                <div className="bg-white rounded-2xl border border-[#E1E0DA] p-6 shadow-xs">
                  <h3 className="text-md font-bold text-[#0F172A] flex items-center gap-2 mb-4">
                    <UserCheck className="w-5 h-5 text-emerald-600" />
                    Expert Discernment Evaluation
                  </h3>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Comparative Questions */}
                    <div className="space-y-4">
                      <div>
                        <label className="block text-xs font-semibold text-gray-700 mb-1">
                          1. Product Discernment: Which is the most accurate & detailed explanation?
                        </label>
                        <select 
                          value={bestExplanationKey}
                          onChange={(e) => setBestExplanationKey(e.target.value)}
                          disabled={revealed}
                          className="w-full text-xs px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-emerald-500/50 focus:border-emerald-500 text-gray-700"
                        >
                          <option value="">-- Select Option --</option>
                          {shuffledExplanations.map((item, idx) => (
                            <option key={idx} value={item.key}>Explanation Option {idx + 1}</option>
                          ))}
                        </select>
                      </div>

                      <div>
                        <label className="block text-xs font-semibold text-gray-700 mb-1">
                          2. Performance Discernment: Which has the weakest clarity or style?
                        </label>
                        <select 
                          value={worstExplanationKey}
                          onChange={(e) => setWorstExplanationKey(e.target.value)}
                          disabled={revealed}
                          className="w-full text-xs px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-emerald-500/50 focus:border-emerald-500 text-gray-700"
                        >
                          <option value="">-- Select Option --</option>
                          {shuffledExplanations.map((item, idx) => (
                            <option key={idx} value={item.key}>Explanation Option {idx + 1}</option>
                          ))}
                        </select>
                      </div>

                      <div className="pt-2">
                        {!revealed ? (
                          <button
                            onClick={() => setRevealed(true)}
                            className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-[#0F172A] hover:bg-emerald-600 text-white text-xs font-semibold rounded-lg transition-all"
                          >
                            <Eye className="w-3.5 h-3.5" /> Reveal Profiles & Check My Discernment
                          </button>
                        ) : (
                          <div className="p-3 bg-blue-50 border border-blue-100 rounded-xl">
                            <p className="text-[11px] text-blue-800 font-semibold mb-1">
                              Expert Insight Key:
                            </p>
                            <ul className="text-[10px] text-gray-600 space-y-1 list-disc list-inside">
                              <li><strong>Slick Over-Generalizer (A)</strong>: Skips essential technical boundary conditions or rules.</li>
                              <li><strong>Rigid Academic (B)</strong>: 100% accurate product, but horrible performance/readability.</li>
                              <li><strong>Creative Storyteller (C)</strong>: Highly engaging but contains a hallucination or incorrect analogy.</li>
                            </ul>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Step 4: Refinement and Correction */}
                    <div className="space-y-4">
                      <div>
                        <label className="block text-xs font-semibold text-gray-700 mb-1.5 flex items-center justify-between">
                          <span>3. Synthesizing Refinement Feedback</span>
                          <span className="text-[10px] text-emerald-600 font-bold uppercase">Human Contribution</span>
                        </label>
                        <textarea
                          rows={4}
                          value={expertFeedback}
                          onChange={(e) => setExpertFeedback(e.target.value)}
                          placeholder="Point out the specific hallucination in the story, supply the missing constraint for the generalizer, and request the academic's content rendered into clear, beautiful copy..."
                          className="w-full text-xs p-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 text-gray-700"
                        />
                      </div>

                      <button
                        onClick={handleRefineExpertExplanation}
                        disabled={isRefining || !expertFeedback.trim()}
                        className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold rounded-lg transition-all disabled:opacity-50"
                      >
                        {isRefining ? (
                          <>
                            <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                            Co-creating Perfect Version...
                          </>
                        ) : (
                          <>
                            <Zap className="w-3.5 h-3.5" />
                            Synthesize & Generate Refined Explanation
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                </div>

                {/* THE PRISTINE CO-CREATED EXPLANATION */}
                {refinedResult && (
                  <div className="bg-[#0F172A] text-white rounded-2xl p-6 shadow-md border border-emerald-500/20 animate-fade-in-up">
                    <div className="flex items-center justify-between border-b border-gray-800 pb-4 mb-6">
                      <div className="flex items-center gap-2">
                        <div className="p-2 bg-emerald-500/20 text-emerald-400 rounded-lg">
                          <CheckCircle className="w-5 h-5" />
                        </div>
                        <div>
                          <h4 className="text-md font-bold text-white">
                            Pristine Refined Output
                          </h4>
                          <p className="text-[11px] text-gray-400 mt-0.5">
                            Co-created by combining AI computational power with human expertise.
                          </p>
                        </div>
                      </div>
                      <span className="text-[10px] uppercase font-bold tracking-wider px-2.5 py-1 bg-emerald-500/10 text-emerald-400 border border-emerald-500/25 rounded-md">
                        Ground Truth Perfected
                      </span>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
                      {/* Left: Explanation */}
                      <div className="lg:col-span-3 bg-gray-900 border border-gray-800 rounded-xl p-5 text-gray-200 leading-relaxed text-sm whitespace-pre-wrap">
                        {refinedResult.refinedExplanation}
                      </div>

                      {/* Right: Change summary */}
                      <div className="lg:col-span-2 space-y-4">
                        <h5 className="text-xs font-bold text-gray-400 uppercase tracking-wider">
                          Applied Refinement Summary
                        </h5>
                        <div className="space-y-3">
                          {refinedResult.changeSummary.map((item, index) => (
                            <div key={index} className="p-3 bg-gray-900 border border-gray-800 rounded-xl">
                              <span className={`text-[9px] font-bold uppercase px-2 py-0.5 rounded-full ${
                                item.category.toLowerCase().includes('product')
                                  ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                                  : item.category.toLowerCase().includes('process')
                                    ? 'bg-indigo-500/10 text-indigo-400 border border-indigo-500/20'
                                    : 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                              }`}>
                                {item.category}
                              </span>
                              <p className="text-xs text-gray-300 mt-2 leading-relaxed">
                                {item.description}
                              </p>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                )}

              </div>
            )}
          </div>
        )}


        {/* ========================================================================= */}
        {/* MODULE 2: DESCRIPTION-DISCERNMENT LOOP PLAYGROUND */}
        {/* ========================================================================= */}
        {activeTab === 'project' && (
          <div className="space-y-8">
            <div className="bg-white rounded-2xl border border-[#E1E0DA] p-6 shadow-xs">
              <div className="flex items-start gap-4 mb-6">
                <div className="p-3 bg-indigo-50 text-indigo-700 rounded-xl">
                  <Layers className="w-6 h-6" />
                </div>
                <div>
                  <h2 className="text-xl font-bold font-display text-[#0F172A]">
                    Description-Discernment Loop Playground
                  </h2>
                  <p className="text-xs text-gray-500 mt-1">
                    Practice designing detailed Description inputs (Product, Process, Performance) and executing incremental adjustment loops based on structural feedback.
                  </p>
                </div>
              </div>

              {/* Presets */}
              <div className="mb-6">
                <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">
                  Instruction Presets
                </p>
                <div className="flex flex-wrap gap-2">
                  <button 
                    onClick={() => applyLoopPreset(
                      "Draft a standard project proposal for a community vegetable garden.",
                      "A neat, 200-word executive brief. Use a markdown list for resources needed, and add a final risk-mitigation chart mockup.",
                      "Employ a cost-benefit methodology. Outline social return on investment (SROI) and analyze from least-impact to highest-impact risks.",
                      "Be highly encouraging but strictly professional. Speak as a civic planner. Use supportive collaboration markers but do not use informal exclamation marks."
                    )}
                    className="px-3 py-1.5 text-xs bg-gray-50 hover:bg-gray-100 border border-gray-200 rounded-lg text-gray-700 font-medium transition-all"
                  >
                    🌱 Community garden proposal
                  </button>
                  <button 
                    onClick={() => applyLoopPreset(
                      "Explain to an early-career engineer how to debug a slow database query.",
                      "A dense bulleted guide with clear SQL examples (using EXPLAIN and indexed scans). Keep it under 300 words.",
                      "Apply a diagnostic system hierarchy starting with the network latency down to index structural scans.",
                      "Assume the role of a supportive, veteran principal engineer mentoring an eager junior colleague. Use warm yet rigorous language."
                    )}
                    className="px-3 py-1.5 text-xs bg-gray-50 hover:bg-gray-100 border border-gray-200 rounded-lg text-gray-700 font-medium transition-all"
                  >
                    🗄️ Slow database mentoring
                  </button>
                </div>
              </div>

              {/* Task Inputs */}
              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1">
                    Your Task Goal (What are we executing?)
                  </label>
                  <input 
                    type="text" 
                    value={taskGoal}
                    onChange={(e) => setTaskGoal(e.target.value)}
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 text-sm"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1 flex items-center justify-between">
                      <span>1. Product Description</span>
                      <span className="text-[10px] text-gray-400 normal-case">Format, length, layout</span>
                    </label>
                    <textarea 
                      rows={4}
                      value={productDesc}
                      onChange={(e) => setProductDesc(e.target.value)}
                      className="w-full text-xs p-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 text-gray-700"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1 flex items-center justify-between">
                      <span>2. Process Description</span>
                      <span className="text-[10px] text-gray-400 normal-case">Methods, frameworks, logic</span>
                    </label>
                    <textarea 
                      rows={4}
                      value={processDesc}
                      onChange={(e) => setProcessDesc(e.target.value)}
                      className="w-full text-xs p-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 text-gray-700"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1 flex items-center justify-between">
                      <span>3. Performance Description</span>
                      <span className="text-[10px] text-gray-400 normal-case">Tone, posture, collaboration</span>
                    </label>
                    <textarea 
                      rows={4}
                      value={performanceDesc}
                      onChange={(e) => setPerformanceDesc(e.target.value)}
                      className="w-full text-xs p-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 text-gray-700"
                    />
                  </div>
                </div>
              </div>

              <div className="mt-6 flex justify-end">
                <button
                  onClick={startLoopPlayground}
                  disabled={isGeneratingLoop}
                  className="flex items-center gap-2 px-6 py-3 bg-[#0F172A] hover:bg-indigo-600 text-white font-medium rounded-xl transition-all shadow-sm disabled:opacity-50 text-sm"
                >
                  {isGeneratingLoop ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin" />
                      Initiating Output Loop...
                    </>
                  ) : (
                    <>
                      <Play className="w-4 h-4" />
                      Generate Initial Draft (V1)
                    </>
                  )}
                </button>
              </div>
            </div>

            {/* LOOP PROGRESSION DISPLAY */}
            {loopIterations.length > 0 && (
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                
                {/* Left Side: Iteration Output Tab-View */}
                <div className="lg:col-span-8 space-y-6">
                  <div className="bg-white rounded-2xl border border-[#E1E0DA] overflow-hidden shadow-xs">
                    
                    {/* Iteration Tabs */}
                    <div className="flex border-b border-[#E1E0DA] bg-gray-50 px-4">
                      {loopIterations.map((iter, idx) => (
                        <button
                          key={idx}
                          className={`px-4 py-3 text-xs font-semibold border-b-2 transition-all flex items-center gap-2 ${
                            idx === loopIterations.length - 1
                              ? 'border-[#0F172A] text-[#0F172A]'
                              : 'border-transparent text-gray-500 hover:text-[#0F172A]'
                          }`}
                        >
                          <FileText className="w-3.5 h-3.5" />
                          Iteration {iter.version} (Active)
                        </button>
                      ))}
                    </div>

                    {/* Active Output */}
                    <div className="p-6">
                      <div className="prose prose-sm text-gray-800 leading-relaxed whitespace-pre-wrap bg-gray-50 border border-gray-100 rounded-xl p-5 mb-6">
                        {loopIterations[loopIterations.length - 1].output}
                      </div>

                      {/* Adherence Check */}
                      <div className="border-t border-gray-100 pt-4">
                        <h4 className="text-xs font-bold text-[#0F172A] mb-3 flex items-center gap-1.5">
                          <CheckCircle className="w-4 h-4 text-emerald-600" />
                          AI Execution Reflection
                        </h4>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                          <div className="p-3 bg-emerald-50/50 rounded-xl border border-emerald-100/50">
                            <span className="text-[10px] font-bold text-emerald-800 uppercase tracking-wider block mb-1">Product Integration</span>
                            <p className="text-[11px] text-gray-600 leading-relaxed">
                              {loopIterations[loopIterations.length - 1].productChanges}
                            </p>
                          </div>
                          <div className="p-3 bg-indigo-50/50 rounded-xl border border-indigo-100/50">
                            <span className="text-[10px] font-bold text-indigo-800 uppercase tracking-wider block mb-1">Process Integration</span>
                            <p className="text-[11px] text-gray-600 leading-relaxed">
                              {loopIterations[loopIterations.length - 1].processChanges}
                            </p>
                          </div>
                          <div className="p-3 bg-amber-50/50 rounded-xl border border-amber-100/50">
                            <span className="text-[10px] font-bold text-amber-800 uppercase tracking-wider block mb-1">Performance Integration</span>
                            <p className="text-[11px] text-gray-600 leading-relaxed">
                              {loopIterations[loopIterations.length - 1].performanceChanges}
                            </p>
                          </div>
                        </div>
                      </div>

                    </div>
                  </div>
                </div>

                {/* Right Side: Discernment Evaluation & Next Loop Step */}
                <div className="lg:col-span-4 space-y-6">
                  <div className="bg-white rounded-2xl border border-[#E1E0DA] p-6 shadow-xs">
                    <h3 className="text-sm font-bold text-[#0F172A] flex items-center gap-2 mb-4">
                      <TrendingUp className="w-4 h-4 text-indigo-600" />
                      Discernment Ratings (V{loopIterations.length})
                    </h3>

                    {/* Sliders */}
                    <div className="space-y-4 mb-6">
                      <div>
                        <div className="flex justify-between text-xs font-semibold text-gray-600 mb-1">
                          <span>Product Quality (Format/Detail)</span>
                          <span className="text-indigo-600 font-bold">{currentRating.product}/10</span>
                        </div>
                        <input 
                          type="range" min="1" max="10" 
                          value={currentRating.product}
                          onChange={(e) => setCurrentRating({ ...currentRating, product: parseInt(e.target.value) })}
                          className="w-full h-1.5 bg-gray-100 rounded-lg appearance-none cursor-pointer accent-indigo-600"
                        />
                      </div>

                      <div>
                        <div className="flex justify-between text-xs font-semibold text-gray-600 mb-1">
                          <span>Process Quality (Reasoning/Logic)</span>
                          <span className="text-indigo-600 font-bold">{currentRating.process}/10</span>
                        </div>
                        <input 
                          type="range" min="1" max="10" 
                          value={currentRating.process}
                          onChange={(e) => setCurrentRating({ ...currentRating, process: parseInt(e.target.value) })}
                          className="w-full h-1.5 bg-gray-100 rounded-lg appearance-none cursor-pointer accent-indigo-600"
                        />
                      </div>

                      <div>
                        <div className="flex justify-between text-xs font-semibold text-gray-600 mb-1">
                          <span>Performance Quality (Tone/Style)</span>
                          <span className="text-indigo-600 font-bold">{currentRating.performance}/10</span>
                        </div>
                        <input 
                          type="range" min="1" max="10" 
                          value={currentRating.performance}
                          onChange={(e) => setCurrentRating({ ...currentRating, performance: parseInt(e.target.value) })}
                          className="w-full h-1.5 bg-gray-100 rounded-lg appearance-none cursor-pointer accent-indigo-600"
                        />
                      </div>
                    </div>

                    {/* Feedback Form */}
                    <div className="space-y-3">
                      <div>
                        <label className="block text-xs font-semibold text-gray-700 mb-1">
                          Refinement Critique (Apply Discernment)
                        </label>
                        <textarea
                          rows={4}
                          value={loopFeedback}
                          onChange={(e) => setLoopFeedback(e.target.value)}
                          placeholder="What did the AI miss? Address format inaccuracies, lack of logical frameworks, or incorrect styling markers..."
                          className="w-full text-xs p-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 text-gray-700"
                        />
                      </div>

                      <button
                        onClick={handleRefineLoop}
                        disabled={isLoopRefining || !loopFeedback.trim()}
                        className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold rounded-lg transition-all disabled:opacity-50"
                      >
                        {isLoopRefining ? (
                          <>
                            <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                            Refining and Iterating...
                          </>
                        ) : (
                          <>
                            <ArrowRight className="w-3.5 h-3.5" />
                            Submit Feedback & Iterate (V{loopIterations.length + 1})
                          </>
                        )}
                      </button>
                    </div>

                  </div>
                </div>

              </div>
            )}
          </div>
        )}


        {/* ========================================================================= */}
        {/* MODULE 3: REFLECTION JOURNAL */}
        {/* ========================================================================= */}
        {activeTab === 'workbook' && (
          <div className="space-y-8">
            <div className="bg-white rounded-2xl border border-[#E1E0DA] p-6 shadow-xs">
              <div className="flex items-start gap-4 mb-6">
                <div className="p-3 bg-indigo-50 text-indigo-700 rounded-xl">
                  <BookOpen className="w-6 h-6" />
                </div>
                <div>
                  <h2 className="text-xl font-bold font-display text-[#0F172A]">
                    Interactive Discernment Journal
                  </h2>
                  <p className="text-xs text-gray-500 mt-1">
                    Reinforce your understanding of Prompt Engineering and Human-AI collaboration by capturing thoughts on the capstone reflection exercises.
                  </p>
                </div>
              </div>

              <div className="space-y-6">
                <div>
                  <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                    <Target className="w-4 h-4 text-emerald-600" />
                    Which type of Discernment (Product, Process, or Performance) do you find most challenging to apply, and why?
                  </label>
                  <textarea
                    rows={4}
                    value={savedReflections.mostChallenging}
                    onChange={(e) => saveReflections({ ...savedReflections, mostChallenging: e.target.value })}
                    placeholder="Reflect on why checking mathematical correctness (Product), reasoning steps (Process), or tone/style (Performance) feels hardest to catch..."
                    className="w-full text-xs p-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 text-gray-700"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                    <Layers className="w-4 h-4 text-indigo-600" />
                    How does Discernment complement Description? How do they work together to refine prompts?
                  </label>
                  <textarea
                    rows={4}
                    value={savedReflections.complementDescription}
                    onChange={(e) => saveReflections({ ...savedReflections, complementDescription: e.target.value })}
                    placeholder="Reflect on how description sets the rubric/rules, and discernment grades the model against those boundaries..."
                    className="w-full text-xs p-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 text-gray-700"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                    <Lightbulb className="w-4 h-4 text-amber-500" />
                    What specific signals or patterns indicate that an AI output requires closer expert scrutiny?
                  </label>
                  <textarea
                    rows={4}
                    value={savedReflections.scrutinySignals}
                    onChange={(e) => saveReflections({ ...savedReflections, scrutinySignals: e.target.value })}
                    placeholder="List cues like overly authoritative tones, generic hand-wavy lists, lack of domain-specific edge cases, etc..."
                    className="w-full text-xs p-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 text-gray-700"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                    <Award className="w-4 h-4 text-purple-600" />
                    General Lesson Notes & Insights
                  </label>
                  <textarea
                    rows={3}
                    value={savedReflections.generalNotes}
                    onChange={(e) => saveReflections({ ...savedReflections, generalNotes: e.target.value })}
                    placeholder="Any extra learnings from your expert domain workout..."
                    className="w-full text-xs p-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 text-gray-700"
                  />
                </div>

                <div className="flex justify-end pt-4 border-t border-gray-100">
                  <div className="flex items-center gap-2 text-xs text-gray-500">
                    <CheckCircle className="w-4 h-4 text-emerald-600" />
                    Auto-saved to LocalStorage
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

      </main>
      
      {/* Footer */}
      <footer className="mt-16 text-center text-xs text-gray-400 border-t border-gray-100 pt-6">
        AI Discernment Coach • Built for Prompt Engineering Excellence
      </footer>
    </div>
  );
}

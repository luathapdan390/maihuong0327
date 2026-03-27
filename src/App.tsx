/**
* @license
* SPDX-License-Identifier: Apache-2.0
*/

import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { CheckCircle2, AlertCircle, Shield, Crown, BookOpen, Palette, Compass, Heart, HandHelping, Laugh, Send, Trophy, Music, Bird, Flower2, Theater } from 'lucide-react';
import confetti from 'canvas-confetti';

// --- CONFIGURATION ---
const BOT_TOKEN = "8260200134:AAFlf6xMu9DAYAKWDJVoLFczYRRzWVqijnY";
const CHAT_ID = "6789535208";

interface Archetype {
 id: string;
 name: string;
 icon: React.ReactNode;
 description: string;
 color: string;
}

const ARCHETYPES: Archetype[] = [
 { id: 'warrior', name: 'Warrior', icon: <Shield className="w-8 h-8" />, description: 'Strong, determined, never gives up', color: 'bg-red-500' },
 { id: 'leader', name: 'Leader', icon: <Crown className="w-8 h-8" />, description: 'Leads, controls, guides others', color: 'bg-yellow-500' },
 { id: 'sage', name: 'Sage', icon: <BookOpen className="w-8 h-8" />, description: 'Wise, loves learning, deep understanding', color: 'bg-blue-500' },
 { id: 'creator', name: 'Creator', icon: <Palette className="w-8 h-8" />, description: 'Creative, rich imagination', color: 'bg-purple-500' },
 { id: 'explorer', name: 'Explorer', icon: <Compass className="w-8 h-8" />, description: 'Loves exploring, curious, values experiences', color: 'bg-green-500' },
 { id: 'lover', name: 'Lover', icon: <Heart className="w-8 h-8" />, description: 'Emotional, connection, values relationships', color: 'bg-pink-500' },
 { id: 'caregiver', name: 'Caregiver', icon: <HandHelping className="w-8 h-8" />, description: 'Caring, helpful, looks after others', color: 'bg-orange-500' },
 { id: 'jester', name: 'Jester', icon: <Laugh className="w-8 h-8" />, description: 'Humorous, fun, makes everyone laugh', color: 'bg-indigo-500' },
];

interface ListeningItem {
  id: number;
  answer: string;
  label: string;
  section: string;
  icon?: React.ReactNode;
}

const listeningData: ListeningItem[] = [
  { id: 1, section: "Jazz band", label: "Venue: The ... school", answer: "secondary", icon: <Music size={14}/> },
  { id: 2, section: "Jazz band", label: "Note: Carolyn Hart plays the ...", answer: "flute", icon: <Music size={14}/> },
  { id: 3, section: "Duck races", label: "Venue: Start behind the ...", answer: "cinema", icon: <Bird size={14}/> },
  { id: 4, section: "Duck races", label: "Prize: Tickets for the ...", answer: "concert", icon: <Bird size={14}/> },
  { id: 5, section: "Duck races", label: "Note: Ducks can be bought in the ...", answer: "market", icon: <Bird size={14}/> },
  { id: 6, section: "Flower show", label: "Venue: ... Hall (Spelling!)", answer: "Bythwaite", icon: <Flower2 size={14}/> },
  { id: 7, section: "Flower show", label: "Note: Prizes presented by a famous ...", answer: "actor", icon: <Flower2 size={14}/> },
  { id: 8, section: "Suitability", label: "Play: The Mystery of Muldoon (A/B/C)", answer: "A", icon: <Theater size={14}/> },
  { id: 9, section: "Suitability", label: "Play: Fire and Flood (A/B/C)", answer: "B", icon: <Theater size={14}/> },
  { id: 10, section: "Suitability", label: "Play: Silly Sailor (A/B/C)", answer: "C", icon: <Theater size={14}/> },
];

type AppState = 'WELCOME' | 'QUIZ' | 'COMPLETION' | 'SUBMITTED';

export default function App() {
 const [state, setState] = useState<AppState>('WELCOME');
 const [name, setName] = useState('');
 const [selectedArchetype, setSelectedArchetype] = useState<Archetype | null>(null);
 const [userAnswers, setUserAnswers] = useState<Record<number, string>>({});
 const [isSubmitting, setIsSubmitting] = useState(false);
 const [error, setError] = useState<string | null>(null);
 const [finalResults, setFinalResults] = useState<{ correct: number; total: number } | null>(null);

 const containerRef = useRef<HTMLDivElement>(null);
 const hasSubmittedRef = useRef(false);

 useEffect(() => {
   const handleFullscreenChange = () => {
     if (!document.fullscreenElement && state === 'QUIZ') {
       alert("You exited full-screen. The quiz has been reset for security.");
       resetQuiz();
     }
   };
   document.addEventListener('fullscreenchange', handleFullscreenChange);
   return () => document.removeEventListener('fullscreenchange', handleFullscreenChange);
 }, [state]);

 const resetQuiz = () => {
   setState('WELCOME');
   setUserAnswers({});
   setFinalResults(null);
 };

 const retryQuiz = () => {
   setFinalResults(null);
   setState('QUIZ');
 };

 const startQuiz = async () => {
   if (!name.trim() || !selectedArchetype) {
     setError("Please enter your name and select an archetype.");
     return;
   }
   setError(null);
   try {
     if (containerRef.current) {
       await containerRef.current.requestFullscreen();
     }
     setState('QUIZ');
   } catch (err) {
     setState('QUIZ');
   }
 };

 const handleInputChange = (id: number, value: string) => {
   setUserAnswers(prev => ({ ...prev, [id]: value }));
 };

 const calculateResults = () => {
   let correctCount = 0;
   listeningData.forEach(item => {
     const userAnswer = (userAnswers[item.id] || '').trim().toLowerCase();
     const correctAnswer = item.answer.toLowerCase();
     if (userAnswer === correctAnswer) {
       correctCount++;
     }
   });

   setFinalResults({ correct: correctCount, total: listeningData.length });
   setState('COMPLETION');
   confetti({ particleCount: 150, spread: 70, origin: { y: 0.6 } });
 };

 const submitToTelegram = async () => {
   if (!finalResults || isSubmitting) return;
   setIsSubmitting(true);
   const message = `🎧 IELTS LISTENING: FESTIVAL Submitted!
Name: ${name}
Archetype: ${selectedArchetype?.name}
Score: ${finalResults.correct}/${finalResults.total}
Timestamp: ${new Date().toLocaleString()}`;

   try {
     await fetch(`https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`, {
       method: 'POST',
       headers: { 'Content-Type': 'application/json' },
       body: JSON.stringify({ chat_id: CHAT_ID, text: message }),
     });
     setState('SUBMITTED');
   } catch (err) {
     setError("Failed to submit results. Check connection.");
   } finally {
     setIsSubmitting(false);
   }
 };

 useEffect(() => {
   if (state === 'COMPLETION' && !hasSubmittedRef.current) {
     hasSubmittedRef.current = true;
     submitToTelegram();
   }
   if (state === 'WELCOME') {
     hasSubmittedRef.current = false;
   }
 }, [state, finalResults]);

 return (
   <div ref={containerRef} className="min-h-screen bg-[#0a0b1e] text-white font-sans selection:bg-blue-500/30 overflow-hidden flex flex-col items-center justify-center p-4">
     <AnimatePresence mode="wait">
       {state === 'WELCOME' && (
         <motion.div key="welcome" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95 }} className="w-full max-w-4xl bg-[#1a1c3d] p-8 rounded-3xl border border-white/10 shadow-2xl">
           <div className="text-center mb-8">
             <h1 className="text-4xl font-black bg-gradient-to-r from-blue-400 to-indigo-500 bg-clip-text text-transparent mb-2 uppercase">IELTS Listening Mission</h1>
             <p className="text-gray-400 text-sm tracking-widest uppercase">Target: Table Completion & Suitability (A/B/C)</p>
           </div>
           <div className="space-y-8">
             <div className="max-w-md mx-auto">
               <label className="block text-sm font-medium text-gray-400 mb-2 uppercase tracking-wider">Your Identity</label>
               <input type="text" value={name} onChange={(e) => setName(e.target.value)} placeholder="Enter full name" className="w-full bg-[#0a0b1e] border border-white/10 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all text-center text-lg" />
             </div>
             <div>
               <label className="block text-sm font-medium text-gray-400 mb-4 uppercase tracking-wider text-center">Select Your Archetype</label>
               <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                 {ARCHETYPES.map((arch) => (
                   <button key={arch.id} onClick={() => setSelectedArchetype(arch)} className={`flex flex-col items-center p-4 rounded-2xl border-2 transition-all text-center group ${selectedArchetype?.id === arch.id ? 'border-blue-500 bg-blue-500/20 shadow-lg' : 'border-white/5 bg-white/5 hover:bg-white/10'}`}>
                     <div className={`w-12 h-12 rounded-full flex items-center justify-center mb-3 transition-transform group-hover:scale-110 ${arch.color} bg-opacity-20 text-white`}>{arch.icon}</div>
                     <h4 className="font-bold text-[10px] uppercase tracking-tighter">{arch.name}</h4>
                   </button>
                 ))}
               </div>
             </div>
             {error && <div className="flex items-center gap-2 text-red-400 text-sm bg-red-400/10 p-3 rounded-lg border border-red-400/20 max-w-md mx-auto"><AlertCircle size={16} /><span>{error}</span></div>}
             <div className="max-w-md mx-auto">
               <button onClick={startQuiz} className="w-full bg-blue-600 hover:bg-blue-500 py-4 rounded-xl font-black text-lg shadow-lg transition-all active:scale-95 disabled:opacity-50 uppercase tracking-widest">START MISSION</button>
             </div>
           </div>
           <footer className="mt-12 pt-8 border-t border-white/5 text-center text-gray-500 text-[10px] uppercase tracking-[0.3em]">© 2026 Honor Class 1A • Strategic Intelligence</footer>
         </motion.div>
       )}

       {state === 'QUIZ' && (
         <motion.div key="quiz" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="w-full max-w-5xl flex flex-col h-full max-h-[95vh]">
           <div className="flex items-center justify-between mb-6 bg-[#1a1c3d] p-4 rounded-2xl border border-white/10 shrink-0">
             <div className="flex items-center gap-4">
               <div className={`w-12 h-12 rounded-full flex items-center justify-center ${selectedArchetype?.color} bg-opacity-20 text-white`}>{selectedArchetype?.icon}</div>
               <div><h3 className="font-bold text-lg">{name}</h3><p className="text-[10px] text-gray-400 uppercase tracking-widest">Active Feed: Festival Info</p></div>
             </div>
             <div className="text-right">
               <div className="text-xl font-mono font-black text-blue-400">{Object.keys(userAnswers).length}/10</div>
               <p className="text-xs text-gray-400 uppercase tracking-widest">Progress</p>
             </div>
           </div>

           <div className="bg-[#1a1c3d] p-6 rounded-2xl border border-white/10 mb-6 flex flex-col items-center shrink-0">
             <h4 className="text-xs font-bold text-gray-500 mb-4 uppercase tracking-[0.2em]">Audio Intelligence Feed</h4>
             <iframe src="https://drive.google.com/file/d/1RMb09ZC3c7ncqdG2gyJxM9sUwreIADbt/preview" className="w-full max-w-2xl h-[120px] rounded-xl border-none overflow-hidden bg-black/20" allow="autoplay"></iframe>
           </div>

           <div className="flex-1 overflow-y-auto pr-4 custom-scrollbar bg-[#1a1c3d]/50 p-8 rounded-3xl border border-white/10">
             <div className="mb-8 p-4 bg-blue-500/10 border-l-4 border-blue-500 rounded-r-xl">
                <p className="text-xs font-bold text-blue-300 uppercase tracking-widest mb-1">Mission Specs (8-10):</p>
                <p className="text-[11px] text-gray-400 italic">A: mainly for children | B: mainly for adults | C: for all ages</p>
             </div>
             
             <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-8">
               {listeningData.map((item) => (
                 <div key={item.id} className="space-y-2">
                   <div className="flex items-center gap-2 mb-1">
                      <span className="text-[10px] font-black text-gray-500 uppercase tracking-widest flex items-center gap-1">{item.icon} {item.section}</span>
                   </div>
                   <div className="relative">
                     <span className="absolute left-4 top-1/2 -translate-y-1/2 text-blue-500 font-black font-mono">({item.id})</span>
                     <input type="text" autoComplete="off" value={userAnswers[item.id] || ''} onChange={(e) => handleInputChange(item.id, e.target.value)} placeholder="..." className="w-full bg-[#0a0b1e] border border-white/10 rounded-xl pl-12 pr-4 py-4 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all font-medium text-sm" />
                   </div>
                   <p className="text-[10px] text-gray-500 font-bold uppercase tracking-tight pl-2 opacity-60">{item.label}</p>
                 </div>
               ))}
             </div>
           </div>

           <div className="mt-6 flex justify-center shrink-0"><button onClick={calculateResults} className="w-full max-w-md bg-blue-600 hover:bg-blue-500 py-5 rounded-2xl font-black text-xl shadow-lg transition-all active:scale-95 uppercase tracking-widest flex items-center justify-center gap-3"><Send size={24} />SUBMIT DATA</button></div>
         </motion.div>
       )}

       {(state === 'COMPLETION' || state === 'SUBMITTED') && (
         <motion.div key="completion" initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="w-full max-w-4xl flex flex-col h-full max-h-[95vh]">
           <div className="text-center mb-8 shrink-0">
             <div className="w-20 h-20 bg-green-500/20 text-green-500 rounded-full flex items-center justify-center mx-auto mb-4 border border-green-500/30"><Trophy size={40} /></div>
             <h1 className="text-4xl font-black tracking-tight mb-2 uppercase italic">Mission Debriefing</h1>
             <div className="flex items-center justify-center gap-4"><span className="text-3xl font-mono bg-blue-500/20 px-8 py-2 rounded-full border border-blue-500/30 text-blue-400 font-black">{finalResults?.correct}/{finalResults?.total}</span></div>
           </div>

           <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar bg-[#1a1c3d] p-8 rounded-3xl border border-white/10 shadow-2xl">
             <h2 className="text-2xl font-black text-center mb-8 text-yellow-500 uppercase tracking-widest border-b border-white/10 pb-4 italic">Internal Intelligence Analysis</h2>
             <div className="space-y-4">
               {listeningData.map((item) => {
                 const rawAnswer = (userAnswers[item.id] || '').trim().toLowerCase();
                 const isCorrect = rawAnswer === item.answer.toLowerCase();
                 return (
                   <div key={item.id} className="bg-[#0a0b1e] p-6 rounded-2xl border border-white/5 flex items-center justify-between gap-4">
                     <div className="flex items-center gap-6">
                        <span className="w-10 h-10 rounded-lg bg-white/5 flex items-center justify-center font-black text-gray-500 font-mono">{item.id}</span>
                        <div>
                          <p className="text-[10px] text-gray-500 font-bold uppercase mb-1">{item.section}</p>
                          <p className={`text-xl font-mono font-black ${isCorrect ? 'text-green-400' : 'text-red-400 underline decoration-wavy'}`}>{userAnswers[item.id] || 'N/A'}</p>
                        </div>
                     </div>
                     <div className="flex items-center">
                        {isCorrect ? (
                          <div className="flex items-center gap-2 text-green-500 bg-green-500/10 px-4 py-2 rounded-full border border-green-500/20 font-black text-xs uppercase italic"><CheckCircle2 size={16} /> Data Verified</div>
                        ) : (
                          <div className="flex items-center gap-2 text-red-500 bg-red-500/10 px-4 py-2 rounded-full border border-red-500/20 font-black text-xs uppercase italic"><AlertCircle size={16} /> Corrupted Intel</div>
                        )}
                     </div>
                   </div>
                 );
               })}
             </div>
             <div className="mt-12 flex justify-center gap-4 shrink-0">
               <button onClick={retryQuiz} className="bg-blue-600 hover:bg-blue-500 px-10 py-4 rounded-xl text-white font-black transition-all uppercase tracking-widest shadow-lg">RE-LISTEN FEED</button>
               <button onClick={resetQuiz} className="bg-white/5 hover:bg-white/10 px-10 py-4 rounded-xl text-gray-400 font-bold transition-all uppercase tracking-widest border border-white/5">ABORT TO HQ</button>
             </div>
           </div>
         </motion.div>
       )}
     </AnimatePresence>

     <style>{`
       .custom-scrollbar::-webkit-scrollbar { width: 6px; }
       .custom-scrollbar::-webkit-scrollbar-track { background: rgba(255, 255, 255, 0.02); border-radius: 10px; }
       .custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(59, 130, 246, 0.3); border-radius: 10px; }
       .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: rgba(59, 130, 246, 0.5); }
     `}</style>
   </div>
 );
}

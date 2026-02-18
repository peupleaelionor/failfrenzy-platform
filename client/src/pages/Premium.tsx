import React from 'react';
import { Link } from 'wouter';

export default function Premium() {
  return (
    <div className="min-h-screen bg-[#050818] text-white p-8">
      <h1 className="text-4xl font-black mb-8 text-magenta-400">PREMIUM</h1>
      <Link href="/"><button className="px-6 py-3 bg-magenta-500/20 border border-magenta-500 rounded-lg font-bold hover:bg-magenta-500/40 transition-all">RETOUR</button></Link>
    </div>
  );
}

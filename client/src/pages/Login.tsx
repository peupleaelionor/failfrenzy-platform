import React from 'react';
import { Link } from 'wouter';

export default function Login() {
  return (
    <div className="min-h-screen bg-[#050818] text-white p-8">
      <h1 className="text-4xl font-black mb-8 text-cyan-400">CONNEXION</h1>
      <Link href="/"><button className="px-6 py-3 bg-cyan-500/20 border border-cyan-500 rounded-lg font-bold hover:bg-cyan-500/40 transition-all">RETOUR</button></Link>
    </div>
  );
}

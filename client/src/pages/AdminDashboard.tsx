import React from 'react';
import { Link } from 'wouter';

export const AdminDashboard: React.FC = () => {
  return (
    <div className="min-h-screen bg-[#050818] text-white p-8">
      <h1 className="text-4xl font-black mb-8 text-red-500">ADMINISTRATION</h1>
      <Link href="/"><button className="px-6 py-3 bg-red-500/20 border border-red-500 rounded-lg font-bold hover:bg-red-500/40 transition-all">RETOUR</button></Link>
    </div>
  );
};

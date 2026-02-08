/**
 * FAIL FRENZY — ENHANCED GAME OVER SCREEN
 * 
 * Toujours afficher:
 * - Échos récupérés
 * - Contribution Xylos
 * - Message positif
 * 
 * Bien-être joueur: chaque run compte
 */

import React from 'react';
import { getXylosSystem } from '../systems/XylosSystem';
import { getSelectedSkin } from '../systems/GameplaySkinSystem';

interface EnhancedGameOverProps {
  score: number;
  time: number;
  fails: number;
  combo: number;
  onRestart: () => void;
  onMenu: () => void;
}

export const EnhancedGameOver: React.FC<EnhancedGameOverProps> = ({
  score,
  time,
  fails,
  combo,
  onRestart,
  onMenu,
}) => {
  const xylos = getXylosSystem();
  const xylosData = xylos.getData();
  const skin = getSelectedSkin();

  // Calculer les échos de cette run
  const echoesThisRun = Math.floor(fails * skin.modifiers.xylosEchoMultiplier);
  const lightThisRun = Math.floor(score * 0.5);

  // Messages positifs
  const positiveMessages = [
    'FAILURE CONVERTED TO DATA',
    'EVERY RUN MATTERS',
    'XYLOS REMEMBERS',
    'PROGRESS LOGGED',
    'YOU\'RE LEARNING',
    'DATA COLLECTED',
    'CONTRIBUTION ACCEPTED',
    'KEEP GOING',
  ];

  const randomMessage = positiveMessages[Math.floor(Math.random() * positiveMessages.length)];

  // Couleur de l'état Xylos
  const xylosColor = xylos.getStateColor();

  return (
    <div className="fixed inset-0 bg-black/90 flex items-center justify-center z-50">
      <div className="max-w-2xl w-full mx-4 p-8 bg-gradient-to-br from-gray-900 to-black border-2 border-cyan-500/50 rounded-lg shadow-2xl">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-5xl font-bold text-cyan-400 mb-2 tracking-wider">
            RUN COMPLETE
          </h1>
          <p className="text-xl text-gray-400 font-mono">{randomMessage}</p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 gap-6 mb-8">
          {/* Score */}
          <div className="bg-gray-800/50 p-4 rounded border border-cyan-500/30">
            <div className="text-sm text-gray-400 mb-1">SCORE</div>
            <div className="text-3xl font-bold text-white">{score}</div>
          </div>

          {/* Time */}
          <div className="bg-gray-800/50 p-4 rounded border border-cyan-500/30">
            <div className="text-sm text-gray-400 mb-1">TIME</div>
            <div className="text-3xl font-bold text-white">{time.toFixed(1)}s</div>
          </div>

          {/* Combo */}
          <div className="bg-gray-800/50 p-4 rounded border border-yellow-500/30">
            <div className="text-sm text-gray-400 mb-1">MAX COMBO</div>
            <div className="text-3xl font-bold text-yellow-400">x{combo}</div>
          </div>

          {/* Fails */}
          <div className="bg-gray-800/50 p-4 rounded border border-red-500/30">
            <div className="text-sm text-gray-400 mb-1">FAILS</div>
            <div className="text-3xl font-bold text-red-400">{fails}</div>
          </div>
        </div>

        {/* Xylos Contribution */}
        <div className="mb-8 p-6 bg-gradient-to-r from-purple-900/30 to-cyan-900/30 rounded-lg border-2" 
             style={{ borderColor: xylosColor }}>
          <div className="text-center mb-4">
            <h2 className="text-2xl font-bold mb-2" style={{ color: xylosColor }}>
              XYLOS CONTRIBUTION
            </h2>
            <div className="text-sm text-gray-400 mb-4">
              État actuel: <span className="font-bold uppercase">{xylosData.currentState.replace('_', ' ')}</span>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4 mb-4">
            <div className="text-center">
              <div className="text-sm text-gray-400 mb-1">ÉCHOS RÉCUPÉRÉS</div>
              <div className="text-2xl font-bold text-purple-400">+{echoesThisRun}</div>
              <div className="text-xs text-gray-500">Total: {xylosData.totalEchoes}</div>
            </div>
            <div className="text-center">
              <div className="text-sm text-gray-400 mb-1">LUMIÈRE ABSORBÉE</div>
              <div className="text-2xl font-bold text-cyan-400">+{lightThisRun}</div>
              <div className="text-xs text-gray-500">Total: {Math.floor(xylosData.totalLight)}</div>
            </div>
          </div>

          {/* Progress bar */}
          <div className="w-full bg-gray-700 rounded-full h-3 overflow-hidden">
            <div 
              className="h-full transition-all duration-1000 rounded-full"
              style={{ 
                width: `${xylosData.stateProgress}%`,
                backgroundColor: xylosColor,
                boxShadow: `0 0 10px ${xylosColor}`,
              }}
            />
          </div>
          <div className="text-center text-xs text-gray-400 mt-2">
            Progression vers prochain état: {Math.floor(xylosData.stateProgress)}%
          </div>
        </div>

        {/* Skin Info */}
        {skin.id !== 'standard' && (
          <div className="mb-6 p-4 bg-gray-800/30 rounded border border-gray-700">
            <div className="text-sm text-gray-400 mb-1">SKIN ACTIF</div>
            <div className="text-lg font-bold text-white mb-1">{skin.name}</div>
            <div className="text-xs text-green-400">✓ {skin.bonusText}</div>
            <div className="text-xs text-red-400">✗ {skin.malusText}</div>
          </div>
        )}

        {/* Actions */}
        <div className="flex gap-4">
          <button
            onClick={onRestart}
            className="flex-1 py-4 bg-cyan-600 hover:bg-cyan-500 text-white font-bold rounded-lg transition-colors shadow-lg shadow-cyan-500/50"
          >
            RESTART
          </button>
          <button
            onClick={onMenu}
            className="flex-1 py-4 bg-gray-700 hover:bg-gray-600 text-white font-bold rounded-lg transition-colors"
          >
            MENU
          </button>
        </div>

        {/* Footer message */}
        <div className="mt-6 text-center text-sm text-gray-500 font-mono">
          {skin.keyMessage}
        </div>
      </div>
    </div>
  );
};

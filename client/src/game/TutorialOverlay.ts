import React from 'react';

export const CinematicIntro: React.FC = () => null;
export const TutorialOverlay: React.FC<{ onComplete: () => void }> = ({ onComplete }) => null;

export function shouldShowTutorial() { return false; }
export function shouldShowCinematic() { return false; }
export function markCinematicSeen() {}

import React, { useState } from 'react';
import { 
  Sparkles, 
  ArrowRight, 
  ArrowLeft, 
  CheckCircle2, 
  X, 
  ShieldAlert, 
  Layers, 
  Kanban,
  Play
} from 'lucide-react';

interface GuidedDemoTourProps {
  isOpen: boolean;
  onClose: () => void;
  onJumpToStep: (step: number) => void;
}

export const GuidedDemoTour: React.FC<GuidedDemoTourProps> = ({
  isOpen,
  onClose,
  onJumpToStep
}) => {
  const [currentStep, setCurrentStep] = useState(0);

  if (!isOpen) return null;

  const steps = [
    {
      title: 'Welcome to SyncOps AI — The Meeting Governance Agent',
      subtitle: 'The Problem: Decisions made in meetings vanish into thin air, and teams contradict past decisions without realizing it.',
      description: 'SyncOps is not just another transcript summarizer. It is an active execution agent with persistent cross-meeting memory, real-time conflict detection, and human-in-the-loop task synchronization.',
      badge: 'Step 1 of 5',
      actionLabel: 'Load Meeting 1 (Base Memory)',
      tabTarget: 'ingest'
    },
    {
      title: 'Step 1: Ingesting Meeting 1 & Establishing Memory',
      subtitle: 'Sprint 42 Architecture: PostgreSQL on AWS & Dec 1 Launch',
      description: 'In this meeting, Alice locks in PostgreSQL on AWS RDS for ACID compliance, Dec 1st launch, and a $12k budget. SyncOps extracts these into persistent company memory.',
      badge: 'Step 2 of 5',
      actionLabel: 'Simulate Meeting 2 (The Conflict Incident)',
      tabTarget: 'memory'
    },
    {
      title: 'Step 2: The Rogue Meeting & Cross-Meeting Conflict Alert',
      subtitle: '🚨 Watch the AI catch 3 critical alignment breaches!',
      description: 'One week later, Bob proposes switching to MongoDB on GCP, Carol proposes delaying to Dec 20, and Dave estimates $18.5k spend. SyncOps immediately detects these direct contradictions against stored company decisions!',
      badge: 'Step 3 of 5 (The Climax)',
      actionLabel: 'Inspect Conflict Center',
      tabTarget: 'conflicts'
    },
    {
      title: 'Step 3: Human-in-the-Loop Confirmation Gate',
      subtitle: 'Zero autonomous hallucinations: Human review before posting',
      description: 'The team lead reviews the side-by-side diff. They can enforce the historical decision or adopt the compromise. Staged action items are reviewed before any task is created.',
      badge: 'Step 4 of 5',
      actionLabel: 'View Task Execution Board',
      tabTarget: 'execution'
    },
    {
      title: 'Step 4: Real-time Tracker Sync & Deadline Reminders',
      subtitle: 'Linear / GitHub Ticket Generation + Personalized Weekly Digests',
      description: 'Approved tasks sync to Linear/GitHub with real IDs (ENG-104), automated Slack/Email deadline reminders are queued, and personalized digests are produced for every participant.',
      badge: 'Step 5 of 5',
      actionLabel: 'Explore Live Product',
      tabTarget: 'reminders'
    }
  ];

  const step = steps[currentStep];

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      const nextStep = currentStep + 1;
      setCurrentStep(nextStep);
      onJumpToStep(nextStep);
    } else {
      onClose();
    }
  };

  const handlePrev = () => {
    if (currentStep > 0) {
      const prevStep = currentStep - 1;
      setCurrentStep(prevStep);
      onJumpToStep(prevStep);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4">
      <div className="bg-slate-900 border border-indigo-500/40 rounded-2xl max-w-xl w-full p-6 shadow-2xl shadow-indigo-950/60 relative space-y-5 animate-in fade-in zoom-in-95 duration-200">
        
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition-colors cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Badge & Step indicator */}
        <div className="flex items-center gap-3">
          <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-indigo-500/20 text-indigo-300 border border-indigo-500/40">
            {step.badge}
          </span>
          <div className="flex items-center gap-1">
            {steps.map((_, i) => (
              <div 
                key={i} 
                className={`h-1.5 rounded-full transition-all ${
                  i === currentStep ? 'w-6 bg-indigo-500' : 'w-2 bg-slate-800'
                }`}
              />
            ))}
          </div>
        </div>

        {/* Content */}
        <div>
          <h3 className="text-lg font-bold text-white tracking-tight">
            {step.title}
          </h3>
          <p className="text-xs font-semibold text-indigo-400 mt-1">
            {step.subtitle}
          </p>
          <p className="text-xs text-slate-300 mt-3 leading-relaxed">
            {step.description}
          </p>
        </div>

        {/* Footer controls */}
        <div className="flex items-center justify-between pt-4 border-t border-slate-800">
          <button
            onClick={handlePrev}
            disabled={currentStep === 0}
            className="px-3 py-1.5 text-xs font-medium text-slate-400 hover:text-white disabled:opacity-30 disabled:cursor-not-allowed flex items-center gap-1 cursor-pointer"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            Previous
          </button>

          <button
            onClick={handleNext}
            className="px-4 py-2 bg-gradient-to-r from-indigo-500 to-violet-600 hover:from-indigo-600 hover:to-violet-700 text-white text-xs font-bold rounded-lg shadow-md transition-all flex items-center gap-2 cursor-pointer"
          >
            <span>{step.actionLabel}</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

      </div>
    </div>
  );
};

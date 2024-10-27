import React from 'react';
import { Loader2 } from 'lucide-react';
import { WorkflowStep } from '../types/workflow';

interface WorkflowProgressProps {
  currentStep: WorkflowStep | null;
  totalSteps: number;
  currentStepIndex: number;
  isPlaying: boolean;
  errors: any[];
}

const WorkflowProgress: React.FC<WorkflowProgressProps> = ({
  currentStep,
  totalSteps,
  currentStepIndex,
  isPlaying,
  errors
}) => {
  const progress = (currentStepIndex / totalSteps) * 100;

  return (
    <div className="bg-white rounded-lg p-4 shadow-sm border">
      <div className="mb-4">
        <div className="flex justify-between items-center mb-2">
          <span className="text-sm font-medium text-gray-700">
            Progress: {Math.round(progress)}%
          </span>
          <span className="text-sm text-gray-500">
            Step {currentStepIndex + 1} of {totalSteps}
          </span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div
            className="bg-blue-500 h-2 rounded-full transition-all duration-300"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      {isPlaying && currentStep && (
        <div className="flex items-center gap-3 text-sm text-gray-600">
          <Loader2 className="w-4 h-4 animate-spin text-blue-500" />
          <span>
            {getStepDescription(currentStep)}
          </span>
        </div>
      )}

      {errors.length > 0 && (
        <div className="mt-3">
          <div className="text-sm font-medium text-red-500 mb-1">
            Errors ({errors.length}):
          </div>
          <div className="max-h-24 overflow-y-auto">
            {errors.map((error, index) => (
              <div
                key={index}
                className="text-xs text-red-600 mb-1 last:mb-0"
              >
                {error.message}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

function getStepDescription(step: WorkflowStep): string {
  switch (step.type) {
    case 'click':
      return 'Clicking element...';
    case 'input':
      return 'Entering text...';
    case 'navigation':
      return `Navigating to ${step.url}...`;
    case 'scroll':
      return 'Scrolling page...';
    case 'keypress':
      return 'Pressing key...';
    default:
      return 'Performing action...';
  }
}

export default WorkflowProgress;
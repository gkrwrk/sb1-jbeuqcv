import React, { useState, useEffect } from 'react';
import { Info, Plus, StopCircle, Play } from 'lucide-react';
import WorkflowService from '../services/workflowService';
import { Workflow } from '../types/workflow';

const WorkflowCreator = () => {
  const [workflowName, setWorkflowName] = useState('');
  const [isRecording, setIsRecording] = useState(false);
  const [savedWorkflows, setSavedWorkflows] = useState<Workflow[]>([]);
  const workflowService = WorkflowService.getInstance();

  useEffect(() => {
    loadSavedWorkflows();
  }, []);

  const loadSavedWorkflows = async () => {
    try {
      const workflows = await workflowService.getSavedWorkflows();
      setSavedWorkflows(workflows);
    } catch (error) {
      console.error('Error loading workflows:', error);
    }
  };

  const startRecording = async () => {
    if (!workflowName.trim()) return;
    try {
      setIsRecording(true);
      await workflowService.startRecording(workflowName);
    } catch (error) {
      console.error('Error starting recording:', error);
      setIsRecording(false);
    }
  };

  const stopRecording = async () => {
    try {
      const workflow = await workflowService.stopRecording();
      setIsRecording(false);
      if (workflow) {
        setSavedWorkflows(prev => [...prev, workflow]);
      }
      setWorkflowName('');
    } catch (error) {
      console.error('Error stopping recording:', error);
    }
  };

  const playWorkflow = async (workflow: Workflow) => {
    try {
      await workflowService.playWorkflow(workflow);
    } catch (error) {
      console.error('Error playing workflow:', error);
    }
  };

  return (
    <div className="h-full text-white">
      {!isRecording ? (
        <div className="p-4 space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold flex items-center gap-2">
              Create New Workflow
              <Info className="w-4 h-4 text-gray-400" />
            </h2>
          </div>

          <p className="text-sm text-gray-400">
            Workflows help you get more done by using AI to automate repetitive tasks.
          </p>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1">Workflow Name</label>
              <input
                type="text"
                value={workflowName}
                onChange={(e) => setWorkflowName(e.target.value)}
                placeholder="Give your workflow a descriptive name..."
                className="w-full bg-gray-800 rounded-lg py-2 px-3 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <h3 className="text-sm font-medium mb-2">Record</h3>
              <p className="text-sm text-gray-400 mb-4">
                Teach the AI how to complete your workflow by recording yourself doing it manually.
              </p>

              <ol className="space-y-2 text-sm text-gray-400 mb-4">
                <li>1. Press Start Recording.</li>
                <li>2. Complete your task while the AI tracks your actions.</li>
                <li>3. Stop and save the recording.</li>
                <li>4. View and edit your workflow in the Studio.</li>
                <li>5. Run your workflow!</li>
              </ol>

              <button
                onClick={startRecording}
                disabled={!workflowName.trim()}
                className="w-full bg-blue-500 hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-lg py-2 px-4 flex items-center justify-center gap-2"
              >
                <Plus className="w-4 h-4" />
                Start Recording
              </button>
            </div>

            {savedWorkflows.length > 0 && (
              <div className="mt-6">
                <h3 className="text-sm font-medium mb-3">Saved Workflows</h3>
                <div className="space-y-2">
                  {savedWorkflows.map((workflow) => (
                    <div
                      key={workflow.id}
                      className="flex items-center justify-between bg-gray-800 p-3 rounded-lg"
                    >
                      <span className="text-sm">{workflow.name}</span>
                      <button
                        onClick={() => playWorkflow(workflow)}
                        className="p-2 hover:bg-gray-700 rounded-md"
                        title="Run workflow"
                      >
                        <Play className="w-4 h-4 text-green-400" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      ) : (
        <div className="p-4">
          <div className="flex flex-col items-center justify-center h-full">
            <div className="text-center mb-6">
              <div className="w-4 h-4 bg-red-500 rounded-full animate-ping mx-auto mb-4" />
              <p className="text-sm font-medium">Recording: {workflowName}</p>
              <p className="text-xs text-gray-400 mt-2">
                Complete your task naturally. The AI is learning from your actions.
              </p>
            </div>
            
            <button
              onClick={stopRecording}
              className="flex items-center gap-2 px-4 py-2 bg-red-500 hover:bg-red-600 rounded-lg text-sm"
            >
              <StopCircle className="w-4 h-4" />
              Stop Recording
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default WorkflowCreator;
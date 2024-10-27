import React, { useState } from 'react';
import { X, Search, Globe, GraduationCap, Zap, Settings as SettingsIcon, Terminal } from 'lucide-react';
import ToolsList from './components/ToolsList';
import ChatInput from './components/ChatInput';
import WorkflowCreator from './components/WorkflowCreator';
import WorkflowProgress from './components/WorkflowProgress';
import Settings from './components/Settings';
import AutopilotConsole from './components/AutopilotConsole';

function App() {
  const [isOpen, setIsOpen] = useState(true);
  const [activeTab, setActiveTab] = useState('autopilot');
  const [showWorkflows, setShowWorkflows] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [currentWorkflow, setCurrentWorkflow] = useState(null);

  const handleTabClick = (tab: string) => {
    setActiveTab(tab);
    setShowWorkflows(tab === 'agent');
  };

  const handleStartRecording = (workflow: any) => {
    setIsRecording(true);
    setCurrentWorkflow(workflow);
    setIsOpen(false);
  };

  const handleStopRecording = () => {
    setIsRecording(false);
    setCurrentWorkflow(null);
    setIsOpen(true);
    setShowWorkflows(true);
  };

  return (
    <div className="fixed bottom-4 right-4 flex flex-col items-end">
      {isOpen && (
        <div className="mb-4 w-[400px] h-[600px] bg-gray-900 rounded-lg shadow-xl overflow-hidden">
          <div className="flex items-center justify-between p-3 border-b border-gray-800">
            <div className="flex items-center gap-3">
              <button
                onClick={() => handleTabClick('autopilot')}
                className={`px-3 py-1 rounded-md ${
                  activeTab === 'autopilot' ? 'bg-gray-800' : 'hover:bg-gray-800'
                }`}
              >
                <Terminal className="w-4 h-4" />
              </button>
              <button
                onClick={() => handleTabClick('agent')}
                className={`px-3 py-1 rounded-md ${
                  activeTab === 'agent' ? 'bg-gray-800' : 'hover:bg-gray-800'
                }`}
              >
                Agent
              </button>
              <button
                onClick={() => handleTabClick('chat')}
                className={`px-3 py-1 rounded-md ${
                  activeTab === 'chat' ? 'bg-gray-800' : 'hover:bg-gray-800'
                }`}
              >
                Chat
              </button>
              <button
                onClick={() => handleTabClick('settings')}
                className={`px-3 py-1 rounded-md ${
                  activeTab === 'settings' ? 'bg-gray-800' : 'hover:bg-gray-800'
                }`}
              >
                <SettingsIcon className="w-4 h-4" />
              </button>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="p-1 hover:bg-gray-800 rounded-md"
            >
              <X className="w-4 h-4 text-gray-400" />
            </button>
          </div>

          <div className="h-[calc(100%-48px)] flex flex-col">
            {activeTab === 'settings' ? (
              <Settings />
            ) : activeTab === 'autopilot' ? (
              <AutopilotConsole />
            ) : showWorkflows ? (
              <div className="flex-1 overflow-y-auto">
                <WorkflowCreator 
                  onStartRecording={handleStartRecording}
                  onStopRecording={handleStopRecording}
                  isRecording={isRecording}
                />
              </div>
            ) : (
              <>
                <div className="p-4">
                  <ChatInput />
                </div>
                <div className="px-4 flex gap-2 mb-4">
                  <button className="flex items-center gap-2 px-3 py-1.5 bg-gray-800 rounded-md text-sm text-gray-300 hover:bg-gray-700">
                    <Globe className="w-4 h-4" />
                    Sources
                  </button>
                  <button className="flex items-center gap-2 px-3 py-1.5 bg-gray-800 rounded-md text-sm text-gray-300 hover:bg-gray-700">
                    <GraduationCap className="w-4 h-4" />
                    Scholar
                  </button>
                  <button className="flex items-center gap-2 px-3 py-1.5 bg-gray-800 rounded-md text-sm text-gray-300 hover:bg-gray-700">
                    <Zap className="w-4 h-4" />
                    Actions
                  </button>
                </div>
                <div className="flex-1 overflow-y-auto px-4">
                  <ToolsList />
                </div>
              </>
            )}
          </div>
        </div>
      )}

      {/* Toggle Button */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className={`${
            isRecording 
              ? 'bg-red-500 hover:bg-red-600' 
              : 'bg-blue-500 hover:bg-blue-600'
          } text-white p-3 rounded-full shadow-lg`}
        >
          {isRecording ? (
            <>
              <span className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full animate-ping" />
              <Zap className="w-6 h-6" />
            </>
          ) : (
            <Terminal className="w-6 h-6" />
          )}
        </button>
      )}

      {/* Recording Progress Overlay */}
      {isRecording && currentWorkflow && (
        <div className="fixed bottom-20 right-4 w-[300px] bg-white rounded-lg shadow-lg">
          <WorkflowProgress
            currentStep={null}
            totalSteps={0}
            currentStepIndex={0}
            isPlaying={false}
            errors={[]}
          />
        </div>
      )}
    </div>
  );
}

export default App;
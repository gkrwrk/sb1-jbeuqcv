import React from 'react';
import { Workflow, MessageSquare, Settings, Zap } from 'lucide-react';

const Sidebar = ({ activeTab, setActiveTab }) => {
  const tabs = [
    { id: 'workflows', icon: Workflow, label: 'Workflows' },
    { id: 'chat', icon: MessageSquare, label: 'AI Chat' },
    { id: 'settings', icon: Settings, label: 'Settings' }
  ];

  return (
    <div className="w-[72px] bg-gray-900 text-white p-2 flex flex-col items-center">
      <div className="mb-6 pt-2">
        <div className="w-10 h-10 rounded-full bg-blue-500 flex items-center justify-center">
          <Zap className="w-6 h-6" />
        </div>
      </div>

      <div className="space-y-4">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`w-12 h-12 rounded-lg flex items-center justify-center ${
                activeTab === tab.id
                  ? 'bg-blue-500 text-white'
                  : 'text-gray-400 hover:bg-gray-800'
              }`}
              title={tab.label}
            >
              <Icon className="w-5 h-5" />
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default Sidebar;
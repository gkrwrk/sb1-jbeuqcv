import React from 'react';
import { Search, Pencil, GraduationCap, BarChart3, Wand2 } from 'lucide-react';

const ToolsList = () => {
  const categories = ['Writing', 'Education', 'Business', 'Marketing', 'Other'];
  
  const tools = [
    {
      category: 'Writing',
      items: [
        {
          icon: Wand2,
          title: 'Rewrite Content',
          description: 'Rewrite content in a different way, while keeping the same meaning.',
          color: 'bg-orange-500'
        },
        {
          icon: Pencil,
          title: 'Flexible AutoWrite',
          description: 'Use AI to help you write anything or accomplish nearly any task!',
          color: 'bg-blue-500'
        }
      ]
    }
  ];

  return (
    <div className="text-gray-100">
      {/* Search and Categories */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-sm font-medium">All Tools</h2>
          <div className="relative">
            <Search className="w-4 h-4 text-gray-400 absolute right-3 top-1/2 transform -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search Tools"
              className="w-48 bg-gray-800 text-sm pl-3 pr-9 py-1.5 rounded-md placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>

        <div className="flex flex-wrap gap-2">
          {categories.map((category) => (
            <button
              key={category}
              className="px-3 py-1 text-sm bg-gray-800 rounded-md hover:bg-gray-700 transition-colors"
            >
              {category}
            </button>
          ))}
        </div>
      </div>

      {/* Tools Grid */}
      {tools.map((category) => (
        <div key={category.category} className="mb-6">
          <h3 className="text-sm font-medium mb-3">{category.category}</h3>
          <div className="grid gap-3">
            {category.items.map((tool) => (
              <button
                key={tool.title}
                className="w-full text-left p-3 bg-gray-800 rounded-lg hover:bg-gray-750 transition-colors"
              >
                <div className="flex gap-3 items-start">
                  <div className={`p-2 ${tool.color} rounded-lg`}>
                    <tool.icon className="w-4 h-4 text-white" />
                  </div>
                  <div>
                    <h4 className="text-sm font-medium">{tool.title}</h4>
                    <p className="text-xs text-gray-400 mt-0.5">{tool.description}</p>
                  </div>
                </div>
              </button>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
};

export default ToolsList;
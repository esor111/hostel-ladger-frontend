import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { 
  Plus,
  Search,
  Copy,
  Wand2,
  Box,
  Sparkles
} from "lucide-react";
import { elementTypes, categories, ElementType } from "./ElementTypes";

interface ElementLibraryPanelProps {
  onAddElement: (type: string) => void;
  selectedCategory: string;
  onCategoryChange: (category: string) => void;
  onDuplicateMode?: (enabled: boolean) => void;
  duplicateMode?: boolean;
}

export const ElementLibraryPanel = ({ 
  onAddElement, 
  selectedCategory, 
  onCategoryChange,
  onDuplicateMode,
  duplicateMode = false
}: ElementLibraryPanelProps) => {
  const [searchQuery, setSearchQuery] = useState('');

  const getFilteredElements = () => {
    let filtered = elementTypes;

    // Apply category filter
    if (selectedCategory === 'popular') {
      filtered = filtered.filter(e => e.popular);
    } else if (selectedCategory !== 'all') {
      filtered = filtered.filter(e => e.category === selectedCategory);
    }

    // Apply search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(e => 
        e.label.toLowerCase().includes(query) ||
        e.description.toLowerCase().includes(query) ||
        e.tags.some(tag => tag.toLowerCase().includes(query))
      );
    }

    return filtered;
  };

  const filteredElements = getFilteredElements();

  const handleElementClick = (elementType: string) => {
    onAddElement(elementType);
  };

  const handleDragStart = (e: React.DragEvent, elementType: string) => {
    e.dataTransfer.setData('text/plain', elementType);
    e.dataTransfer.effectAllowed = 'copy';
    
    // Add visual feedback
    const dragImage = e.currentTarget.cloneNode(true) as HTMLElement;
    dragImage.style.transform = 'rotate(5deg) scale(1.1)';
    dragImage.style.opacity = '0.8';
    e.dataTransfer.setDragImage(dragImage, 50, 50);
  };

  return (
    <TooltipProvider>
      <div className="w-80 bg-white border-r border-gray-200 h-full flex flex-col shadow-lg">
        <div className="p-4 border-b border-gray-200 bg-gradient-to-r from-purple-50 to-blue-50">
          <h3 className="font-semibold text-lg mb-4 flex items-center gap-2">
            <Box className="h-5 w-5 text-purple-500" />
            Room Elements
            {duplicateMode && (
              <Badge variant="secondary" className="bg-blue-100 text-blue-700">
                <Copy className="h-3 w-3 mr-1" />
                Duplicate Mode
              </Badge>
            )}
          </h3>
          
          {/* Search Bar */}
          <div className="relative mb-4">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Search elements..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 text-sm bg-white/70 backdrop-blur-sm border-2 focus:border-purple-300"
            />
          </div>

          {/* Quick Actions */}
          <div className="flex gap-2 mb-4">
            <Button
              size="sm"
              variant={duplicateMode ? "default" : "outline"}
              onClick={() => onDuplicateMode?.(!duplicateMode)}
              className="flex-1"
            >
              <Copy className="h-4 w-4 mr-1" />
              {duplicateMode ? 'Exit' : 'Duplicate'}
            </Button>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  size="sm"
                  variant="outline"
                  className="px-3"
                >
                  <Wand2 className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Auto-suggest layout (coming soon)</p>
              </TooltipContent>
            </Tooltip>
          </div>
          
          {/* Category Filters */}
          <div className="space-y-2 max-h-48 overflow-y-auto">
            {categories.map((category) => (
              <Button
                key={category.id}
                variant={selectedCategory === category.id ? "default" : "ghost"}
                size="sm"
                onClick={() => onCategoryChange(category.id)}
                className={`w-full justify-between text-left hover:scale-[1.02] transition-all duration-200 ${
                  selectedCategory === category.id 
                    ? 'bg-gradient-to-r from-purple-500 to-blue-500 text-white shadow-md' 
                    : 'hover:bg-gradient-to-r hover:from-purple-50 hover:to-blue-50'
                }`}
              >
                <div className="flex items-center gap-3">
                  <span className="text-lg">{category.emoji}</span>
                  <span className="font-medium text-sm">{category.label}</span>
                </div>
                <Badge 
                  variant={selectedCategory === category.id ? "secondary" : "outline"} 
                  className={`ml-2 text-xs ${selectedCategory === category.id ? 'bg-white/20 text-white border-white/30' : ''}`}
                >
                  {category.count}
                </Badge>
              </Button>
            ))}
          </div>
        </div>

        {/* Elements Grid */}
        <div className="flex-1 p-4 overflow-y-auto bg-gradient-to-b from-gray-50/50 to-white">
          {filteredElements.length === 0 ? (
            <div className="text-center py-12 text-gray-500">
              <Search className="h-12 w-12 mx-auto mb-4 text-gray-300" />
              <p className="text-base font-medium mb-2">No elements found</p>
              <p className="text-sm">Try a different search or category</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-3">
              {filteredElements.map((element) => {
                const Icon = element.icon;
                return (
                  <Tooltip key={element.type}>
                    <TooltipTrigger asChild>
                      <Button
                        variant="outline"
                        className="h-24 w-full flex items-center gap-4 p-4 hover:scale-[1.02] transition-all duration-200 cursor-grab active:cursor-grabbing relative group bg-white hover:bg-gradient-to-r hover:from-purple-50 hover:to-blue-50 border-2 hover:border-purple-200 hover:shadow-lg"
                        onClick={() => handleElementClick(element.type)}
                        draggable
                        onDragStart={(e) => handleDragStart(e, element.type)}
                      >
                        {element.popular && (
                          <Sparkles className="absolute top-2 right-2 h-4 w-4 text-yellow-500 animate-pulse" />
                        )}
                        
                        {/* Large Emoji */}
                        <div className="text-4xl group-hover:scale-110 transition-transform duration-200 flex-shrink-0">
                          {element.emoji}
                        </div>
                        
                        {/* Element Info */}
                        <div className="flex-1 text-left min-w-0">
                          <div className="font-semibold text-base mb-1 group-hover:text-purple-700 transition-colors">
                            {element.label}
                          </div>
                          <div className="text-xs text-gray-600 mb-2 line-clamp-2">
                            {element.description}
                          </div>
                          <div className="flex flex-wrap gap-1">
                            {element.tags.slice(0, 2).map(tag => (
                              <Badge key={tag} variant="outline" className="text-xs px-2 py-0.5">
                                {tag}
                              </Badge>
                            ))}
                          </div>
                        </div>
                        
                        {/* Size Info */}
                        <div className="text-xs text-gray-500 text-right flex-shrink-0">
                          <div className="font-mono bg-gray-100 px-2 py-1 rounded text-center min-w-12">
                            {element.defaultSize.width}×{element.defaultSize.height}m
                          </div>
                        </div>
                        
                        <div className="absolute inset-0 bg-gradient-to-t from-black/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity rounded-lg" />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent side="right" className="max-w-xs">
                      <div className="text-center">
                        <div className="text-3xl mb-2">{element.emoji}</div>
                        <p className="font-medium text-base mb-2">{element.label}</p>
                        <p className="text-sm text-gray-600 mb-3">{element.description}</p>
                        <div className="flex flex-wrap gap-1 mb-3">
                          {element.tags.map(tag => (
                            <Badge key={tag} variant="outline" className="text-xs">
                              {tag}
                            </Badge>
                          ))}
                        </div>
                        <div className="bg-gray-100 p-2 rounded mb-2">
                          <p className="text-xs font-mono">
                            Size: {element.defaultSize.width}m × {element.defaultSize.height}m
                          </p>
                        </div>
                        {element.customizable && (
                          <div className="bg-blue-50 p-2 rounded mb-2">
                            <p className="text-xs text-blue-700 font-medium mb-1">Customizable:</p>
                            <div className="text-xs text-blue-600">
                              {Object.entries(element.customizable).filter(([_, value]) => value).map(([key, _]) => 
                                key.replace(/([A-Z])/g, ' $1').toLowerCase()
                              ).join(', ')}
                            </div>
                          </div>
                        )}
                        <p className="text-xs text-blue-600 font-medium">
                          💡 Click to add • Drag to place
                        </p>
                      </div>
                    </TooltipContent>
                  </Tooltip>
                );
              })}
            </div>
          )}

          {/* Add Custom Element */}
          <div className="mt-6 pt-4 border-t border-gray-200">
            <Button
              variant="outline"
              className="w-full h-16 flex items-center gap-3 border-2 border-dashed border-gray-300 hover:border-purple-400 text-gray-600 hover:text-purple-600 hover:bg-purple-50 transition-all duration-200"
            >
              <Plus className="h-5 w-5" />
              <div className="text-left">
                <div className="font-medium">Add Custom Item</div>
                <div className="text-xs text-gray-500">Create your own element</div>
              </div>
            </Button>
          </div>
        </div>

        {/* Quick Stats & Tips */}
        <div className="p-4 border-t border-gray-200 bg-gradient-to-r from-purple-50 to-blue-50">
          <div className="text-xs text-gray-600 space-y-3">
            <div className="flex justify-between items-center">
              <span className="font-medium">Showing {filteredElements.length} elements</span>
              <Badge variant="outline" className="text-xs font-mono">
                {selectedCategory === 'all' ? 'All' : selectedCategory}
              </Badge>
            </div>
            
            {searchQuery && (
              <div className="text-blue-700 bg-blue-100 p-2 rounded-lg text-center font-medium">
                🔍 "{searchQuery}" - {filteredElements.length} found
              </div>
            )}
            
            <div className="bg-gradient-to-r from-purple-100 to-blue-100 p-3 rounded-lg text-center">
              <p className="text-purple-700 font-medium text-xs mb-1">
                💡 Pro Tips
              </p>
              <p className="text-xs text-purple-600">
                Alt + Drag = Duplicate • Right-click for options
              </p>
            </div>
          </div>
        </div>
      </div>
    </TooltipProvider>
  );
};

export { elementTypes };
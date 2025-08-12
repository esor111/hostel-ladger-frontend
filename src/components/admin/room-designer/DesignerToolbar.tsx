import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { 
  Save, 
  Undo, 
  Redo, 
  ZoomIn, 
  ZoomOut, 
  Grid3X3, 
  Eye, 
  Move3D, 
  Download, 
  Upload,
  Trash,
  Copy,
  RotateCcw,
  Maximize2,
  Camera
} from "lucide-react";

interface DesignerToolbarProps {
  // History
  canUndo: boolean;
  canRedo: boolean;
  onUndo: () => void;
  onRedo: () => void;
  
  // View Controls
  scale: number;
  onZoomIn: () => void;
  onZoomOut: () => void;
  showGrid: boolean;
  onToggleGrid: () => void;
  snapToGrid: boolean;
  onToggleSnap: () => void;
  
  // View Mode
  viewMode: '2d' | '3d';
  onToggleViewMode: () => void;
  
  // Actions
  onSave: () => void;
  onClear: () => void;
  onExport: () => void;
  onImport: () => void;
  
  // Stats
  elementCount: number;
  roomDimensions: { length: number; width: number; height: number };
}

export const DesignerToolbar = ({ 
  canUndo, 
  canRedo, 
  onUndo, 
  onRedo,
  scale,
  onZoomIn,
  onZoomOut,
  showGrid,
  onToggleGrid,
  snapToGrid,
  onToggleSnap,
  viewMode,
  onToggleViewMode,
  onSave,
  onClear,
  onExport,
  onImport,
  elementCount,
  roomDimensions
}: DesignerToolbarProps) => {
  return (
    <TooltipProvider>
      <div className="bg-white border-b border-gray-200 px-4 py-3">
        <div className="flex items-center justify-between">
          {/* Left Section - History & File Operations */}
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1">
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={onUndo}
                    disabled={!canUndo}
                  >
                    <Undo className="h-4 w-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Undo (Ctrl+Z)</p>
                </TooltipContent>
              </Tooltip>
              
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={onRedo}
                    disabled={!canRedo}
                  >
                    <Redo className="h-4 w-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Redo (Ctrl+Y)</p>
                </TooltipContent>
              </Tooltip>
            </div>

            <Separator orientation="vertical" className="h-6" />

            {/* File Operations */}
            <div className="flex items-center gap-1">
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button size="sm" variant="outline" onClick={onImport}>
                    <Upload className="h-4 w-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Import Layout</p>
                </TooltipContent>
              </Tooltip>
              
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button size="sm" variant="outline" onClick={onExport}>
                    <Download className="h-4 w-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Export Layout</p>
                </TooltipContent>
              </Tooltip>
            </div>
          </div>

          {/* Center Section - View Controls */}
          <div className="flex items-center gap-4">
            {/* Zoom Controls */}
            <div className="flex items-center gap-2">
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button size="sm" variant="outline" onClick={onZoomOut}>
                    <ZoomOut className="h-4 w-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Zoom Out</p>
                </TooltipContent>
              </Tooltip>
              
              <Badge variant="outline" className="min-w-16 justify-center">
                {scale}px/m
              </Badge>
              
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button size="sm" variant="outline" onClick={onZoomIn}>
                    <ZoomIn className="h-4 w-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Zoom In</p>
                </TooltipContent>
              </Tooltip>
            </div>

            <Separator orientation="vertical" className="h-6" />

            {/* View Options */}
            <div className="flex items-center gap-1">
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    size="sm"
                    variant={showGrid ? "default" : "outline"}
                    onClick={onToggleGrid}
                  >
                    <Grid3X3 className="h-4 w-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Toggle Grid</p>
                </TooltipContent>
              </Tooltip>
              
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    size="sm"
                    variant={snapToGrid ? "default" : "outline"}
                    onClick={onToggleSnap}
                  >
                    <Maximize2 className="h-4 w-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Snap to Grid</p>
                </TooltipContent>
              </Tooltip>
              
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    size="sm"
                    variant={viewMode === '3d' ? "default" : "outline"}
                    onClick={onToggleViewMode}
                  >
                    <Move3D className="h-4 w-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Toggle {viewMode === '2d' ? '3D' : '2D'} View</p>
                </TooltipContent>
              </Tooltip>
            </div>
          </div>

          {/* Right Section - Stats & Main Actions */}
          <div className="flex items-center gap-4">
            {/* Room Stats */}
            <div className="flex items-center gap-3 text-sm text-gray-600">
              <Badge variant="outline">
                {roomDimensions.length}m × {roomDimensions.width}m × {roomDimensions.height}m
              </Badge>
              <Badge variant="secondary">
                {elementCount} elements
              </Badge>
            </div>

            <Separator orientation="vertical" className="h-6" />

            {/* Main Actions */}
            <div className="flex items-center gap-2">
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button size="sm" variant="outline" onClick={onClear} className="text-red-600 hover:text-red-700">
                    <Trash className="h-4 w-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Clear Room</p>
                </TooltipContent>
              </Tooltip>
              
              <Button size="sm" onClick={onSave} className="bg-purple-500 hover:bg-purple-600">
                <Save className="h-4 w-4 mr-2" />
                Save Layout
              </Button>
            </div>
          </div>
        </div>
      </div>
    </TooltipProvider>
  );
};
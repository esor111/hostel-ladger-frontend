import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Switch } from "@/components/ui/switch";
import { 
  RotateCw, 
  Trash2, 
  Box, 
  AlertTriangle,
  Copy,
  Settings,
  Users,
  Lock,
  Unlock,
  UserCheck,
  UserX,
  ArrowUp,
  ArrowDown,
  Minus
} from "lucide-react";
import { elementTypes } from "./ElementTypes";

interface BunkLevel {
  id: string;
  position: 'top' | 'middle' | 'bottom';
  assignedTo?: string;
  bedId: string;
}

interface RoomElement {
  id: string;
  type: string;
  x: number;
  y: number;
  width: number;
  height: number;
  rotation: number;
  zIndex: number;
  properties?: {
    bedType?: 'single' | 'bunk' | 'double' | 'kids';
    bedId?: string;
    position?: 'top' | 'middle' | 'bottom';
    orientation?: 'north' | 'south' | 'east' | 'west';
    drawers?: number;
    brightness?: number;
    hingeType?: 'left' | 'right';
    isOpen?: boolean;
    material?: 'wood' | 'metal' | 'plastic';
    color?: string;
    portType?: 'USB' | 'Type-C' | 'Universal';
    bunkLevels?: number;
    levels?: BunkLevel[];
    isLocked?: boolean;
  };
}

interface PropertiesPanelProps {
  selectedElement: RoomElement | null;
  onUpdateElement: (id: string, updates: Partial<RoomElement>) => void;
  onDeleteElement: (id: string) => void;
  onRotateElement: (id: string) => void;
  onDuplicateElement: (id: string) => void;
  hasCollision: boolean;
  isLastSelected?: boolean;
}

export const PropertiesPanel = ({ 
  selectedElement, 
  onUpdateElement, 
  onDeleteElement, 
  onRotateElement, 
  onDuplicateElement,
  hasCollision,
  isLastSelected = false
}: PropertiesPanelProps) => {
  if (!selectedElement) {
    return (
      <div className="w-80 bg-white border-l border-gray-200 h-full flex flex-col">
        <div className="p-4 border-b border-gray-200">
          <h3 className="font-semibold text-lg flex items-center gap-2">
            <Settings className="h-5 w-5 text-gray-400" />
            Properties
          </h3>
        </div>
        <div className="flex-1 flex items-center justify-center p-8">
          <div className="text-center text-gray-500">
            <Box className="h-12 w-12 mx-auto mb-4 text-gray-300" />
            <h4 className="font-medium mb-2">No Element Selected</h4>
            <p className="text-sm">Click on an element in the canvas to edit its properties</p>
          </div>
        </div>
      </div>
    );
  }

  const elementType = elementTypes.find(e => e.type === selectedElement.type);
  const Icon = elementType?.icon || Box;

  const updateProperty = (key: string, value: any) => {
    onUpdateElement(selectedElement.id, {
      properties: { ...selectedElement.properties, [key]: value }
    });
  };

  return (
    <div className="w-80 bg-white border-l border-gray-200 h-full flex flex-col">
      {/* Header */}
      <div className="p-4 border-b border-gray-200">
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-semibold text-lg flex items-center gap-2">
            <Icon className="h-5 w-5" style={{ color: elementType?.color }} />
            Properties
            {isLastSelected && (
              <Badge variant="outline" className="text-xs bg-blue-50 text-blue-600 border-blue-200">
                Last Selected
              </Badge>
            )}
          </h3>
          <div className="text-2xl">{elementType?.emoji}</div>
        </div>

        <div className="flex items-center gap-2 mb-3">
          <Badge variant="outline" className="capitalize">
            {selectedElement.type.replace('-', ' ')}
          </Badge>
          {elementType?.popular && (
            <Badge variant="secondary" className="bg-yellow-100 text-yellow-700">
              Popular
            </Badge>
          )}
          {selectedElement.properties?.isLocked && (
            <Badge variant="secondary" className="bg-red-100 text-red-700">
              <Lock className="h-3 w-3 mr-1" />
              Locked
            </Badge>
          )}
        </div>

        {/* Quick Actions */}
        <div className="flex gap-2">
          <Button
            size="sm"
            variant="outline"
            onClick={() => onRotateElement(selectedElement.id)}
            className="flex-1"
            disabled={selectedElement.properties?.isLocked}
          >
            <RotateCw className="h-4 w-4" />
          </Button>
          <Button
            size="sm"
            variant="outline"
            onClick={() => onDuplicateElement(selectedElement.id)}
            className="flex-1"
          >
            <Copy className="h-4 w-4" />
          </Button>
          <Button
            size="sm"
            variant="outline"
            onClick={() => onDeleteElement(selectedElement.id)}
            className="flex-1 text-red-600 hover:text-red-700 hover:bg-red-50"
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Collision Warning */}
      {hasCollision && (
        <div className="mx-4 mt-4 p-3 bg-red-50 border border-red-200 rounded-lg">
          <div className="flex items-center gap-2 text-red-800 text-sm">
            <AlertTriangle className="h-4 w-4" />
            <span className="font-medium">Collision Detected!</span>
          </div>
          <p className="text-red-700 text-xs mt-1">
            This element overlaps with another. Please adjust its position.
          </p>
        </div>
      )}

      {/* Properties Form */}
      <div className="flex-1 p-4 space-y-6 overflow-y-auto">
        {/* Position & Size */}
        <div className="space-y-4">
          <h4 className="font-medium text-sm text-gray-900 flex items-center gap-2">
            <Box className="h-4 w-4" />
            Position & Size
          </h4>
          
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label className="text-xs text-gray-600">X Position (m)</Label>
              <Input
                type="number"
                value={selectedElement.x.toFixed(1)}
                onChange={(e) => onUpdateElement(selectedElement.id, { x: Number(e.target.value) })}
                step="0.1"
                min="0"
                className="text-sm"
                disabled={selectedElement.properties?.isLocked}
              />
            </div>
            <div>
              <Label className="text-xs text-gray-600">Y Position (m)</Label>
              <Input
                type="number"
                value={selectedElement.y.toFixed(1)}
                onChange={(e) => onUpdateElement(selectedElement.id, { y: Number(e.target.value) })}
                step="0.1"
                min="0"
                className="text-sm"
                disabled={selectedElement.properties?.isLocked}
              />
            </div>
            <div>
              <Label className="text-xs text-gray-600">Width (m)</Label>
              <Input
                type="number"
                value={selectedElement.width.toFixed(1)}
                onChange={(e) => onUpdateElement(selectedElement.id, { width: Number(e.target.value) })}
                step="0.1"
                min="0.1"
                className="text-sm"
                disabled={selectedElement.properties?.isLocked}
              />
            </div>
            <div>
              <Label className="text-xs text-gray-600">Height (m)</Label>
              <Input
                type="number"
                value={selectedElement.height.toFixed(1)}
                onChange={(e) => onUpdateElement(selectedElement.id, { height: Number(e.target.value) })}
                step="0.1"
                min="0.1"
                className="text-sm"
                disabled={selectedElement.properties?.isLocked}
              />
            </div>
          </div>
        </div>

        <Separator />

        {/* Transform */}
        <div className="space-y-4">
          <h4 className="font-medium text-sm text-gray-900 flex items-center gap-2">
            <RotateCw className="h-4 w-4" />
            Transform
          </h4>
          
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label className="text-xs text-gray-600">Rotation (°)</Label>
              <Input
                type="number"
                value={selectedElement.rotation}
                onChange={(e) => onUpdateElement(selectedElement.id, { rotation: Number(e.target.value) })}
                step="90"
                min="0"
                max="360"
                className="text-sm"
                disabled={selectedElement.properties?.isLocked}
              />
            </div>
            <div>
              <Label className="text-xs text-gray-600">Layer (Z-Index)</Label>
              <Input
                type="number"
                value={selectedElement.zIndex}
                onChange={(e) => onUpdateElement(selectedElement.id, { zIndex: Number(e.target.value) })}
                min="0"
                className="text-sm"
              />
            </div>
          </div>
        </div>

        {/* Element-specific properties */}
        {selectedElement.type.includes('bed') && (
          <>
            <Separator />
            <div className="space-y-4">
              <h4 className="font-medium text-sm text-gray-900 flex items-center gap-2">
                <Icon className="h-4 w-4" />
                🛏️ Bed Properties
              </h4>
              
              <div>
                <Label className="text-xs text-gray-600">Bed ID</Label>
                <Input
                  value={selectedElement.properties?.bedId || ''}
                  onChange={(e) => updateProperty('bedId', e.target.value)}
                  placeholder="e.g., BED-A, BED-001"
                  className="text-sm"
                />
              </div>
              
              <div>
                <Label className="text-xs text-gray-600">Bed Type</Label>
                <Select
                  value={selectedElement.properties?.bedType || 'single'}
                  onValueChange={(value) => updateProperty('bedType', value)}
                >
                  <SelectTrigger className="text-sm">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="single">🛏️ Single Bed</SelectItem>
                    <SelectItem value="double">🛌 Double Bed</SelectItem>
                    <SelectItem value="kids">🧸 Kids Bed</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </>
        )}

        {/* Element Info */}
        <Separator />
        <div className="space-y-2">
          <h4 className="font-medium text-sm text-gray-900">Element Info</h4>
          <div className="text-xs text-gray-600 space-y-1">
            <div className="flex justify-between">
              <span>Type:</span>
              <span className="font-medium capitalize">{selectedElement.type.replace('-', ' ')}</span>
            </div>
            <div className="flex justify-between">
              <span>Area:</span>
              <span className="font-medium">
                {(selectedElement.width * selectedElement.height).toFixed(2)} m²
              </span>
            </div>
            <div className="flex justify-between">
              <span>Layer:</span>
              <span className="font-medium">L{selectedElement.zIndex}</span>
            </div>
            {elementType?.category && (
              <div className="flex justify-between">
                <span>Category:</span>
                <span className="font-medium capitalize">{elementType.category}</span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Footer Actions */}
      <div className="p-4 border-t border-gray-200 space-y-2">
        <Button 
          variant="outline" 
          size="sm" 
          className="w-full"
          onClick={() => onDuplicateElement(selectedElement.id)}
        >
          <Copy className="h-4 w-4 mr-2" />
          Duplicate Element
        </Button>
        <Button 
          variant="outline" 
          size="sm" 
          className="w-full text-red-600 hover:text-red-700 hover:bg-red-50"
          onClick={() => onDeleteElement(selectedElement.id)}
        >
          <Trash2 className="h-4 w-4 mr-2" />
          Delete Element
        </Button>
      </div>
    </div>
  );
};
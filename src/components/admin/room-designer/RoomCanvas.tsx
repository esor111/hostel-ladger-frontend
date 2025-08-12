import { useRef, useEffect, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { AlertTriangle, RotateCw, Copy, Trash2, Ruler, Grid3X3 } from "lucide-react";
import { elementTypes } from "./ElementTypes";

// Enhanced emoji mapping function for room elements
const getElementEmoji = (elementType: string, properties?: any): string => {
  const emojiMap: Record<string, string> = {
    'single-bed': '🛏️',
    'bunk-bed': '🏠',
    'double-bed': '🛌',
    'kids-bed': '🧸',
    'study-table': '🪑',
    'study-chair': '🪑',
    'chair': '🪑',
    'study-lamp': '💡',
    'monitor': '🖥️',
    'charging-port': '🔌',
    'headphone-hanger': '🎧',
    'bookshelf': '📚',
    'door': '🚪',
    'window': '🪟',
    'wall-partition': '🧱',
    'room-label': '🏷️',
    'toilet': '🚽',
    'shower': '🚿',
    'wash-basin': '🧼',
    'dustbin': '🗑️',
    'luggage-rack': '🧳',
    'fire-extinguisher': '🧯',
    'locker': '🔐',
    'laundry-basket': '🧺',
    'fan': '🌀',
    'ac-unit': '❄️',
    'call-button': '🔔'
  };

  return emojiMap[elementType] || '📦';
};

interface BunkLevel {
  id: string;
  position: 'top' | 'middle' | 'bottom';
  assignedTo?: string;
  bedId: string;
  status?: 'available' | 'booked' | 'occupied' | 'selected';
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
    bedLabel?: string;
    status?: 'available' | 'booked' | 'occupied' | 'selected';
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

interface RoomTheme {
  name: string;
  wallColor: string;
  floorColor: string;
}

interface RoomCanvasProps {
  dimensions: { length: number; width: number; height: number };
  elements: RoomElement[];
  selectedElement: string | null;
  selectedElements: string[];
  theme: RoomTheme;
  scale: number;
  showGrid: boolean;
  snapToGrid: boolean;
  duplicateMode: boolean;
  onMouseDown: (e: React.MouseEvent<HTMLCanvasElement>) => void;
  onMouseMove: (e: React.MouseEvent<HTMLCanvasElement>) => void;
  onMouseUp: () => void;
  onElementSelect: (id: string, multiSelect?: boolean) => void;
  onElementsMove: (ids: string[], deltaX: number, deltaY: number) => void;
  onElementsMoveComplete?: () => void;
  onElementRotate: (id: string) => void;
  onElementDuplicate: (id: string) => void;
  onElementDelete: (id: string) => void;
  checkCollisions: (element: RoomElement, excludeId?: string) => boolean;
  warnings: string[];
}

export const RoomCanvas = ({
  dimensions,
  elements,
  selectedElement,
  selectedElements,
  theme,
  scale,
  showGrid,
  snapToGrid,
  duplicateMode,
  onMouseDown,
  onMouseMove,
  onMouseUp,
  onElementSelect,
  onElementsMove,
  onElementsMoveComplete,
  onElementRotate,
  onElementDuplicate,
  onElementDelete,
  checkCollisions,
  warnings
}: RoomCanvasProps) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [contextMenu, setContextMenu] = useState<{ x: number, y: number, elementId: string } | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [draggedElementId, setDraggedElementId] = useState<string | null>(null);
  const [hoveredElement, setHoveredElement] = useState<string | null>(null);
  const [tooltip, setTooltip] = useState<{ x: number, y: number, text: string } | null>(null);

  // Reasonable scale for better visibility
  const canvasScale = Math.max(scale * 2, 60);

  const drawCanvas = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Draw background
    ctx.fillStyle = theme.floorColor;
    ctx.fillRect(0, 0, dimensions.length * canvasScale, dimensions.width * canvasScale);

    // Draw grid
    if (showGrid) {
      const gridSize = 0.5 * canvasScale;
      ctx.strokeStyle = '#F3F4F6';
      ctx.lineWidth = 1;
      
      for (let x = 0; x <= dimensions.length * canvasScale; x += gridSize) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, dimensions.width * canvasScale);
        ctx.stroke();
      }

      for (let y = 0; y <= dimensions.width * canvasScale; y += gridSize) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(dimensions.length * canvasScale, y);
        ctx.stroke();
      }
    }

    // Draw room border
    ctx.strokeStyle = '#374151';
    ctx.lineWidth = 3;
    ctx.strokeRect(0, 0, dimensions.length * canvasScale, dimensions.width * canvasScale);

    // Draw elements
    const sortedElements = [...elements].sort((a, b) => a.zIndex - b.zIndex);

    sortedElements.forEach(element => {
      const x = element.x * canvasScale;
      const y = element.y * canvasScale;
      const width = element.width * canvasScale;
      const height = element.height * canvasScale;

      ctx.save();
      ctx.translate(x + width / 2, y + height / 2);
      ctx.rotate(element.rotation * Math.PI / 180);

      const isSelected = selectedElements.includes(element.id);
      const isHovered = hoveredElement === element.id;
      const hasCollision = checkCollisions(element, element.id);

      // Element background
      ctx.fillStyle = isSelected ? '#DBEAFE' : isHovered ? '#F0F9FF' : '#FFFFFF';
      ctx.strokeStyle = isSelected ? '#3B82F6' : hasCollision ? '#EF4444' : '#D1D5DB';
      ctx.lineWidth = isSelected ? 3 : hasCollision ? 2 : 1;

      // Draw element shape
      ctx.beginPath();
      ctx.roundRect(-width / 2, -height / 2, width, height, 6);
      ctx.fill();
      ctx.stroke();

      // Draw element content based on type
      if (element.type === 'single-bed') {
        const bedStatus = element.properties?.status || 'available';
        const statusColors = {
          'available': '#E5E7EB',
          'selected': '#3B82F6',
          'booked': '#F59E0B',
          'occupied': '#EF4444'
        };
        
        ctx.fillStyle = statusColors[bedStatus as keyof typeof statusColors] || statusColors.available;
        ctx.strokeStyle = '#000000';
        ctx.lineWidth = 3;
        ctx.fillRect(-width / 2, -height / 2, width, height);
        ctx.strokeRect(-width / 2, -height / 2, width, height);
        
        // Pillow
        const pillowWidth = width * 0.8;
        const pillowHeight = height * 0.15;
        ctx.fillStyle = '#FFFFFF';
        ctx.strokeStyle = '#000000';
        ctx.lineWidth = 2;
        ctx.fillRect(-pillowWidth / 2, -height / 2 + 8, pillowWidth, pillowHeight);
        ctx.strokeRect(-pillowWidth / 2, -height / 2 + 8, pillowWidth, pillowHeight);
        
        // Bed label
        const bedLabel = element.properties?.bedLabel || element.properties?.bedId || 'Bed';
        ctx.fillStyle = bedStatus === 'available' ? '#374151' : '#FFFFFF';
        ctx.font = `bold ${Math.min(width * 0.15, height * 0.1, 16)}px Arial`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(bedLabel, 0, height * 0.15);
        
      } else if (element.type === 'bunk-bed') {
        const bunkLevels = element.properties?.bunkLevels || 2;
        const levels = element.properties?.levels || [];
        const levelHeight = height / bunkLevels;
        
        for (let i = 0; i < bunkLevels; i++) {
          const levelY = -height / 2 + (i * levelHeight);
          const level = levels[i];
          const bedStatus = level?.status || 'available';
          
          const statusColors = {
            'available': '#E5E7EB',
            'selected': '#3B82F6',
            'booked': '#F59E0B',
            'occupied': '#EF4444'
          };
          
          ctx.fillStyle = statusColors[bedStatus as keyof typeof statusColors] || statusColors.available;
          ctx.strokeStyle = '#374151';
          ctx.lineWidth = 2;
          ctx.fillRect(-width / 2, levelY, width, levelHeight);
          ctx.strokeRect(-width / 2, levelY, width, levelHeight);
          
          // Level label
          const levelLabel = `B${i + 1}`;
          ctx.fillStyle = bedStatus === 'available' ? '#374151' : '#FFFFFF';
          ctx.font = `bold ${Math.min(width * 0.12, levelHeight * 0.2, 14)}px Arial`;
          ctx.textAlign = 'center';
          ctx.textBaseline = 'middle';
          ctx.fillText(levelLabel, 0, levelY + levelHeight * 0.6);
        }
        
      } else if (element.type === 'door') {
        ctx.fillStyle = '#8B4513';
        ctx.strokeStyle = '#6B7280';
        ctx.lineWidth = 2;
        ctx.fillRect(-width / 2, -height / 2, width, height);
        ctx.strokeRect(-width / 2, -height / 2, width, height);
        
        ctx.fillStyle = '#FFFFFF';
        ctx.font = `bold ${Math.min(width * 0.15, height * 0.4, 14)}px Arial`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText('Door', 0, 0);
        
      } else if (element.type === 'window') {
        ctx.fillStyle = '#10B981';
        ctx.strokeStyle = '#6B7280';
        ctx.lineWidth = 2;
        ctx.fillRect(-width / 2, -height / 2, width, height);
        ctx.strokeRect(-width / 2, -height / 2, width, height);
        
        ctx.fillStyle = '#FFFFFF';
        ctx.font = `bold ${Math.min(width * 0.12, height * 0.4, 12)}px Arial`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText('Window', 0, 0);
        
      } else {
        // Regular emoji for other elements
        const emoji = getElementEmoji(element.type, element.properties);
        const emojiSize = Math.min(width * 0.8, height * 0.8, 80);

        ctx.font = `${emojiSize}px Arial`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillStyle = '#1F2937';
        ctx.fillText(emoji, 0, 0);
      }

      // Selection indicators
      if (isSelected) {
        const handleSize = 8;
        ctx.strokeStyle = '#3B82F6';
        ctx.lineWidth = 2;
        ctx.setLineDash([4, 4]);
        ctx.strokeRect(-width / 2 - 4, -height / 2 - 4, width + 8, height + 8);
        ctx.setLineDash([]);

        // Corner handles
        ctx.fillStyle = '#3B82F6';
        ctx.strokeStyle = '#FFFFFF';
        ctx.lineWidth = 1;

        const corners = [
          [-width / 2 - 4, -height / 2 - 4],
          [width / 2 + 4, -height / 2 - 4],
          [-width / 2 - 4, height / 2 + 4],
          [width / 2 + 4, height / 2 + 4]
        ];

        corners.forEach(([hx, hy]) => {
          ctx.fillRect(hx - handleSize / 2, hy - handleSize / 2, handleSize, handleSize);
          ctx.strokeRect(hx - handleSize / 2, hy - handleSize / 2, handleSize, handleSize);
        });
      }

      // Collision warning
      if (hasCollision) {
        ctx.fillStyle = '#DC2626';
        ctx.font = 'bold 16px Arial';
        ctx.fillText('⚠️', width / 2 - 12, -height / 2 - 8);
      }

      ctx.restore();
    });
  };

  const getElementAtPosition = (x: number, y: number): RoomElement | null => {
    const sortedElements = [...elements].sort((a, b) => b.zIndex - a.zIndex);
    return sortedElements.find(element =>
      x >= element.x && x <= element.x + element.width &&
      y >= element.y && y <= element.y + element.height
    ) || null;
  };

  const handleCanvasMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = e.currentTarget;
    const rect = canvas.getBoundingClientRect();
    const x = (e.clientX - rect.left) / canvasScale;
    const y = (e.clientY - rect.top) / canvasScale;

    const clickedElement = getElementAtPosition(x, y);

    if (clickedElement) {
      const isMultiSelect = e.ctrlKey || e.metaKey;
      onElementSelect(clickedElement.id, isMultiSelect);
    } else {
      if (!e.ctrlKey && !e.metaKey) {
        onElementSelect('', false);
      }
    }

    onMouseDown(e);
  };

  const handleCanvasMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = e.currentTarget;
    const rect = canvas.getBoundingClientRect();
    const x = (e.clientX - rect.left) / canvasScale;
    const y = (e.clientY - rect.top) / canvasScale;

    const hoveredEl = getElementAtPosition(x, y);
    
    if (hoveredEl?.id !== hoveredElement) {
      setHoveredElement(hoveredEl?.id || null);
      
      if (hoveredEl) {
        canvas.style.cursor = hoveredEl.properties?.isLocked ? 'not-allowed' : 'grab';
      } else {
        canvas.style.cursor = 'crosshair';
      }
    }

    onMouseMove(e);
  };

  useEffect(() => {
    drawCanvas();
  }, [elements, selectedElements, hoveredElement, theme, scale, showGrid, dimensions]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (canvas) {
      canvas.width = dimensions.length * canvasScale;
      canvas.height = dimensions.width * canvasScale;
      drawCanvas();
    }
  }, [dimensions, canvasScale]);

  return (
    <div className="flex-1 bg-gray-100 overflow-auto relative">
      <canvas
        ref={canvasRef}
        className="border border-gray-300 bg-white cursor-crosshair"
        onMouseDown={handleCanvasMouseDown}
        onMouseMove={handleCanvasMouseMove}
        onMouseUp={onMouseUp}
        style={{
          width: dimensions.length * canvasScale,
          height: dimensions.width * canvasScale
        }}
      />
      
      {/* Warnings */}
      {warnings.length > 0 && (
        <div className="absolute top-4 right-4 space-y-2">
          {warnings.map((warning, index) => (
            <div key={index} className="bg-yellow-100 border border-yellow-400 text-yellow-800 px-3 py-2 rounded-lg flex items-center gap-2">
              <AlertTriangle className="h-4 w-4" />
              <span className="text-sm">{warning}</span>
            </div>
          ))}
        </div>
      )}

      {/* Tooltip */}
      {tooltip && (
        <div 
          className="absolute bg-black text-white px-2 py-1 rounded text-sm pointer-events-none z-50"
          style={{ left: tooltip.x, top: tooltip.y }}
        >
          {tooltip.text}
        </div>
      )}
    </div>
  );
};
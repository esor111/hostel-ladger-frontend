import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Info, Sparkles, CheckCircle } from "lucide-react";

interface RoomDimensions {
  length: number;
  width: number;
  height: number;
}

interface RoomTheme {
  name: string;
  wallColor: string;
  floorColor: string;
  wallTexture?: string;
  floorTexture?: string;
}

interface RoomSetupWizardProps {
  onComplete: (setup: { dimensions: RoomDimensions; theme: RoomTheme }) => void;
  initialData?: { dimensions: RoomDimensions; theme: RoomTheme };
}

export const RoomSetupWizard = ({ onComplete, initialData }: RoomSetupWizardProps) => {
  const [step, setStep] = useState(1);
  const [dimensions, setDimensions] = useState<RoomDimensions>(
    initialData?.dimensions || { length: 10, width: 8, height: 3 }
  );
  const [selectedTheme, setSelectedTheme] = useState<RoomTheme>(
    initialData?.theme || {
      name: 'Modern',
      wallColor: '#F8F9FA',
      floorColor: '#E9ECEF'
    }
  );

  const themes: RoomTheme[] = [
    { name: 'Modern', wallColor: '#F8F9FA', floorColor: '#E9ECEF' },
    { name: 'Minimal', wallColor: '#FFFFFF', floorColor: '#F5F5F5' },
    { name: 'Vintage', wallColor: '#FFF8DC', floorColor: '#DEB887' },
    { name: 'Cozy', wallColor: '#F4E4BC', floorColor: '#CD853F' },
    { name: 'Industrial', wallColor: '#36454F', floorColor: '#708090' },
    { name: 'Tropical', wallColor: '#F0FFF0', floorColor: '#98FB98' }
  ];

  const floorTypes = [
    { name: 'Wood', color: '#DEB887', description: 'Warm and natural' },
    { name: 'Tile', color: '#E9ECEF', description: 'Clean and modern' },
    { name: 'Marble', color: '#F8F9FA', description: 'Luxurious finish' },
    { name: 'Carpet', color: '#CD853F', description: 'Comfortable and cozy' },
    { name: 'Concrete', color: '#708090', description: 'Industrial style' }
  ];

  const handleComplete = () => {
    onComplete({ dimensions, theme: selectedTheme });
  };

  const isValidDimensions = () => {
    return dimensions.length >= 2 && dimensions.width >= 2 && dimensions.height >= 2.2;
  };

  return (
    <TooltipProvider>
      <Card className="max-w-2xl mx-auto">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-purple-500" />
            Room Setup Wizard
            <Badge variant="outline">Step {step} of 3</Badge>
          </CardTitle>
          <div className="flex gap-1 mt-2">
            {[1, 2, 3].map((s) => (
              <div
                key={s}
                className={`h-2 flex-1 rounded ${
                  s <= step ? 'bg-purple-500' : 'bg-gray-200'
                }`}
              />
            ))}
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          
          {/* Step 1: Room Dimensions */}
          {step === 1 && (
            <div className="space-y-6">
              <div className="text-center">
                <h3 className="text-lg font-semibold mb-2">Room Dimensions</h3>
                <p className="text-gray-600">Set your room's basic measurements</p>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <Label>Length (m)</Label>
                    <Tooltip>
                      <TooltipTrigger>
                        <Info className="h-4 w-4 text-gray-400" />
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>Minimum 2m recommended</p>
                      </TooltipContent>
                    </Tooltip>
                  </div>
                  <Input
                    type="number"
                    value={dimensions.length}
                    onChange={(e) => setDimensions({...dimensions, length: Number(e.target.value)})}
                    min="2"
                    max="20"
                    step="0.1"
                    className="text-center"
                  />
                </div>
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <Label>Width (m)</Label>
                    <Tooltip>
                      <TooltipTrigger>
                        <Info className="h-4 w-4 text-gray-400" />
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>Minimum 2m recommended</p>
                      </TooltipContent>
                    </Tooltip>
                  </div>
                  <Input
                    type="number"
                    value={dimensions.width}
                    onChange={(e) => setDimensions({...dimensions, width: Number(e.target.value)})}
                    min="2"
                    max="20"
                    step="0.1"
                    className="text-center"
                  />
                </div>
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <Label>Height (m)</Label>
                    <Tooltip>
                      <TooltipTrigger>
                        <Info className="h-4 w-4 text-gray-400" />
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>Standard ceiling height 2.4-3m</p>
                      </TooltipContent>
                    </Tooltip>
                  </div>
                  <Input
                    type="number"
                    value={dimensions.height}
                    onChange={(e) => setDimensions({...dimensions, height: Number(e.target.value)})}
                    min="2.2"
                    max="5"
                    step="0.1"
                    className="text-center"
                  />
                </div>
              </div>

              <div className="bg-blue-50 p-4 rounded-lg">
                <div className="flex items-center gap-2 text-blue-800 mb-2">
                  <CheckCircle className="h-4 w-4" />
                  <span className="font-medium">Room Preview</span>
                </div>
                <p className="text-blue-700">
                  Your room will be {dimensions.length}m × {dimensions.width}m × {dimensions.height}m 
                  ({(dimensions.length * dimensions.width).toFixed(1)} sq meters)
                </p>
              </div>
            </div>
          )}

          {/* Step 2: Theme Selection */}
          {step === 2 && (
            <div className="space-y-6">
              <div className="text-center">
                <h3 className="text-lg font-semibold mb-2">Choose Your Theme</h3>
                <p className="text-gray-600">Select a style that matches your hostel's vibe</p>
              </div>
              
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {themes.map((theme) => (
                  <div
                    key={theme.name}
                    className={`p-4 rounded-lg border-2 cursor-pointer transition-all hover:scale-105 ${
                      selectedTheme.name === theme.name 
                        ? 'border-purple-500 bg-purple-50' 
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                    onClick={() => setSelectedTheme(theme)}
                  >
                    <div className="flex items-center gap-2 mb-2">
                      <div 
                        className="w-6 h-6 rounded border"
                        style={{ backgroundColor: theme.wallColor }}
                      />
                      <div 
                        className="w-6 h-6 rounded border"
                        style={{ backgroundColor: theme.floorColor }}
                      />
                    </div>
                    <h4 className="font-medium">{theme.name}</h4>
                    {selectedTheme.name === theme.name && (
                      <CheckCircle className="h-4 w-4 text-purple-500 mt-1" />
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Step 3: Floor Type */}
          {step === 3 && (
            <div className="space-y-6">
              <div className="text-center">
                <h3 className="text-lg font-semibold mb-2">Floor Material</h3>
                <p className="text-gray-600">Choose the perfect flooring for your room</p>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {floorTypes.map((floor) => (
                  <div
                    key={floor.name}
                    className={`p-4 rounded-lg border-2 cursor-pointer transition-all hover:scale-102 ${
                      selectedTheme.floorColor === floor.color
                        ? 'border-purple-500 bg-purple-50' 
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                    onClick={() => setSelectedTheme({...selectedTheme, floorColor: floor.color})}
                  >
                    <div className="flex items-center gap-3">
                      <div 
                        className="w-8 h-8 rounded border"
                        style={{ backgroundColor: floor.color }}
                      />
                      <div>
                        <h4 className="font-medium">{floor.name}</h4>
                        <p className="text-sm text-gray-600">{floor.description}</p>
                      </div>
                      {selectedTheme.floorColor === floor.color && (
                        <CheckCircle className="h-4 w-4 text-purple-500 ml-auto" />
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Navigation */}
          <div className="flex justify-between pt-4">
            <Button 
              variant="outline" 
              onClick={() => setStep(Math.max(1, step - 1))}
              disabled={step === 1}
            >
              Previous
            </Button>
            
            {step < 3 ? (
              <Button 
                onClick={() => setStep(step + 1)}
                disabled={step === 1 && !isValidDimensions()}
              >
                Next
              </Button>
            ) : (
              <Button onClick={handleComplete} className="bg-purple-500 hover:bg-purple-600">
                <Sparkles className="h-4 w-4 mr-2" />
                Start Designing
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    </TooltipProvider>
  );
};
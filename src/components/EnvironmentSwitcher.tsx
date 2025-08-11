import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { getEnvironmentConfig, getEnvironmentInfo, ENVIRONMENT_CONFIGS, Environment } from '@/config/environment';
import { Settings, Server, Globe, Monitor } from 'lucide-react';

export const EnvironmentSwitcher: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const currentConfig = getEnvironmentConfig();
  const envInfo = getEnvironmentInfo();

  const getEnvironmentIcon = (env: Environment) => {
    switch (env) {
      case 'localhost':
        return <Monitor className="w-4 h-4" />;
      case 'development':
        return <Server className="w-4 h-4" />;
      case 'production':
        return <Globe className="w-4 h-4" />;
      default:
        return <Settings className="w-4 h-4" />;
    }
  };

  const getEnvironmentColor = (env: Environment) => {
    switch (env) {
      case 'localhost':
        return 'bg-blue-500';
      case 'development':
        return 'bg-yellow-500';
      case 'production':
        return 'bg-green-500';
      default:
        return 'bg-gray-500';
    }
  };

  const handleEnvironmentChange = (newEnv: string) => {
    // This would require a page reload to change environment variables
    // For now, we'll just show instructions
    alert(`To switch to ${newEnv} environment:\n\n1. Stop the development server\n2. Run: npm run dev:${newEnv}\n3. Or set VITE_ENVIRONMENT=${newEnv} in your .env file`);
  };

  if (!currentConfig.debugMode) {
    return null; // Don't show in production
  }

  return (
    <div className="fixed bottom-4 right-4 z-50">
      {!isOpen ? (
        <Button
          onClick={() => setIsOpen(true)}
          variant="outline"
          size="sm"
          className="flex items-center gap-2 bg-white shadow-lg"
        >
          {getEnvironmentIcon(currentConfig.environment)}
          <Badge className={getEnvironmentColor(currentConfig.environment)}>
            {currentConfig.environment.toUpperCase()}
          </Badge>
        </Button>
      ) : (
        <Card className="w-80 shadow-lg">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center justify-between text-sm">
              <span className="flex items-center gap-2">
                <Settings className="w-4 h-4" />
                Environment Settings
              </span>
              <Button
                onClick={() => setIsOpen(false)}
                variant="ghost"
                size="sm"
                className="h-6 w-6 p-0"
              >
                ×
              </Button>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Current Environment */}
            <div className="space-y-2">
              <label className="text-xs font-medium text-gray-600">Current Environment</label>
              <div className="flex items-center gap-2">
                {getEnvironmentIcon(currentConfig.environment)}
                <Badge className={getEnvironmentColor(currentConfig.environment)}>
                  {currentConfig.environment.toUpperCase()}
                </Badge>
              </div>
            </div>

            {/* API Base URL */}
            <div className="space-y-2">
              <label className="text-xs font-medium text-gray-600">API Base URL</label>
              <div className="text-xs bg-gray-100 p-2 rounded font-mono break-all">
                {currentConfig.apiBaseUrl}
              </div>
            </div>

            {/* Environment Switcher */}
            <div className="space-y-2">
              <label className="text-xs font-medium text-gray-600">Switch Environment</label>
              <Select onValueChange={handleEnvironmentChange}>
                <SelectTrigger className="h-8">
                  <SelectValue placeholder="Select environment" />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(ENVIRONMENT_CONFIGS).map(([key, config]) => (
                    <SelectItem key={key} value={key}>
                      <div className="flex items-center gap-2">
                        {getEnvironmentIcon(key as Environment)}
                        <span>{key.charAt(0).toUpperCase() + key.slice(1)}</span>
                        <span className="text-xs text-gray-500">
                          ({config.apiBaseUrl.includes('localhost') ? 'Local' : 'Remote'})
                        </span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Quick Commands */}
            <div className="space-y-2">
              <label className="text-xs font-medium text-gray-600">Quick Commands</label>
              <div className="space-y-1 text-xs">
                <div className="bg-gray-100 p-2 rounded font-mono">
                  npm run dev:local
                </div>
                <div className="bg-gray-100 p-2 rounded font-mono">
                  npm run dev:development
                </div>
                <div className="bg-gray-100 p-2 rounded font-mono">
                  npm run dev:prod
                </div>
              </div>
            </div>

            {/* Environment Info */}
            <div className="space-y-2">
              <label className="text-xs font-medium text-gray-600">Debug Info</label>
              <div className="text-xs space-y-1">
                <div>Debug Mode: {currentConfig.debugMode ? '✅' : '❌'}</div>
                <div>Log Level: {currentConfig.logLevel}</div>
                <div>Timestamp: {new Date(envInfo.timestamp).toLocaleTimeString()}</div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default EnvironmentSwitcher;
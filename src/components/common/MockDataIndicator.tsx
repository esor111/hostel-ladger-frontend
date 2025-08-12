// Mock data indicator component
import React, { useState, useEffect } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Database, RefreshCw } from 'lucide-react';
import { resetMockData } from '@/utils/mockDataLoader.js';

export const MockDataIndicator = () => {
  const [dataCount, setDataCount] = useState(0);

  useEffect(() => {
    // Check if mock data is loaded
    const checkData = () => {
      const students = JSON.parse(localStorage.getItem('studentsData') || '[]');
      const checkedOut = JSON.parse(localStorage.getItem('checkedOutWithDues') || '[]');
      setDataCount(students.length + checkedOut.length);
    };
    
    checkData();
    const interval = setInterval(checkData, 1000);
    return () => clearInterval(interval);
  }, []);

  const handleResetData = () => {
    resetMockData();
    window.location.reload();
  };

  return (
    <div className="fixed top-4 right-4 z-50 flex items-center gap-2">
      <Badge variant="secondary" className="bg-blue-100 text-blue-800 border-blue-200">
        <Database className="h-3 w-3 mr-1" />
        Mock Data Active ({dataCount} records)
      </Badge>
      <Button
        size="sm"
        variant="outline"
        onClick={handleResetData}
        className="h-6 px-2 text-xs"
        title="Reset Mock Data"
      >
        <RefreshCw className="h-3 w-3" />
      </Button>
    </div>
  );
};
'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { CheckCircle, XCircle, Loader2 } from 'lucide-react';

export default function SetupPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [setupStatus, setSetupStatus] = useState<{
    success?: boolean;
    message?: string;
    details?: any;
    stage?: string;
  }>({});

  // Check database status on load
  useEffect(() => {
    checkDatabaseStatus();
  }, []);

  const checkDatabaseStatus = async () => {
    setIsLoading(true);
    setSetupStatus({ stage: 'checking' });

    try {
      // First check if we can access the profiles table
      const response = await fetch('/api/setup-db');
      const data = await response.json();

      if (response.ok) {
        setSetupStatus({
          success: true,
          message: data.message || 'Database is set up correctly',
          details: data,
          stage: 'checked'
        });
      } else {
        setSetupStatus({
          success: false,
          message: data.error || 'Failed to check database status',
          details: data,
          stage: 'checked'
        });
      }
    } catch (error) {
      setSetupStatus({
        success: false,
        message: 'Error checking database status',
        details: error,
        stage: 'error'
      });
    } finally {
      setIsLoading(false);
    }
  };

  const setupDatabase = async () => {
    setIsLoading(true);
    setSetupStatus({ stage: 'setting_up' });

    try {
      // Call setup endpoint
      const response = await fetch('/api/setup-db', {
        method: 'GET',
        headers: {
          'Cache-Control': 'no-cache'
        }
      });

      const data = await response.json();

      if (response.ok || response.status === 207) {
        setSetupStatus({
          success: true,
          message: data.message || 'Database set up successfully',
          details: data,
          stage: 'setup_complete'
        });
      } else {
        setSetupStatus({
          success: false,
          message: data.error || 'Failed to set up database',
          details: data,
          stage: 'setup_failed'
        });
      }
    } catch (error) {
      setSetupStatus({
        success: false,
        message: 'Error setting up database',
        details: error,
        stage: 'error'
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="container flex items-center justify-center min-h-screen py-12">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Database Setup</CardTitle>
          <CardDescription>
            Set up and verify your Supabase database tables
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex flex-col items-center justify-center py-8">
              <Loader2 className="h-8 w-8 animate-spin text-primary mb-4" />
              <p className="text-sm text-muted-foreground">
                {setupStatus.stage === 'checking'
                  ? 'Checking database status...'
                  : 'Setting up database...'}
              </p>
            </div>
          ) : setupStatus.success === undefined ? (
            <Alert className="mb-4">
              <AlertTitle>Database status unknown</AlertTitle>
              <AlertDescription>
                Click check status to verify your database setup
              </AlertDescription>
            </Alert>
          ) : setupStatus.success ? (
            <Alert className="mb-4 bg-green-50 border-green-200">
              <CheckCircle className="h-4 w-4 text-green-600 mr-2" />
              <AlertTitle>Success</AlertTitle>
              <AlertDescription>{setupStatus.message}</AlertDescription>
            </Alert>
          ) : (
            <Alert className="mb-4 bg-red-50 border-red-200">
              <XCircle className="h-4 w-4 text-red-600 mr-2" />
              <AlertTitle>Error</AlertTitle>
              <AlertDescription>
                {setupStatus.message}
                {setupStatus.details && (
                  <pre className="mt-2 text-xs bg-gray-100 p-2 rounded overflow-auto max-h-32">
                    {JSON.stringify(setupStatus.details, null, 2)}
                  </pre>
                )}
              </AlertDescription>
            </Alert>
          )}
        </CardContent>
        <CardFooter className="flex justify-between">
          <Button
            variant="outline"
            onClick={checkDatabaseStatus}
            disabled={isLoading}
          >
            Check Status
          </Button>
          <Button
            onClick={setupDatabase}
            disabled={isLoading}
          >
            Setup Database
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}
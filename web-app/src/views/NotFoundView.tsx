import React from 'react';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router';

const NotFoundView: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-background p-4 text-foreground">
      <div className="flex max-w-md flex-col items-center text-center">
        <h1 className="mb-4 text-6xl font-bold text-primary">
          404
        </h1>
        <h2 className="mb-4 text-2xl font-semibold">Oops! Page Not Found</h2>
        <p className="mb-8 text-muted-foreground">
          It seems the page you're looking for has taken a detour.
          Don't worry, we can get you back on track.
        </p>

        <div className="flex gap-4">
          <Button
            variant="outline"
            onClick={() => navigate(-1)}
          >
            Go Back
          </Button>
          <Button
            onClick={() => navigate('/')}
          >
            Return Home
          </Button>
        </div>
      </div>
    </div>
  );
};

export default NotFoundView;

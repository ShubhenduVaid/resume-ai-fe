import React from 'react';
import { AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface CreditsBannerProps {
  isOutOfCredits: boolean;
  onBuyCredits?: () => void;
}

export function CreditsBanner({
  isOutOfCredits,
  onBuyCredits,
}: CreditsBannerProps) {
  if (!isOutOfCredits) return null;
  return (
    <div className="px-4 py-3 border-t border-red-100 bg-red-50">
      <div className="flex items-center gap-2 text-red-700">
        <AlertTriangle className="w-4 h-4" />
        <span className="text-sm font-medium">Out of credits!</span>
      </div>
      <div className="mt-2 flex items-center gap-3">
        <p className="text-xs text-red-600">
          Purchase more credits to continue using AI features
        </p>
        {onBuyCredits && (
          <Button
            type="button"
            size="sm"
            variant="outline"
            onClick={onBuyCredits}
            className="h-auto py-1 px-2 text-xs border-red-200 text-red-700 hover:bg-red-100"
          >
            Buy Credits
          </Button>
        )}
      </div>
    </div>
  );
}

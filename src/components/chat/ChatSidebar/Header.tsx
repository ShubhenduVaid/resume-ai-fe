import React from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { AlertTriangle } from 'lucide-react';

interface HeaderProps {
  creditsRemaining: number;
  isProcessing: boolean;
  isMobile?: boolean;
  onClose?: () => void;
  onBuyCredits?: () => void;
}

export function Header({
  creditsRemaining,
  isProcessing,
  isMobile = false,
  onClose,
  onBuyCredits,
}: HeaderProps) {
  const isOutOfCredits = creditsRemaining === 0;
  const isLowCredits = creditsRemaining < 10;

  return (
    <div className="px-4 py-3 border-b border-gray-100">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          {isProcessing ? (
            <div className="flex items-center gap-1">
              <span className="h-2 w-2 rounded-full bg-blue-500 animate-pulse" />
              <span className="sr-only">Assistant is typing</span>
            </div>
          ) : (
            <div className="w-2 h-2 bg-green-500 rounded-full"></div>
          )}
          <span className="text-sm font-medium text-gray-900">
            Resume Assistant
          </span>
        </div>

        <div className="flex items-center gap-2">
          {onBuyCredits ? (
            <button
              type="button"
              onClick={onBuyCredits}
              className={`font-medium border text-xs px-2 py-1 rounded-md inline-flex items-center ${
                isOutOfCredits
                  ? 'text-red-600 bg-red-50 border-red-200 hover:bg-red-100'
                  : isLowCredits
                    ? 'text-orange-600 bg-orange-50 border-orange-200 hover:bg-orange-100'
                    : 'text-emerald-600 bg-emerald-50 border-emerald-200 hover:bg-emerald-100'
              }`}
              aria-label={isOutOfCredits ? 'Buy credits' : 'View credit plans'}
              title={isOutOfCredits ? 'Buy credits' : 'View credit plans'}
            >
              {(isOutOfCredits || isLowCredits) && (
                <AlertTriangle className="w-3 h-3 mr-1" />
              )}
              <span>{creditsRemaining}</span>
            </button>
          ) : (
            <Badge
              className={`font-medium border text-xs px-2 py-1 ${
                isOutOfCredits
                  ? 'text-red-600 bg-red-50 border-red-200'
                  : isLowCredits
                    ? 'text-orange-600 bg-orange-50 border-orange-200'
                    : 'text-emerald-600 bg-emerald-50 border-emerald-200'
              }`}
            >
              {(isOutOfCredits || isLowCredits) && (
                <AlertTriangle className="w-3 h-3 mr-1" />
              )}
              <span>{creditsRemaining}</span>
            </Badge>
          )}

          {isMobile && onClose && (
            <Button
              variant="outline"
              size="sm"
              onClick={onClose}
              aria-label="Back to resume"
              className="px-2 py-1 h-auto border-gray-200 text-gray-700 hover:text-gray-900 hover:bg-gray-50"
            >
              <span className="text-sm">Back to Resume</span>
            </Button>
          )}
        </div>
      </div>
      <p className="text-xs text-gray-500 mt-1">
        {isOutOfCredits
          ? 'No credits remaining — buy more to continue'
          : isLowCredits
            ? `Running low on credits (${creditsRemaining} remaining)`
            : 'Chat to edit your resume naturally'}
      </p>
    </div>
  );
}

import React from 'react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  MoreHorizontal,
  Zap,
  Download,
  AlertTriangle,
  LogIn,
  LogOut,
  User as UserIcon,
} from 'lucide-react';
import { ATSScore } from '@/components/ATSScore';
import type { User } from '@/types';

export type OverflowMenuProps = {
  content: string;
  onDownloadPDF?: () => void;
  creditsRemaining?: number;
  onOpenCreditsDialog?: () => void;
  onBuyCredits?: () => void;
  user?: User;
  onOpenLogin?: () => void;
  onLogout?: () => void;
  isGuestSession?: boolean;
};

export function OverflowMenu({
  content,
  onDownloadPDF,
  creditsRemaining,
  onOpenCreditsDialog,
  onBuyCredits,
  user,
  onOpenLogin,
  onLogout,
  isGuestSession,
}: OverflowMenuProps) {
  const [open, setOpen] = React.useState(false);

  return (
    <DropdownMenu open={open} onOpenChange={setOpen}>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="sm"
          className="text-gray-500 hover:text-gray-700 hover:bg-gray-100 p-2 h-auto lg:hidden"
          aria-label="More actions"
          title="More actions"
        >
          <MoreHorizontal className="w-4 h-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        align="end"
        sideOffset={8}
        className="w-72 mr-4"
        avoidCollisions={true}
        collisionPadding={16}
      >
        {/* Mobile/Tablet ATS Score */}
        <div className="lg:hidden">
          <div className="px-3 py-3 text-sm">
            <div className="flex items-center gap-2 mb-2">
              <Zap className="w-4 h-4 text-blue-600" />
              <span className="text-gray-700 font-medium">ATS Score</span>
            </div>
            <div className="pl-6">
              <ATSScore content={content} variant="dropdown" />
            </div>
          </div>
        </div>

        <DropdownMenuSeparator />

        {/* Actions */}
        {onDownloadPDF && (
          <DropdownMenuItem
            onClick={() => {
              onDownloadPDF();
              setOpen(false);
            }}
          >
            <Download className="w-4 h-4 mr-2" /> Download PDF
          </DropdownMenuItem>
        )}

        {typeof creditsRemaining === 'number' &&
          (creditsRemaining === 0 ? (
            <DropdownMenuItem
              className="text-red-600 focus:text-red-700"
              onClick={() => {
                // Prefer opening the dialog; fallback to onBuyCredits
                if (onOpenCreditsDialog) onOpenCreditsDialog();
                else if (onBuyCredits) onBuyCredits();
                setOpen(false);
              }}
            >
              <AlertTriangle className="w-4 h-4 mr-2" /> Buy Credits
            </DropdownMenuItem>
          ) : (
            <DropdownMenuItem
              onClick={() => {
                if (onOpenCreditsDialog) onOpenCreditsDialog();
                setOpen(false);
              }}
            >
              <Zap className="w-4 h-4 mr-2" /> Credits
              <span className="ml-auto text-xs text-gray-500">
                {creditsRemaining}
              </span>
            </DropdownMenuItem>
          ))}

        {/* Auth */}
        {user && !isGuestSession ? (
          <>
            <DropdownMenuItem
              onClick={() => {
                try {
                  window.location.href = '/account';
                } catch {}
                setOpen(false);
              }}
            >
              <UserIcon className="w-4 h-4 mr-2" /> My Account
            </DropdownMenuItem>
            {onLogout && (
              <DropdownMenuItem
                className="text-red-600 focus:text-red-700"
                onClick={() => {
                  onLogout();
                  setOpen(false);
                }}
              >
                <LogOut className="w-4 h-4 mr-2" /> Sign Out
              </DropdownMenuItem>
            )}
          </>
        ) : (
          <DropdownMenuItem
            onClick={() => {
              if (onOpenLogin) onOpenLogin();
              setOpen(false);
            }}
          >
            <LogIn className="w-4 h-4 mr-2" /> Sign in
          </DropdownMenuItem>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

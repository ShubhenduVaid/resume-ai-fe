import React, { useEffect, useRef, useState } from 'react';

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from './ui/dialog';
import { Separator } from './ui/separator';
import { FileText, Loader2 } from 'lucide-react';
import GoogleSignInButton from '@/components/auth/GoogleSignInButton';
import LinkedInSignInButton from '@/components/auth/LinkedinSignInButton';

type LoginModalProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

export function LoginModal({ open, onOpenChange }: LoginModalProps) {
  const [commonWidth, setCommonWidth] = useState<number | undefined>(undefined);
  const buttonsRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const el = buttonsRef.current;
    if (!el) return;
    const update = () => setCommonWidth(el.clientWidth);
    update();
    const ro = new ResizeObserver(update);
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader className="text-center">
          <div className="w-16 h-16 bg-gradient-to-br from-blue-100 to-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <FileText className="w-8 h-8 text-blue-600" />
          </div>
          <DialogTitle className="text-2xl font-bold text-gray-900">
            Welcome to Resume Builder
          </DialogTitle>
          <DialogDescription className="text-gray-600 mt-2">
            Sign in to create, edit, and export your professional resume with AI
            assistance
          </DialogDescription>
        </DialogHeader>

        <div
          ref={buttonsRef}
          className="mt-6 space-y-3 w-full max-w-[400px] mx-auto"
        >
          <GoogleSignInButton widthPx={commonWidth} />
          <LinkedInSignInButton widthPx={commonWidth} />
        </div>

        <Separator className="my-6" />

        <div className="text-center">
          <p className="text-xs text-gray-500 leading-relaxed">
            By continuing, you agree to our{' '}
            <a href="#" className="text-blue-600 hover:underline">
              Terms of Service
            </a>{' '}
            and{' '}
            <a href="#" className="text-blue-600 hover:underline">
              Privacy Policy
            </a>
          </p>
        </div>

        {/* Features Preview */}
        <div className="mt-6 p-4 bg-gray-50 rounded-lg">
          <h4 className="text-sm font-medium text-gray-900 mb-3">
            What you&apos;ll get:
          </h4>
          <div className="space-y-2">
            <div className="flex items-center text-sm text-gray-600">
              <div className="w-1.5 h-1.5 bg-blue-600 rounded-full mr-3"></div>
              AI-powered resume builder and editor
            </div>
            <div className="flex items-center text-sm text-gray-600">
              <div className="w-1.5 h-1.5 bg-blue-600 rounded-full mr-3"></div>
              Professional templates and formatting
            </div>
            <div className="flex items-center text-sm text-gray-600">
              <div className="w-1.5 h-1.5 bg-blue-600 rounded-full mr-3"></div>
              Export to PDF and other formats
            </div>
            <div className="flex items-center text-sm text-gray-600">
              <div className="w-1.5 h-1.5 bg-blue-600 rounded-full mr-3"></div>
              ATS compatibility scoring
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

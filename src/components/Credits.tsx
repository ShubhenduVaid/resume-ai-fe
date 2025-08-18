import React, { useState } from 'react';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from './ui/dialog';
import { Zap, Sparkles, ArrowRight, Check, AlertTriangle } from 'lucide-react';

interface CreditsProps {
  creditsRemaining: number;
  onBuyCredits?: () => void;
  variant?: 'header' | 'sidebar' | 'inline';
  showLabel?: boolean;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
}

const creditPlans = [
  {
    id: 'starter',
    name: 'Starter Pack',
    credits: 50,
    price: '$4.99',
    popular: false,
    features: ['50 AI resume edits', 'PDF exports', 'ATS optimization'],
  },
  {
    id: 'professional',
    name: 'Professional',
    credits: 100,
    price: '$8.99',
    popular: true,
    features: [
      '200 AI resume edits',
      'Unlimited PDF exports',
      'Priority support',
      'Advanced ATS analysis',
    ],
  },
  {
    id: 'enterprise',
    name: 'Enterprise',
    credits: 400,
    price: '$14.99',
    popular: false,
    features: [
      '400 AI resume edits',
      'Team collaboration',
      'Custom templates',
      'API access',
    ],
  },
];

export function Credits({
  creditsRemaining,
  onBuyCredits,
  variant = 'header',
  showLabel = true,
  open,
  onOpenChange,
}: CreditsProps) {
  const [uncontrolledOpen, setUncontrolledOpen] = useState(false);
  const controlled =
    typeof open === 'boolean' && typeof onOpenChange === 'function';
  const dialogOpen = controlled ? (open as boolean) : uncontrolledOpen;
  const setDialogOpen = controlled
    ? (onOpenChange as (v: boolean) => void)
    : setUncontrolledOpen;

  const isLowCredits = creditsRemaining < 10;
  const isOutOfCredits = creditsRemaining === 0;

  const getCreditsColor = () => {
    if (isOutOfCredits) return 'text-red-600 bg-red-50 border-red-200';
    if (isLowCredits) return 'text-orange-600 bg-orange-50 border-orange-200';
    return 'text-emerald-600 bg-emerald-50 border-emerald-200';
  };

  const getCreditsIcon = () => {
    if (isOutOfCredits) return <AlertTriangle className="w-3 h-3" />;
    return <Zap className="w-3 h-3" />;
  };

  const handleBuyCredits = async (planId: string) => {
    try {
      if (process.env.NODE_ENV === 'development') {
        // Development mode - simulate purchase
        console.log('Development mode: Simulating purchase of plan:', planId);
        if (onBuyCredits) {
          onBuyCredits();
        }
        setDialogOpen(false);
        return;
      }

      // Production mode - integrate with payment processor
      const response = await fetch(
        `${process.env.REACT_APP_API_URL}/payments/create-checkout-session?plan=${planId}`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${localStorage.getItem('jwtToken')}`,
          },
        },
      );

      const session = await response.json();

      if (session.url) {
        // Redirect the user to the Stripe Checkout page
        window.location.href = session.url;
      } else {
        // Handle error
        console.error('Could not create Stripe checkout session.');
      }
    } catch (error) {
      console.error('Payment error:', error);
      // TODO: Show error toast notification
      // toast.error('Failed to initiate payment. Please try again.');
    }
  };

  if (variant === 'header') {
    return (
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogTrigger asChild>
          <Button
            variant="ghost"
            size="sm"
            className={`flex items-center gap-1.5 px-2 py-1.5 h-auto rounded-lg transition-colors ${
              isOutOfCredits
                ? 'bg-red-600 text-white hover:bg-red-700'
                : isLowCredits
                  ? 'bg-orange-600 text-white hover:bg-orange-700'
                  : 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border border-emerald-200'
            }`}
          >
            {getCreditsIcon()}
            <span className="text-xs font-medium">
              {isOutOfCredits ? 'Buy Credits' : creditsRemaining}
            </span>
          </Button>
        </DialogTrigger>

        <DialogContent className="sm:max-w-4xl max-w-[95vw] max-h-[95vh] p-0">
          <div className="bg-white rounded-lg overflow-hidden">
            {/* Header */}
            <div className="p-6 pb-4 border-b border-gray-200">
              <DialogHeader>
                <DialogTitle className="text-2xl font-bold text-gray-900 mb-2">
                  Choose Your Credit Plan
                </DialogTitle>
                <DialogDescription className="text-gray-600">
                  Unlock AI-powered resume editing with our flexible credit
                  packages
                </DialogDescription>
              </DialogHeader>
            </div>

            {/* Content - Scrollable */}
            <div className="overflow-y-auto max-h-[70vh]">
              <div className="p-6">
                {/* Plans Grid */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-stretch">
                  {creditPlans.map((plan) => (
                    <div
                      key={plan.id}
                      className={`relative p-6 border-2 rounded-xl bg-white h-full flex flex-col ${
                        plan.popular
                          ? 'border-blue-500 ring-2 ring-blue-100'
                          : 'border-gray-200'
                      }`}
                    >
                      {/* Popular Badge */}
                      {plan.popular && (
                        <div className="absolute -top-3 left-6">
                          <div className="bg-blue-600 text-white px-3 py-1 rounded-full text-sm font-medium flex items-center gap-1">
                            <Sparkles className="w-3 h-3" />
                            Most Popular
                          </div>
                        </div>
                      )}

                      {/* Plan Content */}
                      <div className="pt-2 flex flex-col h-full">
                        {/* Header */}
                        <div className="text-center mb-6">
                          <h3 className="text-xl font-bold text-gray-900 mb-2">
                            {plan.name}
                          </h3>
                          <div className="mb-3">
                            <span className="text-3xl font-bold text-gray-900">
                              {plan.price}
                            </span>
                            <span className="text-gray-500 ml-1">one-time</span>
                          </div>
                          <div className="inline-block bg-gray-100 text-gray-700 px-3 py-1 rounded-full text-sm font-medium">
                            {plan.credits} Credits
                          </div>
                        </div>

                        {/* Features */}
                        <ul className="space-y-3 mb-6 flex-1">
                          {plan.features.map((feature, index) => (
                            <li
                              key={index}
                              className="flex items-start gap-3 text-sm"
                            >
                              <Check className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                              <span className="text-gray-700">{feature}</span>
                            </li>
                          ))}
                        </ul>

                        {/* CTA Button */}
                        <Button
                          onClick={() => handleBuyCredits(plan.id)}
                          className={`w-full py-2.5 mt-auto ${
                            plan.popular
                              ? 'bg-blue-600 hover:bg-blue-700 text-white'
                              : 'bg-gray-900 hover:bg-gray-800 text-white'
                          }`}
                        >
                          Get Started
                          <ArrowRight className="w-4 h-4 ml-2" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Footer */}
              <div className="border-t border-gray-200 bg-gray-50 p-6">
                <div className="text-center">
                  <p className="text-sm text-gray-500 mb-3">
                    All plans include a 30-day money-back guarantee. No
                    subscription required.
                  </p>
                  <div className="flex items-center justify-center gap-6 text-xs text-gray-400">
                    <div className="flex items-center gap-1">
                      <Check className="w-3 h-3" />
                      <span>Secure Payment</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Check className="w-3 h-3" />
                      <span>Instant Access</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Check className="w-3 h-3" />
                      <span>No Monthly Fees</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  if (variant === 'sidebar') {
    return (
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 bg-green-500 rounded-full"></div>
          <span className="text-sm font-medium text-gray-900">
            Resume Assistant
          </span>
        </div>
        <Badge
          className={`font-medium border text-xs px-2 py-1 ${getCreditsColor()}`}
        >
          {getCreditsIcon()}
          <span className="ml-1">{creditsRemaining}</span>
        </Badge>
      </div>
    );
  }

  // inline variant
  return (
    <div className="flex items-center gap-2">
      <span className="text-sm text-gray-600">Credits remaining:</span>
      <Badge
        className={`font-medium border text-sm px-2 py-1 ${getCreditsColor()}`}
      >
        {getCreditsIcon()}
        <span className="ml-1">{creditsRemaining}</span>
      </Badge>
    </div>
  );
}

import React from 'react';
import { Badge } from './ui/badge';

interface ATSScoreProps {
  content: string;
  variant?: 'inline' | 'dropdown' | 'compact';
}

export function ATSScore({ content, variant = 'inline' }: ATSScoreProps) {
  const calculateATSScore = (markdown: string): number => {
    let score = 0;

    // Check for essential sections (more comprehensive)
    if (markdown.includes('##') || markdown.includes('#')) score += 15; // Has headers
    if (markdown.includes('@') && markdown.includes('.')) score += 15; // Has contact info
    if (
      markdown.toLowerCase().includes('github') ||
      markdown.toLowerCase().includes('linkedin')
    )
      score += 10; // Has professional links
    if (markdown.toLowerCase().includes('education')) score += 15; // Has education section
    if (
      markdown.toLowerCase().includes('experience') ||
      markdown.toLowerCase().includes('work')
    )
      score += 20; // Has experience
    if (markdown.toLowerCase().includes('skill')) score += 10; // Has skills
    if (markdown.toLowerCase().includes('project')) score += 5; // Has projects

    // Structure and content quality
    const wordCount = markdown.split(/\s+/).length;
    if (wordCount > 100) score += 5; // Adequate content
    if (wordCount > 300) score += 5; // Good content length
    if (wordCount > 500) score += 5; // Comprehensive content

    // Check for quantifiable achievements (numbers/percentages)
    const hasMetrics =
      /\d+[%+]|\d+\s*(years?|months?|million|thousand|k\b)/i.test(markdown);
    if (hasMetrics) score += 10;

    // Check for action verbs
    const actionVerbs = [
      'led',
      'managed',
      'developed',
      'created',
      'improved',
      'increased',
      'decreased',
      'achieved',
      'delivered',
    ];
    const hasActionVerbs = actionVerbs.some((verb) =>
      markdown.toLowerCase().includes(verb),
    );
    if (hasActionVerbs) score += 5;

    return Math.min(100, score);
  };

  const score = calculateATSScore(content);

  const getScoreColor = (score: number) => {
    if (score >= 85) return 'text-emerald-600 bg-emerald-50 border-emerald-200';
    if (score >= 70) return 'text-yellow-600 bg-yellow-50 border-yellow-200';
    if (score >= 50) return 'text-orange-600 bg-orange-50 border-orange-200';
    return 'text-red-600 bg-red-50 border-red-200';
  };

  const getScoreLabel = (score: number) => {
    if (score >= 85) return 'Excellent';
    if (score >= 70) return 'Good';
    if (score >= 50) return 'Fair';
    return 'Needs Work';
  };

  const getScoreDescription = (score: number) => {
    if (score >= 85) return 'ATS-optimized with strong keywords and structure';
    if (score >= 70) return 'Good ATS compatibility with room for improvement';
    if (score >= 50) return 'Moderate ATS score, consider adding more details';
    return 'Low ATS score, needs significant improvements';
  };

  if (variant === 'compact') {
    return (
      <Badge
        className={`font-medium border ${getScoreColor(score)} text-xs px-2 py-1`}
      >
        {score}/100
      </Badge>
    );
  }

  if (variant === 'dropdown') {
    return (
      <div className="space-y-2">
        <div className="flex items-center gap-2">
          <Badge
            className={`font-medium border ${getScoreColor(score)} text-xs px-2 py-1`}
          >
            {score}/100
          </Badge>
          <span className="text-sm font-medium text-gray-900">
            {getScoreLabel(score)}
          </span>
        </div>
        <p className="text-xs text-gray-600 leading-relaxed">
          {getScoreDescription(score)}
        </p>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-2">
      <Badge
        className={`font-medium border ${getScoreColor(score)} text-xs px-2 py-1`}
      >
        {score}/100
      </Badge>
      <div className="flex flex-col">
        <span className="text-xs font-medium text-gray-900">
          {getScoreLabel(score)}
        </span>
        <span className="text-xs text-gray-500 max-w-48 truncate">
          {getScoreDescription(score)}
        </span>
      </div>
    </div>
  );
}

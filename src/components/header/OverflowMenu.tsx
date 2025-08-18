import React from 'react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { MoreHorizontal, Zap } from 'lucide-react';
import { ATSScore } from '@/components/ATSScore';

export type OverflowMenuProps = {
  content: string;
};

export function OverflowMenu({ content }: OverflowMenuProps) {
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
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

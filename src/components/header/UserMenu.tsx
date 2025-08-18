'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { LogOut, Settings, User as UserIcon } from 'lucide-react';
import type { User } from '@/types';

export type UserMenuProps = {
  user: User;
  onLogout?: () => void;
};

export function UserMenu({ user, onLogout }: UserMenuProps) {
  const router = useRouter();
  const initials = (user.name || user.email || 'User')
    .split(' ')
    .map((n) => n[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="sm"
          className="text-gray-700 hover:text-gray-900 hover:bg-gray-100 p-1.5 h-auto rounded-full"
          aria-label="Open user menu"
          title="Account"
        >
          <Avatar className="w-6 h-6">
            {user.avatar ? (
              <AvatarImage src={user.avatar} alt={user.name || user.email} />
            ) : (
              <AvatarFallback className="text-xs bg-blue-100 text-blue-700">
                {initials}
              </AvatarFallback>
            )}
          </Avatar>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        align="end"
        sideOffset={8}
        className="w-64 mr-4"
        avoidCollisions={true}
        collisionPadding={16}
      >
        {/* User Info */}
        <div className="px-3 py-3">
          <div className="flex items-center gap-3 mb-2">
            <Avatar className="w-8 h-8">
              {user.avatar ? (
                <AvatarImage src={user.avatar} alt={user.name || user.email} />
              ) : (
                <AvatarFallback className="bg-blue-100 text-blue-700">
                  {initials}
                </AvatarFallback>
              )}
            </Avatar>
            <div className="min-w-0 flex-1">
              <p className="text-sm font-medium text-gray-900 truncate">
                {user.name || user.email}
              </p>
              <p className="text-xs text-gray-500 truncate">{user.email}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <div className="text-xs text-gray-500">Signed in with</div>
            <div className="flex items-center gap-1">
              {user.provider === 'google' && (
                <>
                  <svg className="w-3 h-3" viewBox="0 0 24 24">
                    <path
                      fill="#4285F4"
                      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                    />
                    <path
                      fill="#34A853"
                      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                    />
                    <path
                      fill="#FBBC05"
                      d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                    />
                    <path
                      fill="#EA4335"
                      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                    />
                  </svg>
                  <span className="text-xs text-gray-600 font-medium">
                    Google
                  </span>
                </>
              )}
              {user.provider === 'apple' && (
                <>
                  <svg
                    className="w-3 h-3"
                    viewBox="0 0 24 24"
                    fill="currentColor"
                  >
                    <path d="M12.017 2.04c.559-.055 1.113.001 1.543.32.336.248.56.634.696 1.03.074.22.111.45.111.682-.002.186-.025.372-.067.554-.166.756-.553 1.37-1.094 1.83-.506.431-1.14.668-1.795.65-.049-.35-.002-.706.133-1.033.237-.588.65-1.096 1.15-1.447.427-.298.927-.477 1.453-.506.006-.1.01-.201.014-.302.003-.133.005-.267.005-.401 0-.204-.014-.407-.042-.608-.046-.33-.134-.654-.257-.959-.25-.622-.655-1.145-1.185-1.52-.45-.318-.967-.504-1.508-.552-.165-.015-.331-.021-.497-.02-.144.001-.288.007-.432.017-.35.024-.693.089-1.022.19-.634.196-1.206.55-1.68 1.03-.472.477-.826 1.048-1.022 1.68-.101.329-.166.672-.19 1.022-.01.144-.016.288-.017.432-.001.166.005.332.02.497.048.541.234 1.058.552 1.508.375.53.898.935 1.52 1.185.305.123.629.211.959.257.201.028.404.042.608.042.134 0 .268-.002.401-.005.101-.004.201-.008.302-.014.029-.541.208-1.041.506-1.468.351-.5.859-.913 1.447-1.15.327-.135.683-.182 1.033-.133-.018.655-.219 1.289-.65 1.795-.46.541-1.074.928-1.83 1.094-.182.042-.368.065-.554.067-.232 0-.462-.037-.682-.111-.396-.136-.782-.36-1.03-.696-.319-.43-.375-.984-.32-1.543z" />
                  </svg>
                  <span className="text-xs text-gray-600 font-medium">
                    Apple
                  </span>
                </>
              )}
              {user.provider === 'linkedin' && (
                <>
                  <svg
                    className="w-3 h-3 text-blue-600"
                    viewBox="0 0 24 24"
                    fill="currentColor"
                  >
                    <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
                  </svg>
                  <span className="text-xs text-gray-600 font-medium">
                    LinkedIn
                  </span>
                </>
              )}
            </div>
          </div>
        </div>

        <DropdownMenuSeparator />

        <DropdownMenuItem onClick={() => router.push('/account')}>
          <UserIcon className="w-4 h-4 mr-2" />
          My Account
        </DropdownMenuItem>

        <DropdownMenuItem onClick={() => router.push('/settings')}>
          <Settings className="w-4 h-4 mr-2" />
          Settings
        </DropdownMenuItem>

        <DropdownMenuSeparator />

        {onLogout && (
          <DropdownMenuItem
            onClick={onLogout}
            className="text-red-600 focus:text-red-700"
          >
            <LogOut className="w-4 h-4 mr-2" />
            Sign Out
          </DropdownMenuItem>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

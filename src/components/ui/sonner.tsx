'use client';

import { useEffect, useMemo, useState } from 'react';
import { useTheme } from 'next-themes';
import { Toaster as Sonner, ToasterProps, toast as sonnerToast } from 'sonner';

type ExtendedToasterProps = ToasterProps & {
  desktopPosition?: ToasterProps['position'];
  mobilePosition?: ToasterProps['position'];
};

const Toaster = ({
  desktopPosition = 'bottom-center',
  mobilePosition = 'bottom-center',
  position: _ignored,
  ...props
}: ExtendedToasterProps) => {
  const { theme = 'system' } = useTheme();

  const [position, setPosition] =
    useState<ToasterProps['position']>(desktopPosition);

  useEffect(() => {
    const media = window.matchMedia('(max-width: 768px)');
    const update = () =>
      setPosition(media.matches ? mobilePosition : desktopPosition);
    update();
    media.addEventListener
      ? media.addEventListener('change', update)
      : media.addListener(update);
    return () => {
      media.removeEventListener
        ? media.removeEventListener('change', update)
        : media.removeListener(update);
    };
  }, [desktopPosition, mobilePosition]);

  const style = useMemo(
    () =>
      ({
        '--normal-bg': 'var(--popover)',
        '--normal-text': 'var(--popover-foreground)',
        '--normal-border': 'var(--border)',
      }) as React.CSSProperties,
    [],
  );

  return (
    <Sonner
      theme={theme as ToasterProps['theme']}
      position={position}
      className="toaster group"
      style={style}
      {...props}
    />
  );
};

export { Toaster };
export const toast = sonnerToast;

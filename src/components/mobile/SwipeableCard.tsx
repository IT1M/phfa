'use client';

import { ReactNode } from 'react';
import { useSwipeGesture } from '@/hooks/useSwipeGesture';

interface SwipeableCardProps {
  children: ReactNode;
  onSwipeLeft?: () => void;
  onSwipeRight?: () => void;
  className?: string;
}

export default function SwipeableCard({
  children,
  onSwipeLeft,
  onSwipeRight,
  className = '',
}: SwipeableCardProps) {
  const swipeHandlers = useSwipeGesture({
    onSwipeLeft,
    onSwipeRight,
    threshold: 100,
  });

  return (
    <div
      className={`touch-pan-y ${className}`}
      onTouchStart={swipeHandlers.onTouchStart}
      onTouchMove={swipeHandlers.onTouchMove}
      onTouchEnd={swipeHandlers.onTouchEnd}
    >
      {children}
    </div>
  );
}

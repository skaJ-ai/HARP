/**
 * Button component — 하네스 규칙 준수 예시
 *
 * 이 파일은 CLAUDE.md의 모든 Front Guard 규칙을 준수하는 참조 구현입니다:
 * - 파일명: kebab-case (button.tsx)
 * - Named export only (no default export)
 * - Props interface: {Component}Props 패턴
 * - Boolean prop: is* 접두사
 * - Event handler: handle* (내부), on* (props)
 * - No inline anonymous functions in JSX
 * - Import order: 5-group rule
 * - Explicit types everywhere
 */

import type { ReactNode } from 'react';

import { clsx } from 'clsx';

type ButtonVariant = 'primary' | 'secondary' | 'ghost';
type ButtonSize = 'sm' | 'md' | 'lg';

interface ButtonProps {
  children: ReactNode;
  variant?: ButtonVariant;
  size?: ButtonSize;
  isDisabled?: boolean;
  isLoading?: boolean;
  onClick?: () => void;
  type?: 'button' | 'submit' | 'reset';
}

const SIZE_CLASSES: Record<ButtonSize, string> = {
  sm: 'px-3 py-1.5 text-sm',
  md: 'px-4 py-2 text-base',
  lg: 'px-6 py-3 text-lg',
};

const VARIANT_CLASSES: Record<ButtonVariant, string> = {
  ghost: 'bg-transparent text-gray-700 hover:bg-gray-100',
  primary: 'bg-blue-600 text-white hover:bg-blue-700',
  secondary: 'bg-gray-200 text-gray-800 hover:bg-gray-300',
};

function Button({
  children,
  variant = 'primary',
  size = 'md',
  isDisabled = false,
  isLoading = false,
  onClick,
  type = 'button',
}: ButtonProps) {
  const handleClick = () => {
    if (!isDisabled && !isLoading && onClick) {
      onClick();
    }
  };

  return (
    <button
      className={clsx(
        'inline-flex items-center justify-center rounded-md font-medium transition-colors',
        'focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2',
        SIZE_CLASSES[size],
        VARIANT_CLASSES[variant],
        { 'cursor-not-allowed opacity-50': isDisabled || isLoading },
      )}
      disabled={isDisabled || isLoading}
      onClick={handleClick}
      type={type}
    >
      {isLoading ? <span aria-label="Loading">...</span> : null}
      {children}
    </button>
  );
}

export { Button };
export type { ButtonProps, ButtonSize, ButtonVariant };

import { ReactNode } from 'react'

interface CardProps {
  children: ReactNode
  className?: string
  padding?: 'none' | 'sm' | 'md' | 'lg'
}

export const Card = ({
  children,
  className = '',
  padding = 'md',
}: CardProps) => {
  const paddingStyles = {
    none: '',
    sm: 'p-4',
    md: 'p-6',
    lg: 'p-8',
  }

  return (
    <div
      className={`bg-white rounded-lg border border-zinc-200 ${paddingStyles[padding]} ${className} dark:bg-zinc-900 dark:border-zinc-800`}
    >
      {children}
    </div>
  )
}

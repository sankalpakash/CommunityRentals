import { HTMLAttributes } from 'react'

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  variant?: 'default' | 'bordered' | 'elevated'
}

export default function Card({
  children,
  variant = 'default',
  className = '',
  ...props
}: CardProps) {
  const variantClasses = {
    default: 'bg-white rounded-lg shadow-md',
    bordered: 'bg-white rounded-lg border border-gray-200',
    elevated: 'bg-white rounded-lg shadow-lg',
  }

  return (
    <div
      className={`${variantClasses[variant]} ${className}`}
      {...props}
    >
      {children}
    </div>
  )
}

export function CardHeader({
  children,
  className = '',
  ...props
}: HTMLAttributes<HTMLDivElement>) {
  return (
    <div className={`px-6 py-4 border-b border-gray-200 ${className}`} {...props}>
      {children}
    </div>
  )
}

export function CardBody({
  children,
  className = '',
  ...props
}: HTMLAttributes<HTMLDivElement>) {
  return (
    <div className={`px-6 py-4 ${className}`} {...props}>
      {children}
    </div>
  )
}

export function CardFooter({
  children,
  className = '',
  ...props
}: HTMLAttributes<HTMLDivElement>) {
  return (
    <div className={`px-6 py-4 border-t border-gray-200 ${className}`} {...props}>
      {children}
    </div>
  )
}

import { FC, ButtonHTMLAttributes, ReactNode } from 'react'
import { Loader2 } from 'lucide-react'

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger'
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl'
  fullWidth?: boolean
  loading?: boolean
  leftIcon?: ReactNode
  rightIcon?: ReactNode
}

const Button: FC<ButtonProps> = ({
  children,
  variant = 'primary',
  size = 'md',
  fullWidth = false,
  loading = false,
  leftIcon,
  rightIcon,
  className = '',
  disabled,
  children: _,
  ...props
}) => {
  const baseClasses = 'btn-interactive inline-flex items-center justify-center font-semibold transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed select-none'

  const variantClasses = {
    primary: 'bg-brand text-brand-foreground hover:bg-brand-hover focus:ring-brand shadow-md hover:shadow-lg active:shadow-md',
    secondary: 'bg-accent text-white hover:bg-accent-hover focus:ring-accent shadow-md hover:shadow-lg active:shadow-md',
    ghost: 'bg-transparent border-2 border-border text-foreground hover:bg-muted hover:border-muted-foreground/30 focus:ring-muted-foreground',
    danger: 'bg-error text-white hover:bg-error/90 focus:ring-error shadow-md hover:shadow-lg active:shadow-md',
  }[variant]

  const sizeClasses = {
    xs: 'px-3 py-1.5 text-xs rounded-md gap-1.5',
    sm: 'px-4 py-2 text-sm rounded-lg gap-2',
    md: 'px-5 py-2.5 text-base rounded-lg gap-2',
    lg: 'px-6 py-3 text-lg rounded-xl gap-2.5',
    xl: 'px-8 py-4 text-xl rounded-xl gap-3',
  }[size]

  return (
    <button
      className={`${baseClasses} ${variantClasses} ${sizeClasses} ${fullWidth ? 'w-full' : ''} ${className}`}
      disabled={disabled || loading}
      {...props}
    >
      {loading ? (
        <>
          <Loader2 className="w-4 h-4 animate-spin" />
          <span>Loading...</span>
        </>
      ) : (
        <>
          {leftIcon}
          {children}
          {rightIcon}
        </>
      )}
    </button>
  )
}

export default Button

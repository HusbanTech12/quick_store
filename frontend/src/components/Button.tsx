import { FC, ButtonHTMLAttributes, ReactNode } from 'react'
import { Loader2 } from 'lucide-react'

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger' | 'premium'
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
  const baseClasses = 'btn-interactive inline-flex items-center justify-center font-semibold transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed select-none relative overflow-hidden'

  const variantClasses = {
    primary: 'bg-gradient-to-r from-blue-600 via-blue-500 to-cyan-500 dark:from-blue-500 dark:via-blue-400 dark:to-cyan-400 text-white hover:from-blue-700 hover:via-blue-600 hover:to-cyan-600 dark:hover:from-blue-600 dark:hover:via-blue-500 dark:hover:to-cyan-500 focus:ring-blue-500 shadow-lg hover:shadow-xl hover:shadow-cyan-500/40 dark:shadow-lg dark:hover:shadow-cyan-400/60 active:shadow-md hover:-translate-y-0.5 bg-[length:200%_auto]',
    secondary: 'bg-gradient-to-r from-emerald-600 via-green-600 to-teal-600 dark:from-emerald-400 dark:via-green-400 dark:to-teal-400 text-white hover:from-emerald-700 hover:via-green-700 hover:to-teal-700 dark:hover:from-emerald-500 dark:hover:via-green-500 dark:hover:to-teal-500 focus:ring-emerald-500 shadow-lg hover:shadow-xl hover:shadow-emerald-500/40 dark:shadow-lg dark:hover:shadow-emerald-400/60 active:shadow-md hover:-translate-y-0.5 bg-[length:200%_auto]',
    ghost: 'bg-transparent dark:bg-white/5 border-2 border-slate-300 dark:border-white/30 text-slate-800 dark:text-white hover:bg-slate-100 dark:hover:bg-white/15 hover:border-slate-400 dark:hover:border-white/50 focus:ring-slate-400 dark:focus:ring-white/50 shadow-sm dark:shadow-none hover:shadow-md dark:hover:shadow-lg hover:-translate-y-0.5',
    danger: 'bg-gradient-to-r from-red-600 via-rose-600 to-pink-600 dark:from-red-400 dark:via-rose-400 dark:to-pink-400 text-white hover:from-red-700 hover:via-rose-700 hover:to-pink-700 dark:hover:from-red-500 dark:hover:via-rose-500 dark:hover:to-pink-500 focus:ring-red-500 shadow-lg hover:shadow-xl hover:shadow-rose-500/40 dark:shadow-lg dark:hover:shadow-rose-400/60 active:shadow-md hover:-translate-y-0.5 bg-[length:200%_auto]',
    premium: 'bg-gradient-to-r from-violet-600 via-purple-600 to-fuchsia-600 dark:from-violet-500 dark:via-purple-500 dark:to-fuchsia-400 text-white hover:from-violet-700 hover:via-purple-700 hover:to-fuchsia-700 dark:hover:from-violet-600 dark:hover:via-purple-600 dark:hover:to-fuchsia-500 focus:ring-purple-500 shadow-xl hover:shadow-2xl hover:shadow-purple-500/50 dark:shadow-xl dark:hover:shadow-purple-400/70 active:shadow-lg hover:-translate-y-1 bg-[length:200%_auto] animate-gradient',
  }[variant]

  const sizeClasses = {
    xs: 'px-3 py-1.5 text-xs rounded-md gap-1.5',
    sm: 'px-4 py-2 text-sm rounded-lg gap-2',
    md: 'px-5 py-2.5 text-base rounded-lg gap-2.5',
    lg: 'px-6 py-3 text-lg rounded-xl gap-3',
    xl: 'px-8 py-4 text-xl rounded-xl gap-3.5',
  }[size]

  return (
    <button
      className={`${baseClasses} ${variantClasses} ${sizeClasses} ${fullWidth ? 'w-full' : ''} ${className}`}
      disabled={disabled || loading}
      {...props}
    >
      {/* Shimmer Effect for Premium Variant */}
      {variant === 'premium' && !loading && (
        <div className="absolute inset-0 opacity-0 hover:opacity-30 transition-opacity duration-300 pointer-events-none">
          <div className="w-full h-full animate-shimmer" />
        </div>
      )}
      
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

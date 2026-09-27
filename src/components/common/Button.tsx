import { Link } from 'react-router-dom'
import { cn } from '@/lib/utils'

type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'outline'
type ButtonSize = 'sm' | 'md' | 'lg'

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant
  size?: ButtonSize
  href?: string
  to?: string
}

const variants: Record<ButtonVariant, string> = {
  primary:
    'bg-gold text-bg hover:bg-gold-light shadow-[0_8px_24px_rgba(212,175,55,0.25)] border border-transparent',
  secondary:
    'bg-transparent text-cream border border-gold/40 hover:border-gold hover:bg-gold/10',
  ghost: 'bg-transparent text-cream hover:bg-white/5',
  outline: 'bg-transparent text-gold border border-gold/50 hover:bg-gold/10',
}

const sizes: Record<ButtonSize, string> = {
  sm: 'px-4 py-2 text-sm',
  md: 'px-6 py-3 text-sm',
  lg: 'px-8 py-3.5 text-base',
}

export function Button({
  variant = 'primary',
  size = 'md',
  className,
  href,
  to,
  children,
  ...props
}: ButtonProps) {
  const classes = cn(
    'inline-flex items-center justify-center gap-2 rounded-sm font-medium tracking-wide transition-all duration-300 hover:-translate-y-0.5 active:translate-y-0 disabled:opacity-50 disabled:pointer-events-none disabled:hover:translate-y-0',
    variants[variant],
    sizes[size],
    className,
  )

  if (to) {
    return (
      <Link to={to} className={classes}>
        {children}
      </Link>
    )
  }

  if (href) {
    return (
      <a href={href} className={classes}>
        {children}
      </a>
    )
  }

  return (
    <button type="button" className={classes} {...props}>
      {children}
    </button>
  )
}

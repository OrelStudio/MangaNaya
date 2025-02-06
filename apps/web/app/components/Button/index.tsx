import styles from './Button.module.scss'

interface ButtonProps {
  type?: 'button' | 'submit' | 'reset'
  children: React.ReactNode
  onClick?: () => void
  className?: string
}

const Button = ({children, onClick, className, ...props}: ButtonProps) => {
  return (
    <button className={`${styles.button} ${className || ''}`} role='button' onClick={onClick} {...props}>
      {children}
    </button>
  )
}

export default Button
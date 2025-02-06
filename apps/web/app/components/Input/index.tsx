import React, {forwardRef} from 'react'
import styles from './Input.module.scss'

interface InputProps {
  type?: string
  name?: string
  required?: boolean
  placeholder?: string
  value?: string
  icon?: React.ReactNode
  // eslint-disable-next-line no-unused-vars
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void
}

const Input = ({value, onChange, ...props}: InputProps, ref: React.Ref<HTMLInputElement>) => {
  return (
    <div className={styles.wrapper}>
      {props.icon ? (
        <div className={styles.icon}>
          {props.icon}
        </div>
      ) : null}
      <input
        className={styles.input}
        value={value}
        onChange={onChange}
        type={props.type || 'text'}
        name={props.name || ''}
        required={props.required || false}
        placeholder={props.placeholder || ''}
        ref={ref}
      />
    </div>
  )
}

export default forwardRef(Input)
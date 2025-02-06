'use client'

import {useCallback} from 'react'
import {redirect} from 'next/navigation'
import axios from 'axios'
import {UserOutlined, LockFilled, MailOutlined, TeamOutlined} from '@ant-design/icons'

import Input from '../Input'
import Button from '../Button'

import styles from './AuthForm.module.scss'

type FieldsData = {
  username: string
  password: string
  email?: string
  nickname?: string
}

interface AuthFormProps {
  mode: 'signin' | 'signup'
  // onSubmit: (data: FieldsData) => void
}

const AuthForm = ({mode}: AuthFormProps) => {
  const onSubmitHandler = useCallback((event: React.FormEvent) => {
    event.preventDefault(); // Prevent the default form submission behavior
    const formData = new FormData(event.target as HTMLFormElement);
    console.log(formData.get('username'))
    console.log(formData.get('password'))

    const data: FieldsData = {
      username: formData.get('username') as string || '',
      password: formData.get('password') as string || '',

      ...(mode === 'signup' && {
        email: formData.get('email') as string || '',
        nickname: formData.get('nickname') as string || ''
      })
    }

    axios.post(`http://api:8080/auth/${mode}`, data, {withCredentials: true}).then((response) => {
      // get the cookie called Authorization from the response
      console.log(response)
      // onSubmit(data)
    })

    redirect('/')
  }, [])

  return (
    <div className={styles.form}>
      <form onSubmit={onSubmitHandler}>
        {/* Form fields */}
        <div className={styles.inputs}>
          
          <Input type='username' name='username' required placeholder='Username' icon={<UserOutlined />} />
          {mode === 'signup' && (
            <>
              
              <Input type='text' name='email' placeholder='Email' required icon={<MailOutlined />} />
              
              <Input type='nickname' name='nickname' placeholder='Nickname' required icon={<TeamOutlined />} />
            </>
          )}
          
          <Input type='password' name='password' placeholder='Password' required icon={<LockFilled />} />
        </div>
        {/* Submit button */}
        <div className={styles.submit}>
          <Button type='submit'>{mode === 'signin' ? 'Sign In' : 'Sign Up'}</Button>
        </div>
      </form>
    </div>
  )
}

export default AuthForm
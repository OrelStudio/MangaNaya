'use client'

import {useEffect} from 'react'
import Link from 'next/link'
import {redirect} from 'next/navigation'
import axios from 'axios'
import {Button} from 'antd'
import {GoogleIcon} from '../components/Icon'

import getGoogleOAuthUrl from '../utils/getGoogleUrl'

import styles from './SignIn.module.scss'

const SignIn = () => {
  useEffect(() => {
    // eslint-disable-next-line no-unused-vars
    axios.get(`${process.env.API_URL}/me`, {withCredentials: true}).then(res => {
      redirect('/')
    })
  }, [])

  return (
    <div className={styles.wrapper}>
      <div className={styles.title}>
        <span>Welcome to MangaNaya</span>
      </div>
      <Link href={getGoogleOAuthUrl()} passHref>
        <Button
          size='large'
          icon={<GoogleIcon />}
          shape='round'
          className={styles.button}
        >
          Sign in with Google
        </Button>
      </Link>
    </div>
  )
}

export default SignIn
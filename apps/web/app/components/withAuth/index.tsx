'use client'

import React, {useEffect, useState} from 'react'
import {redirect} from 'next/navigation'
import axios from 'axios'

import type {UserType} from '@manga-naya/types'

const withAuth: <P extends object>(Component: React.ComponentType<P & {user: UserType}>) => React.FC<P> = (Component) => {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const wrapped = (props: any) => {
    const [user, setUser] = useState<UserType | null>(null)
    
    useEffect(() => {
      axios.get(`${process.env.API_URL}/me`, {withCredentials: true}).then(res => {
        setUser(res.data.user)
      }).catch(() => {
        redirect('/signin')
      })
    }, [])

    if (!user) {
      return null
    }

    return <Component {...props} user={user} />
  }

  return wrapped
}

export default withAuth
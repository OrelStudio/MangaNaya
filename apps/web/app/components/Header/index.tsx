'use client'
import {useMemo} from 'react'
import Link from 'next/link'
import Image from 'next/image'
import {Dropdown, ConfigProvider} from 'antd'
import Button from '../Button'
import {
  HouseOutlined,
  HouseFilled,
  MagnifyingGlassBold,
  MagnifyingGlassThin,
  BookmarkOutlined,
  BookmarkFilled,
  StarOutlined,
  StarFilled
} from '../Icon'

import {UserType} from '@manga-naya/types'

import styles from './Header.module.scss'
import getLogoutUrl from '../../utils/getLogoutUrl'

interface HeaderProps {
  user: UserType
  page?: string
}

const Header = ({user, page}: HeaderProps) => {
  const navItems = useMemo(() => [
    {
      page: 'explore',
      value: 'Explore',
      link: '/',
      icon: {
        outlined: <HouseOutlined />,
        filled: <HouseFilled />
      }
    },
    {
      page: 'browse',
      value: 'Browse',
      link: '/browse',
      icon: {
        outlined: <MagnifyingGlassThin />,
        filled: <MagnifyingGlassBold />
      }
    },
    {
      page: 'reading',
      value: 'Reading List',
      link: '/me/reading',
      icon: {
        outlined: <BookmarkOutlined />,
        filled: <BookmarkFilled />
      }
    },
    {
      page: 'favorites',
      value: 'Favorites',
      link: '/me/favorites',
      icon: {
        outlined: <StarOutlined />,
        filled: <StarFilled />
      }
    }
  ], [])

  const items = useMemo(() => [
  {
    label: (
      <Link href='/me/profile'>
        <span>Profile</span>
      </Link>
    ),
    key: '0',
  },
  {
    label: (
      <Link href='/me/favorites'>
        <span>Favorites</span>
      </Link>
    ),
    key: '1',
  },
  {
    label: (
      <Link href='/me/reading'>
        <span>Reading List</span>
      </Link>
    ),
    key: '2',
  },
  {
    label: (
      <Link href={getLogoutUrl()}>
        <Button className={styles.logout}>Logout</Button>
      </Link>
    ),
    key: '3',
  },
  ], [])

  return (
    <div className={styles.header}>
      <div className={styles.title}>
        <span>MangaNaya</span>
      </div>

      <div className={styles.navigation}>
        {navItems.map((item, i) => (
          <Link href={item.link} key={i}>
            <div className={`${styles.navItem} ${page === item.page ? styles.active : ''}`}>
              <div className={styles.icon}>
                {page === item.page ? item.icon.filled : item.icon.outlined}
              </div>
              <div className={styles.val}>
                {item.value}
              </div>
            </div>
          </Link>
        ))}
      </div>
      
      <ConfigProvider
        theme={{
          components: {
            Dropdown: {
              colorBgElevated: 'var(--primary)',
              colorText: 'var(--text)',
              controlItemBgHover: 'rgba(0, 0, 0, 0.2)',
            }
          }
        }}
      >
        <Dropdown menu={{items}} trigger={['click']}>
          <div className={styles.dropdown}>
            {user && (
              <div className={styles.avatar}>
                {user.picture ? (
                  <Image src={user.picture} alt={user.name} width={40} height={40} />
                ) : (
                  <>{user.name.slice(0, 2)}</>
                )}
              </div>
            )}
          </div>
        </Dropdown>
      </ConfigProvider>
    </div>
  )
}

export default Header
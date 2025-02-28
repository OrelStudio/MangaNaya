import {useCallback} from 'react'
import {useRouter} from 'next/navigation'
import Link from 'next/link'
import {ConfigProvider, Select, Button} from 'antd'
import {CaretLeftOutlined, CaretRightOutlined} from '@ant-design/icons'

import type {ChapterTypeWeb} from '@manga-naya/types'

import styles from './Read.module.scss'

interface ChapterControlsProps {
  currentChapter: number
  previousChapter: ChapterTypeWeb
  nextChapter: ChapterTypeWeb,
  chaptersOptions: {label: string, value: number, number: number}[]
  isLoading: boolean
}

const ChapterControls = ({currentChapter, previousChapter, nextChapter, chaptersOptions, isLoading}: ChapterControlsProps) => {
  const router = useRouter()

  const onChange = useCallback((value: string) => {
    router.push(`/read?id=${value}`)
  }, [])

  return (
    <div className={styles.pagination}>
      <ConfigProvider
        theme={{
          components: {
            Select: {
              selectorBg: 'var(--strong)',
              optionSelectedBg: 'var(--primary)',
              multipleItemColorDisabled: 'var(--disabled-text)',
              hoverBorderColor: 'var(--primary)',
              activeBorderColor: 'var(--primary)',
              activeOutlineColor: 'var(--text)',
              multipleItemBorderColor: 'var(--stong)',
              optionSelectedColor: 'var(--text)',
              colorText: 'var(--text)',
              colorTextPlaceholder: 'var(--text)'
            }
          }
        }}
      >
        
        {currentChapter && chaptersOptions.length > 0 && (
          <div className={styles.controls}>
            {previousChapter && (
              <Link href={`/read?id=${previousChapter.id}`}>
                <Button shape='circle' icon={<CaretLeftOutlined />} />
              </Link>
            )}
            <div className={styles.selectWrapper}>
              <span style={{fontFamily: 'sans-serif'}}>{'Select Chapter'}</span>
              <Select
                showSearch
                placeholder="Select chapter"
                optionFilterProp="label"
                className={styles.select}
                dropdownStyle={{backgroundColor: 'var(--strong)'}}
                onChange={onChange}
                options={chaptersOptions}
                value={`Chapter ${currentChapter}`}
              />
            </div>
            {nextChapter && (
              <Link href={`/read?id=${nextChapter.id}`}>
                <Button shape='circle' icon={<CaretRightOutlined />} />
              </Link>
            )}
            
          </div>
        )}
      </ConfigProvider>
    </div>
  )
}

export default ChapterControls
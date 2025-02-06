import React, {useRef, PropsWithChildren, useState, useEffect, useCallback} from 'react'
import {motion} from 'framer-motion'
import useMeasure from 'react-use-measure'
import {ChevronRight, ChevronLeft} from '../components/Icon'

import styles from './Carousel.module.scss'

interface CarouselProps extends PropsWithChildren {}

export default function Carousel({ children }: CarouselProps) {
  const [containerRef, containerBounds] = useMeasure()
  const [isBig, setIsBig] = useState(false)
  const scrollRef = useRef<HTMLDivElement | null>(null)

  const items = React.Children.toArray(children)

  useEffect(() => {
    // Check if the container is bigger than the viewport width
    setIsBig((containerBounds.width + 200) > window.innerWidth)
  }, [containerBounds.width])

  const scrollLeft = useCallback(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollBy({ left: -200, behavior: 'smooth' })
    }
  }, [])

  const scrollRight = useCallback(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollBy({ left: 200, behavior: 'smooth' })
    }
  }, [])

  return (
    <div className={styles.carouselWrapper}>
      {/* Left arrow button */}
      {isBig && (
        <button onClick={scrollLeft} className={styles.arrowLeft}>
          <ChevronLeft />
        </button>
      )}

      <div style={{width: '100%'}}>
        <motion.div
          className={styles.carouselContainer}
          ref={scrollRef}
        >
          {/* Original items */}
          <div ref={containerRef} className={styles.itemsWrapper}>
            {items.map((child, idx) => (
              <div key={`original-${idx}`} className={styles.item}>
                {child}
              </div>
            ))}
            {!items.length && (
              <div className={styles.empty}>
                <span>No Mangas Available</span>
              </div>
            )}
          </div>
        </motion.div>
      </div>

      {/* Right arrow button */}
      {isBig && (
        <button onClick={scrollRight} className={styles.arrowRight}>
          <ChevronRight />
        </button>
      )}
    </div>
  )
}

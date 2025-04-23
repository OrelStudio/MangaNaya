import styles from './Genres.module.scss'

interface GenresProps {
  genres: string[]
}

const Genres = ({genres}: GenresProps) => {
  return (
    <div className={styles.wrapper}>
      {genres && genres.map((genre, i) => (
        i < 2 ? <div className={styles.genre} key={genre}>{genre}</div> : null
      ))}
      {!genres && (
        <div className={styles.empty}>Empty</div>
      )}
    </div>
  )
}

export default Genres
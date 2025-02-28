import type {Metadata} from 'next'
import localFont from 'next/font/local'
import {ApolloWrapper} from './ApolloWrapper'

import './globals.scss'

const geistSans = localFont({
  src: './fonts/GeistVF.woff',
  variable: '--font-geist-sans',
})
const geistMono = localFont({
  src: './fonts/GeistMonoVF.woff',
  variable: '--font-geist-mono',
})

export const metadata: Metadata = {
  title: 'MangaNaya',
  description: 'Manga Reader App'
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang='en'>
      <head>
        <link rel='icon' href='/manga.ico' />
        <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1"></meta>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=BenchNine:wght@300;400;700&family=Francois+One&family=Fredoka:wght@300..700&family=Gabarito:wght@400..900&family=Knewave&family=Merriweather+Sans:ital,wght@0,300..800;1,300..800&family=Quicksand:wght@300..700&display=swap" rel="stylesheet"></link>
      </head>
      <body className={`${geistSans.variable} ${geistMono.variable}`}>
        <ApolloWrapper>
          {children}
        </ApolloWrapper>
      </body>
    </html>
  )
}
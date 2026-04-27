import type { AppProps } from 'next/app'
import { ThemeProvider } from '@/hooks/ThemeContext'
import '@/app/globals.css'

export default function App({ Component, pageProps }: AppProps) {
  return (
    <ThemeProvider>
      <Component {...pageProps} />
    </ThemeProvider>
  )
}

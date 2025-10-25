import { useEffect, useState } from 'react'
import { Sun, Moon } from 'lucide-react'
import { Button } from '../components/ui/button'

export default function ThemeToggle() {
  const [dark, setDark] = useState(() => document.documentElement.classList.contains('dark'))
  useEffect(() => {
    document.documentElement.classList.toggle('dark', dark)
    localStorage.setItem('theme', dark ? 'dark' : 'light')
  }, [dark])
  return (
    <Button
      variant="outline"
      size="icon"
      className="rounded-xl"
      onClick={() => setDark(d => !d)}
      title={dark ? 'Switch to light' : 'Switch to dark'}
    >
      {dark ? <Sun className="size-4" /> : <Moon className="size-4" />}
    </Button>
  )
}

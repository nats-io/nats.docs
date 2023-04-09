import { createContext, useEffect, useState } from 'react'

function toggleDocumentTheme(theme) {
  const rootElement = document.documentElement
  rootElement.setAttribute('data-theme', theme)

  if (theme === 'system') {
    if (window.matchMedia('(prefers-color-scheme: dark)').matches) {
      theme = 'dark'
    } else {
      theme = 'light'
    }
  }

  if (theme === 'dark' && !rootElement.classList.contains('dark')) {
    rootElement.classList.add('dark')
  } else if (theme === 'light' && rootElement.classList.contains('dark')) {
    rootElement.classList.remove('dark')
  }
}

function useThemeState() {
  const [theme, setTheme] = useState()

  useEffect(() => {
    // Check for stored theme or default to system.
    if (!theme) {
      setTheme(localStorage.getItem('theme') || 'system')
      return
    }

    // Store the theme, toggle it, and setup a listener for system theme changes.
    localStorage.setItem('theme', theme)
    toggleDocumentTheme(theme)

    // Listen for changes to the system theme if the current theme is system.
    const handler = (e) => {
      console.log(theme, e)
      if (theme === 'system') {
        e.matches ? toggleDocumentTheme('dark') : toggleDocumentTheme('light')
      }
    }

    window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', handler)

    return () => {
      window.matchMedia('(prefers-color-scheme: dark)').removeEventListener('change', handler)
    }
  }, [theme])

  return {
    theme,
    setTheme,
  }
}

// Combine all global hooks
function useGlobalState() {
  return {
    ...useThemeState(),
  }
}

export let GlobalContext

export function GlobalProvider(props) {
  const state = useGlobalState()
  if (!GlobalContext) {
    GlobalContext = createContext(state)
  }

  return <GlobalContext.Provider value={state}>{props.children}</GlobalContext.Provider>
}

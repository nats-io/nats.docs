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
    // If the theme is defined, store it and toggle the document.
    if (theme) {
      localStorage.setItem('theme', theme)
      toggleDocumentTheme(theme)
      return
    }

    // Check for stored theme or default to system.
    const defaultTheme = localStorage.getItem('theme') || 'system'
    setTheme(defaultTheme)
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

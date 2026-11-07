import * as React from "react"

/** Tiny hash router so the site works on GitHub Pages without rewrites. */
export function useRoute() {
  const get = () => (location.hash.replace(/^#/, "") || "/").split("#")[0]
  const [route, setRoute] = React.useState(get)
  React.useEffect(() => {
    const on = () => {
      setRoute(get())
      window.scrollTo({ top: 0, behavior: "instant" as ScrollBehavior })
    }
    window.addEventListener("hashchange", on)
    return () => window.removeEventListener("hashchange", on)
  }, [])
  return route
}

export const href = (to: string) => `#${to}`

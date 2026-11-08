import { Toaster } from "@/components/ui/toast"
import { ErrorBoundary } from "@/components/ui/error-boundary"
import { useRoute } from "./router"
import { Header, Footer } from "./site/shell"
import { Landing } from "./pages/landing"
import * as React from "react"
import { Spinner } from "@/components/ui/spinner"

// Docs (all 61 demos + sources) and the dashboard load on demand.
const Docs = React.lazy(() => import("./pages/docs").then((m) => ({ default: m.Docs })))
const NotFound = React.lazy(() => import("./pages/docs").then((m) => ({ default: m.NotFound })))
const DashboardExample = React.lazy(() => import("./pages/dashboard").then((m) => ({ default: m.DashboardExample })))

// Warm the chunks after first paint so navigation stays instant.
if (typeof window !== "undefined") {
  const warm = () => { import("./pages/docs"); import("./pages/dashboard") }
  if ("requestIdleCallback" in window) requestIdleCallback(warm, { timeout: 3000 })
  else setTimeout(warm, 1500)
}

export function App() {
  const route = useRoute()
  let page
  if (route === "/") page = <Landing />
  else if (route.startsWith("/docs")) page = <Docs route={route} />
  else if (route === "/examples/dashboard" || route === "/examples") page = <DashboardExample />
  else page = <NotFound />

  return (
    <div className="flex min-h-screen flex-col">
      <Header route={route} />
      <main className="flex-1"><ErrorBoundary resetKeys={[route]} className="mx-auto mt-10 max-w-xl">
        <React.Suspense fallback={<div data-route-loading className="grid min-h-[60vh] place-items-center"><Spinner size={32} /></div>}>{page}</React.Suspense>
      </ErrorBoundary></main>
      <Footer />
      <Toaster />
    </div>
  )
}

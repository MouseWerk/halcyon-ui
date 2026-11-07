import { Toaster } from "@/components/ui/toast"
import { ErrorBoundary } from "@/components/ui/error-boundary"
import { useRoute } from "./router"
import { Header, Footer } from "./site/shell"
import { Landing } from "./pages/landing"
import { Docs, NotFound } from "./pages/docs"
import { DashboardExample } from "./pages/dashboard"

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
      <main className="flex-1"><ErrorBoundary resetKeys={[route]} className="mx-auto mt-10 max-w-xl">{page}</ErrorBoundary></main>
      <Footer />
      <Toaster />
    </div>
  )
}

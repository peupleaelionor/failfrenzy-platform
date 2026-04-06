import { lazy, Suspense } from "react";
import { Route, Switch } from "wouter";

// Lazy-loaded routes for optimal code splitting on Netlify CDN
const Home = lazy(() => import("./pages/Home"));
const Game = lazy(() => import("./pages/Game"));
const Dashboard = lazy(() => import("./pages/Dashboard"));
const Shop = lazy(() => import("./pages/Shop"));
const Leaderboard = lazy(() => import("./pages/Leaderboard"));
const Premium = lazy(() => import("./pages/Premium"));
const Login = lazy(() => import("./pages/Login"));
const Signup = lazy(() => import("./pages/Signup"));
const AdminDashboard = lazy(() =>
  import("./pages/AdminDashboard").then((m) => ({ default: m.AdminDashboard })),
);
const NotFound = lazy(() => import("./pages/NotFound"));

function PageLoader() {
  return (
    <div
      className="flex items-center justify-center min-h-screen bg-[#050818]"
      role="status"
      aria-live="polite"
    >
      <div className="animate-pulse text-[#00f0ff] text-xl font-mono">
        Chargement…
      </div>
    </div>
  );
}

function Router() {
  return (
    <Suspense fallback={<PageLoader />}>
      <Switch>
        <Route path={"/"} component={Home} />
        <Route path={"/game"} component={Game} />
        <Route path={"/dashboard"} component={Dashboard} />
        <Route path={"/shop"} component={Shop} />
        <Route path={"/leaderboard"} component={Leaderboard} />
        <Route path={"/premium"} component={Premium} />
        <Route path={"/login"} component={Login} />
        <Route path={"/signup"} component={Signup} />
        <Route path={"/admin"} component={AdminDashboard} />
        <Route path={"/404"} component={NotFound} />
        <Route component={NotFound} />
      </Switch>
    </Suspense>
  );
}

function App() {
  const [queryClient] = useState(() => createQueryClient());
  const [trpcClient] = useState(() => createTRPCClient());

  return (
    <trpc.Provider client={trpcClient} queryClient={queryClient}>
      <QueryClientProvider client={queryClient}>
        <Router />
      </QueryClientProvider>
    </trpc.Provider>
  );
}

export default App;

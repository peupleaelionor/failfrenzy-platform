import NotFound from "@/pages/NotFound";
import { Route, Switch } from "wouter";
import Home from "./pages/Home";
import Game from "./pages/Game";
import Dashboard from "./pages/Dashboard";
import Shop from "./pages/Shop";
import Leaderboard from "./pages/Leaderboard";
import Premium from "./pages/Premium";

function Router() {
  return (
    <Switch>
      <Route path={"/"} component={Home} />
      <Route path={"/game"} component={Game} />
      <Route path={"/dashboard"} component={Dashboard} />
      <Route path={"/shop"} component={Shop} />
      <Route path={"/leaderboard"} component={Leaderboard} />
      <Route path={"/premium"} component={Premium} />
      <Route path={"/404"} component={NotFound} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return <Router />;
}

export default App;

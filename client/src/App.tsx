import NotFound from "@/pages/NotFound";
import { Route, Switch } from "wouter";
import Home from "./pages/Home";
import Game from "./pages/Game";
import Dashboard from "./pages/Dashboard";
import Shop from "./pages/Shop";
import Leaderboard from "./pages/Leaderboard";
import Premium from "./pages/Premium";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import { AdminDashboard } from "./pages/AdminDashboard";
import Profile from "./pages/Profile";
import Achievements from "./pages/Achievements";
import Payment from "./pages/Payment";

function Router() {
  return (
    <Switch>
      <Route path={"/"} component={Home} />
      <Route path={"/game"} component={Game} />
      <Route path={"/dashboard"} component={Dashboard} />
      <Route path={"/profile"} component={Profile} />
      <Route path={"/achievements"} component={Achievements} />
      <Route path={"/shop"} component={Shop} />
      <Route path={"/leaderboard"} component={Leaderboard} />
      <Route path={"/premium"} component={Premium} />
      <Route path={"/payment"} component={Payment} />
      <Route path={"/login"} component={Login} />
      <Route path={"/signup"} component={Signup} />
      <Route path={"/admin"} component={AdminDashboard} />
      <Route path={"/404"} component={NotFound} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return <Router />;
}

export default App;

import {BrowserRouter as Router} from "react-router";
import { AppRoutes } from '@/Routes';

function App() {
  return (
    <Router>
      <AppRoutes/>
    </Router>
  );
}

export default App;
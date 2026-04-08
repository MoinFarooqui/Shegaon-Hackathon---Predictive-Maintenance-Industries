import { BrowserRouter, Routes, Route } from "react-router-dom";
import Dashboard from "./pages/Dashboard";
import Analytics from "./pages/Analytics";
import Alerts from "./pages/Alerts";
import Maintenance from "./pages/Maintenance";
import Test from "./pages/Test";
import Input from "./pages/Input";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Dashboard />} />
        <Route path="/analytics" element={<Analytics />} />
        <Route path="/alerts" element={<Alerts />} />
        <Route path="/maintenance" element={<Maintenance />} />
        <Route path="/test" element={<Test />} />
        <Route path="/input" element={<Input />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
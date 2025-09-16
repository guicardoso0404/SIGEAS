import { Route, RouterProvider, Routes } from "react-router-dom";

import SignUp from "./pages/auth/SignUp";
import PrivateRoute from "./app/guards/PrivateRoute";
import DashboardAdmin from "./pages/admin";

function App() {
  return (
    <Routes>
      {/* Rotas Públicas */}
      <Route path="/" element={<SignUp />} />

      {/* Rotas Privadas */}
      <Route element={<PrivateRoute />} />
      <Route
        path="/dashboard"
        element={<DashboardAdmin />}
      />
    </Routes>
  );
}

export default App;

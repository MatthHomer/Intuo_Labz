import { useState, useEffect } from "react";
import { Routes, Route, useLocation } from "react-router-dom";
import Topbar from "./scenes/global/Topbar";
import Sidebar from "./scenes/global/Sidebar";
import Team from "./scenes/usuarios";
import Invoices from "./scenes/invoices";
import Contacts from "./scenes/conexao";
import Form from "./scenes/gerenciar_usuarios";
import FAQ from "./scenes/faq";
import Calendario from "./scenes/calendar";
import Login from "./scenes/login";
import Configuracao from "./scenes/atendimento";
import { CssBaseline, ThemeProvider } from "@mui/material";
import { ColorModeContext, useMode } from "./theme";
import { useNavigate } from "react-router-dom"; // Importe useNavigate

function PrivateRoute({ element }) {
  const navigate = useNavigate(); // Use useNavigate para redirecionar

  useEffect(() => {
    const token = localStorage.getItem("token"); // Obtenha o token do localStorage

    if (!token) {
      navigate("/login"); // Redirecione para a página de login se o token não estiver presente
    }
  }, [navigate]);

  return element;
}

function App() {
  const [theme, colorMode] = useMode();
  const [isSidebar, setIsSidebar] = useState(true);
  const location = useLocation();

  // Determine whether to show the sidebar based on the route
  const shouldShowSidebar =
    location.pathname !== "/" && location.pathname !== "/login";

  // Determine whether to show the Topbar based on the route
  const shouldShowTopbar =
    location.pathname !== "/" &&
    location.pathname !== "/login";

  return (
    <ColorModeContext.Provider value={colorMode}>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <div className="app">
          {shouldShowSidebar && <Sidebar isSidebar={isSidebar} />}
          <main className="content">
            {shouldShowTopbar && <Topbar setIsSidebar={setIsSidebar} />}
            <Routes>
              <Route path="/" element={<Login />} exact/>
              <Route path="/login" element={<Login />} />
              <Route
                path="/calendar"
                element={<PrivateRoute element={<Calendario />} />}
              />
              <Route
                path="/gerenciar_usuarios"
                element={<PrivateRoute element={<Form />} />}
              />
              <Route
                path="/usuarios"
                element={<PrivateRoute element={<Team />} />}
              />
              <Route
                path="/conexoes"
                element={<PrivateRoute element={<Contacts />} />}
              />
              <Route
                path="/invoices"
                element={<PrivateRoute element={<Invoices />} />}
              />
              <Route
                path="/faq"
                element={<PrivateRoute element={<FAQ />} />}
              />
              <Route
                path="/atendimentos"
                element={<PrivateRoute element={<Configuracao />} />}
              />
            </Routes>
          </main>
        </div>
      </ThemeProvider>
    </ColorModeContext.Provider>
  );
}

export default App;

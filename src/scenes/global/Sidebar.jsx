import { useState, useEffect } from "react";
import { ProSidebar, Menu, MenuItem } from "react-pro-sidebar";
import { Box, IconButton, Typography, useTheme } from "@mui/material";
import { Link } from "react-router-dom";
import "react-pro-sidebar/dist/css/styles.css";
import { tokens } from "../../theme";
import PeopleOutlinedIcon from "@mui/icons-material/PeopleOutlined";
import ContactsOutlinedIcon from "@mui/icons-material/ContactsOutlined";
import ReceiptOutlinedIcon from "@mui/icons-material/ReceiptOutlined";
import PersonOutlinedIcon from "@mui/icons-material/PersonOutlined";
import CalendarTodayOutlinedIcon from "@mui/icons-material/CalendarTodayOutlined";
import HelpOutlineOutlinedIcon from "@mui/icons-material/HelpOutlineOutlined";
import MenuOutlinedIcon from "@mui/icons-material/MenuOutlined";
import ChatIcon from '@mui/icons-material/Chat'; import ExitToApp from "@mui/icons-material/ExitToApp";
import axios from "axios";

const Item = ({ title, to, icon, selected, setSelected }) => {
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);
  return (
    <MenuItem
      active={selected === title}
      style={{
        color: colors.primary[100],
      }}
      onClick={() => setSelected(title)}
      icon={icon}
    >
      <Typography>{title}</Typography>
      <Link to={to} />
    </MenuItem>
  );
};

const Sidebar = () => {
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [selected, setSelected] = useState("Dashboard");
  const token = localStorage.getItem("token");
  const [name, setName] = useState("Carregando"); // Initialize with loading state
  const [cargo, setRole] = useState(""); // Estado para armazenar o cargo

  useEffect(() => {
    // Initialize loading state
    setName("");
    setRole("");

    const userId = localStorage.getItem("userId"); // Obter o userId do localStorage

    axios
      .get(`http://localhost:3002/obter_usuario/${userId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })
      .then((response) => {
        const userData = response.data;
        if (userData) {
          const user = userData;
          const userName = user.nome;
          const userCargo = user.cargo;
          setName(userName); // Atualizar o estado com o nome
          setRole(userCargo); // Atualizar o estado com o cargo
        } else {
          // Lidar com o caso em que não há dados de usuário encontrados
          setName("Usuário não encontrado");
          setRole("");
        }
      })
      .catch((error) => {
        // Lidar com erros
        console.error("Erro ao buscar dados do usuário:", error);
        setName("Erro ao buscar dados do usuário");
        setRole("");
      });
  }, [token]);

  return (
    <Box
      sx={{
        "& .pro-sidebar-inner": {
          background: `${colors.primary[400]} !important`,
        },
        "& .pro-icon-wrapper": {
          backgroundColor: "transparent !important",
        },
        "& .pro-inner-item": {
          padding: "0px 35px 0px 0px !important",
        },
        "& .pro-inner-item:hover": {
          color: "#D9D9D9 !important",
        },
        "& .pro-menu-item.active": {
          color: "#ffff !important",
        },
      }}
    >
      <ProSidebar collapsed={isCollapsed}>
        <Menu iconShape="square" >
          <MenuItem
            display="flex"
            alignItems="flex-end"
            paddingLeft="1rem"
            onClick={() => setIsCollapsed(!isCollapsed)}
            icon={isCollapsed ? <MenuOutlinedIcon style={{
              color: colors.primary[100],
            }} /> : undefined}
            style={{
              color: colors.primary[100],
              width: "200px",
            }}
          >
            {!isCollapsed && (
              <Box
                display="flex"
                paddingLeft="1rem"
                justifyContent="space-between"
                alignItems="center"
              >
                <IconButton onClick={() => setIsCollapsed(!isCollapsed)}>
                  <MenuOutlinedIcon />
                </IconButton>
              </Box>
            )}
          </MenuItem>

          {!isCollapsed && (
            <Box mb="25px">
              <Box display="flex" justifyContent="center" alignItems="center">
                <img
                  alt="profile-user"
                  width="180px"
                  height="180px"
                  src={`../../assets/user.jpeg`}
                  style={{ cursor: "pointer", borderRadius: "50%" }}
                />
              </Box>
              <Box textAlign="center">
                <Typography
                  variant="h3"
                  color={colors.primary[100]}
                  fontWeight="bold"
                  sx={{ m: "8px 0 0 0" }}
                >
                  {name}

                </Typography>
                <Typography variant="h5" color={colors.greenAccent[600]}>
                  {cargo}
                </Typography>
              </Box>
            </Box>
          )}

          <Box paddingLeft={isCollapsed ? "1rem" : "1rem"}>
            <Item
              title="Agenda"
              to="/Calendar"
              icon={<CalendarTodayOutlinedIcon />}
              selected={selected}
              setSelected={setSelected}
            />
            <Item
              title="Gerenciar Usuários"
              to="/gerenciar_usuarios"
              icon={<PersonOutlinedIcon />}
              selected={selected}
              setSelected={setSelected}
            />
            <Item
              title="Usuários"
              to="/usuarios"
              icon={<PeopleOutlinedIcon />}
              selected={selected}
              setSelected={setSelected}
            />
            <Item
              title="Conexões"
              to="/conexoes"
              icon={<ContactsOutlinedIcon />}
              selected={selected}
              setSelected={setSelected}
            />
            {/*             <Item
              title="Saldos de Faturas"
              to="/invoices"
              icon={<ReceiptOutlinedIcon />}
              selected={selected}
              setSelected={setSelected}
            /> */}
            <Item
              title="Atendimentos"
              to="/atendimentos"
              icon={<ChatIcon />}
              selected={selected}
              setSelected={setSelected}
            />
            <Item
              title="Questões e Respostas"
              to="/faq"
              icon={<HelpOutlineOutlinedIcon />}
              selected={selected}
              setSelected={setSelected}
            />
            <Item
              title="Sair"
              to="/"
              icon={<ExitToApp />}
              selected={selected}
              setSelected={setSelected}
            />
          </Box>
        </Menu>
        <Box display="flex" justifyContent="center" alignItems="center" paddingTop={isCollapsed ? "30rem" : "15rem"}>
          <img
            alt="rodape"
            width={isCollapsed ? "40%" : "90%"}
            src={process.env.PUBLIC_URL + `/assets/${isCollapsed ? 'logo_inferior_fechado.svg' : 'logo_inferior.svg'}`}
          />
        </Box>
      </ProSidebar>
    </Box>
  );
};

export default Sidebar;

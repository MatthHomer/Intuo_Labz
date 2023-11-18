import React, { useContext, useState } from "react";
import {
  Box,
  IconButton,
  Typography,
  useTheme,
  InputBase,
} from "@mui/material";
import { ColorModeContext, tokens } from "../../theme";
import LightModeOutlinedIcon from "@mui/icons-material/LightModeOutlined";
import DarkModeOutlinedIcon from "@mui/icons-material/DarkModeOutlined";
import {MenuItem } from "react-pro-sidebar";
import { Link } from "react-router-dom";
import PersonOutlinedIcon from "@mui/icons-material/PersonOutlined";

const Item = ({ title, to, icon, selected, setSelected }) => {
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);
  
  const handleClick = () => {
    setSelected(title);
  };
  
  return (
    <MenuItem
      active={selected === icon}
      style={{
        color: colors.grey[100],
      }}
      onClick={handleClick}
    >
      <Link to={to}>{icon}</Link>
    </MenuItem>
  );
};

const Topbar = () => {
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);
  const colorMode = useContext(ColorModeContext);
  const [selected, setSelected] = useState("Dashboard");

  return (
    <Box
      display="flex"
      justifyContent="space-between"
      alignItems="center"
      p={2}
      
    >
{/*       <Box display="flex" alignItems="center" style={{ backgroundColor: "#bfbdbd", borderRadius:"5px", padding:'10px' }}>
        <img
          alt="logo"
          width="200"
          height="auto"
          backgroundColor="#00000"
          src={`../../assets/logo_escrito.png`}
          style={{ cursor: "pointer" }}
        />
      </Box> */}

      <Box flex="1" />

      {/* ICONS */}
      <Box display="flex">
        <IconButton onClick={colorMode.toggleColorMode}>
          {theme.palette.mode === "dark" ? (
            <DarkModeOutlinedIcon />
          ) : (
            <LightModeOutlinedIcon />
          )}
        </IconButton>
      </Box>
      
     </Box>
  );
};

export default Topbar;

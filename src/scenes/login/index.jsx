import React, { useState } from "react";
import {
  Box,
  List,
  ListItem,
  ListItemText,
  Typography,
  useTheme,
} from "@mui/material";
import { tokens } from "../../theme";
import { } from './style.css';
import { useNavigate, Link } from "react-router-dom";
import axios from "axios";

const Login = () => {
  const theme = useTheme();
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
  
    if (!email || !senha) {
      setError("Por favor, preencha todos os campos.");
      return;
    }
  
    console.log("Email:", email);
    console.log("Senha:", senha);
  
    try {
      const response = await axios.post("https://main.d2zg9tfetcpofe.amplifyapp.com:3002/login", {
        email: email,
        senha: senha,
      });
    
      if (response.status === 200) {
        const data = response.data;
        const token = data.token;
        const userId = data.userId;
    
        localStorage.setItem("token", token);
        localStorage.setItem("userId", userId); // Save the user's ID to local storage.
        navigate("/calendar");
      } else {
        setError("Credenciais inválidas. Por favor, tente novamente.");
      }
    } catch (error) {
      setError("Erro ao fazer login. Por favor, tente novamente mais tarde.");
      console.error("Erro ao fazer login:", error);
    }
  };

  return (
    <Box>
      <div className="App">
        <div className="auth-form-container">
          <img className="logo" src="../assets/logo.svg" alt="" ></img>
        <div className="login-form-container">
          <form className="login-form" onSubmit={handleSubmit}>
            <label htmlFor="email">Login</label>
            <input value={email} onChange={(e) => setEmail(e.target.value)} type="email" placeholder="Digite seu e-mail" id="email" name="email" required />
            <label htmlFor="senha">Senha</label>
            <input value={senha} onChange={(e) => setSenha(e.target.value)} type="password" placeholder="Digite sua senha" id="senha" name="senha" required />
            {error && <p className="error-message">{error}</p>}
            <button type="submit" className="link-btn">Entrar</button>
          </form>
        </div>
        </div>
      </div>
    </Box>
  )
};

export default Login;

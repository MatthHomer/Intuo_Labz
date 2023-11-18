import React from "react";
import { Box, Typography } from "@mui/material";

const Popup = ({ message, onClose }) => {
  return (
    <Box
      position="fixed"
      top="0"
      left="0"
      width="100%"
      height="100%"
      display="flex"
      justifyContent="center"
      alignItems="center"
      backgroundColor="rgba(0, 0, 0, 0.5)"
      zIndex="9999"
    >
      <Box
        backgroundColor="gray"
        color="darkgray"
        padding="20px"
        borderRadius="5px"
        boxShadow="0 0 10px rgba(0, 0, 0, 0.5)"
        textAlign="center"
      >
        <Typography variant="h6">{message}</Typography>
        <button onClick={onClose}>Fechar</button>
      </Box>
    </Box>
  );
};

export default Popup;

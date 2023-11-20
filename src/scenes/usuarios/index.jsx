import React, { useEffect, useState } from "react";
import axios from "axios";
import { Box, Typography, useTheme, Button } from "@mui/material";
import { DataGrid } from "@mui/x-data-grid";
import { tokens } from "../../theme";
import AdminPanelSettingsOutlinedIcon from "@mui/icons-material/AdminPanelSettingsOutlined";
import LockOpenOutlinedIcon from "@mui/icons-material/LockOpenOutlined";
import SecurityOutlinedIcon from "@mui/icons-material/SecurityOutlined";
import Header from "../../components/Header";


const Team = () => {
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);

  const columns = [
    {
      field: "id",
      headerName: "ID",
      width: 90,
      checkboxSelection: true, // Coluna de seleção
    },
    {
      field: "name",
      headerName: "Nome",
      flex: 1,
      cellClassName: "name-column--cell",
    },
    {
      field: "email",
      headerName: "Email",
      flex: 1,
    },
    {
      field: "phone",
      headerName: "Contato",
      flex: 1,
    },
    {
      field: "accessLevel",
      headerName: "Cargo",
      flex: 1,
      renderCell: ({ row }) => {
        const { accessLevel } = row;
        let cargoIcon, cargoColor;

        switch (accessLevel) {
          case "Master":
            cargoIcon = <AdminPanelSettingsOutlinedIcon />;
            cargoColor = colors.blueAccent[600];
            break;
          case "Admin":
            cargoIcon = <SecurityOutlinedIcon />;
            cargoColor = colors.blueAccent[700];
            break;
          case "Usuário":
            cargoIcon = <LockOpenOutlinedIcon />;
            cargoColor = colors.blueAccent[700];
            break;
          default:
            cargoIcon = null;
            cargoColor = colors.blueAccent[700];
            break;
        }

        return (
          <Box
            width="60%"
            m="0 auto"
            p="5px"
            display="flex"
            justifyContent="center"
            backgroundColor={cargoColor}
            borderRadius="4px"
          >
            {cargoIcon}
            <Typography color={colors.blueAccent[100]} sx={{ ml: "5px" }}>
              {accessLevel}
            </Typography>
          </Box>
        );
      },
    },
  ];

  const [formData, setFormData] = useState([]);
  const [selectedRows, setSelectedRows] = useState([]);

  useEffect(() => {
    axios
      .get("http://localhost:3002/obter_usuarios")
      .then((response) => {
        setFormData(response.data);
      })
      .catch((error) => {
        console.error("Erro ao obter os dados:", error);
      });
  }, []);

  const mappedData = formData.map((data, index) => {
    return {
      id: data.id,
      name: data.nome,
      email: data.email,
      usuario: data.usuario,
      phone: data.telefone,
      accessLevel: data.cargo,
    };
  });

  // Função para lidar com a exclusão das linhas selecionadas
  const handleDeleteSelectedRows = () => {
    if (selectedRows.length === 0) {
      alert("Nenhuma linha selecionada.");
      return;
    }

    // Map the IDs of the selected rows
    const selectedUserIds = selectedRows.map((selectedRow) => selectedRow);

    // Add a console.log to display the selected IDs
    console.log("IDs selecionados para exclusão: ", selectedUserIds);

    // Make sure you're passing the IDs correctly in the request body
    axios
      .delete("http://localhost:3002/excluir_usuarios", {
        data: { userIds: selectedUserIds }, // Pass the array of IDs as an object
      })
      .then((response) => {
        // Update the data list after successful deletion
        setFormData((prevData) =>
          prevData.filter((data) => !selectedUserIds.includes(data.id))
        );

        setSelectedRows([]); // Clear the selected rows
        alert("Linhas selecionadas excluídas com sucesso.");
      })
      .catch((error) => {
        console.error("Erro ao excluir as linhas selecionadas:", error);
        alert("Erro ao excluir as linhas selecionadas.");
      });
  };

  return (
    <Box m="20px">
      <Header title="Time" subtitle="Gerenciamento de Membros do Time" />
      <Box
        m="40px 0 0 0"
        height="75vh"
        sx={{
          "& .MuiDataGrid-root": {
            border: "none",
          },
          "& .MuiDataGrid-cell": {
            borderBottom: "none",
          },
          "& .name-column--cell": {
            color: colors.blueAccent[500],
            fontWeight: "bold",
            "&:hover": {
              cursor: "pointer",
              color: colors.blueAccent[400],
            },
          },
        }}
      >
        <DataGrid
          rows={mappedData}
          columns={columns}
          pageSize={10}
          rowsPerPageOptions={[10]}
          checkboxSelection
          onSelectionModelChange={(newSelection) => {
            console.log("IDs selecionados:", newSelection);
            setSelectedRows(newSelection);
          }}
        />
      </Box>
      <Button
        variant="contained"
        color="error"
        onClick={() => {
          if (selectedRows && selectedRows.length > 0) {
            handleDeleteSelectedRows(selectedRows);
          } else {
            alert("Nenhuma linha selecionada.");
          }
        }}
      >
        Excluir Linhas Selecionadas
      </Button>
    </Box>
  );
};

export default Team;

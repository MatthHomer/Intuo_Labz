import React, { useState, useEffect } from "react";
import axios from "axios";
import { Box } from "@mui/material";
import { DataGrid, GridToolbar } from "@mui/x-data-grid";
import { tokens } from "../../theme";
import Header from "../../components/Header";
import { useTheme } from "@mui/material";

const Contacts = () => {
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);
  const [data, setData] = useState([]);

  const columns = [
    { field: 'id', headerName: 'ID', width: 100 },
    { field: 'rx_power', headerName: 'Sinal Rx', width: 200 },
    { field: 'olt_rx_power', headerName: 'Sinal Rx OLT', width: 200 },
    { field: 'contract_id', headerName: 'Codigo Contrato', width: 200 },
  ];

  useEffect(() => {
    const authUrl = 'https://dautoisp.int6tech.com.br/api/auth/v2/request_token';
    const authHeaders = {
      'accept': '*/*',
      'Content-Type': 'application/json',
    };
    const authData = {
      'username': 'devel@onetelecom',
      'password': 'Qdt23@sa98*',
    };

    axios.post(authUrl, authData, { headers: authHeaders })
      .then((authResponse) => {
        if (authResponse.status === 200) {
          const authToken = authResponse.data.token;
          console.log("Sucesso no primeiro token do Int-6");

          const apiUrl = 'https://dautoisp.int6tech.com.br/api/diag/v2/onu_status?page=1&per_page=10';
          const apiHeaders = {
            'accept': 'application/json',
            'Authorization': `JWT ${authToken}`,
          };

          axios.get(apiUrl, { headers: apiHeaders })
            .then((apiResponse) => {
              if (apiResponse.status === 200) {
                console.log(apiResponse.data);

                const apiData = apiResponse.data;
                const filteredValues = apiData.map(item => ({
                  id: item.id,
                  rx_power: item.rx_power,
                  olt_rx_power: item.olt_rx_power,
                  contract_id: item.contract_id,
                }));

                setData(filteredValues);
              } else {
                console.log(`Erro ao acessar a URL da segunda solicitação. Código de status: ${apiResponse.status}`);
              }
            })
            .catch((apiError) => {
              console.error('Erro na segunda solicitação GET:', apiError);
            });
        } else {
          console.log('Falha na primeira solicitação POST para obter o token do Int-6. Código de status:', authResponse.status);
          console.log('Resposta:', authResponse.data);
        }
      })
      .catch((authError) => {
        console.error('Erro na primeira solicitação POST para obter o token do Int-6.', authError);
      });
  }, []); // Empty dependency array to run the effect only once on mount

  return (
    <Box m="20px">
    <Header title="Conexões" subtitle="Lista de Clientes Int-6" />
    <Box
      m="40px 0 0 0"
      height="700px"
      sx={{
        "& .MuiDataGrid-root": { border: "none" },
        "& .MuiDataGrid-cell": { borderBottom: "none" },
        "& .name-column--cell": { color: colors.primary[800] },
        "& .MuiDataGrid-columnHeaders": { backgroundColor: colors.blueAccent[600], borderBottom: "none" },
        "& .MuiDataGrid-virtualScroller": { backgroundColor: colors.primary[400] },
        "& .MuiDataGrid-footerContainer": { borderTop: "none", backgroundColor: colors.blueAccent[600] },
        "& .MuiCheckbox-root": { color: `${colors.greenAccent[200]} !important` },
        "& .MuiDataGrid-toolbarContainer .MuiButton-text": {
          color: `${colors.grey[100]} !important`,
        },
      }}
    >
        <DataGrid
          rows={data}
          columns={columns}
          components={{
            Toolbar: (props) => (
                <GridToolbar style={{ display: "flex", flexDirection: "row" }} {...props} />
              ),
        }}
        />
      </Box>
    </Box>
  );
};

export default Contacts;

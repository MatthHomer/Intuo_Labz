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

   const fetchData = async (page, authToken) => {
    const apiUrl = `https://dautoisp.int6tech.com.br/api/diag/v2/onu_status?page=${page}&per_page=10`;
    const apiHeaders = {
      'accept': 'application/json',
      'Authorization': `JWT ${authToken}`,
    };

    try {
      const apiResponse = await axios.get(apiUrl, { headers: apiHeaders });

      if (apiResponse.status === 200) {
        console.log(apiResponse.data);

        const apiData = apiResponse.data;
        const newValues = apiData.map(item => ({
          id: item.id,
          rx_power: item.rx_power,
          olt_rx_power: item.olt_rx_power,
          contract_id: item.contract_id,
        }));

        setData(prevData => [...prevData, ...newValues]);

        // Check if there are more pages
        if (apiData.length === 10) {
          // If there are more pages, fetch the next page
          await fetchData(page + 1, authToken);
        }
      } else {
        console.log(`Erro ao acessar a URL da solicitação. Código de status: ${apiResponse.status}`);
      }
    } catch (error) {
      console.error('Erro na solicitação GET:', error);
    }
  };

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

          // Start fetching data with the first page
          fetchData(1, authToken);
        } else {
          console.log('Falha na primeira solicitação POST para obter o token do Int-6. Código de status:', authResponse.status);
          console.log('Resposta:', authResponse.data);
        }
      })
      .catch((authError) => {
        console.error('Erro na primeira solicitação POST para obter o token do Int-6.', authError);
      });
  }, []);
  return (
    <Box m="20px">
    <Header title="Conexões" subtitle="Lista de Clientes Int-6" />
    <Box
      m="40px 0 0 0"
      height="650px"
      sx={{
        "& .MuiDataGrid-cell": { backgroundColor: colors.primary[100] },
        "& .name-column--cell": { color: colors.primary[800] },
        "& .MuiDataGrid-columnHeaders": { backgroundColor: colors.grey[900], borderBottom: "none" },
        "& .MuiDataGrid-virtualScroller": { backgroundColor: colors.primary[100] },
        "& .MuiDataGrid-footerContainer": { borderTop: "none", backgroundColor: colors.grey[900] },
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
        sx={{
          fontSize: "14px", //Tamanho de fonte da tabela
        }}
        />
      </Box>
    </Box>
  );
};

export default Contacts;

import React, { useState, useEffect } from "react";
import axios from "axios";
import { Box } from "@mui/material";
import { DataGrid, GridToolbar } from "@mui/x-data-grid";
import { tokens } from "../../theme";
import { useTheme } from "@mui/material";
import Header from "../../components/Header";

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
    const authUrl = 'https://autoisp.onetelecom.net.br/api/auth/v2/request_token';
    const authHeaders = {
      'accept': '*/*',
      'Content-Type': 'application/json',
    };
    const authData = {
      'username': 'matheus@quidittas.com.br',
      'password': 'MQuidit4s@123!@#',
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
  

  const fetchData = async (page, authToken) => {
  const apiUrl = `https://autoisp.onetelecom.net.br/api/diag/v2/onu_status?page=${page}&per_page=10`;
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

      setData(prevData => {
        // Se já temos 100 itens ou mais, não adicione mais dados
        if (prevData.length >= 100) {
          return prevData;
        }

        // Se ainda não temos 100 itens, adicione os novos dados
        const updatedData = [...prevData, ...newValues];

        // Se ainda não temos 100 itens após adicionar os novos dados, faça a próxima requisição
        if (updatedData.length < 100 && apiData.length === 10) {
          fetchData(page + 1, authToken);
        }

        return updatedData;
      });
    } else {
      console.log(`Erro ao acessar a URL da solicitação. Código de status: ${apiResponse.status}`);
    }
  } catch (error) {
    console.error('Erro na solicitação GET:', error);
  }
};


  return (
    <Box m="20px">
      <Header title="Conexões" subtitle="Lista de Conexões da Int-6" />
      <Box
        m="40px 0 0 0"
        height="75vh"
        sx={{
          "& .MuiDataGrid-cell": { backgroundColor: colors.labz[300], borderColor: colors.labz[500] },
          "& .name-column--cell": { color: colors.primary[800] },
          "& .MuiDataGrid-row": { color: colors.grey[900], fontFamily: "Poppins", fontSize: "0.875rem", fontWeight: "500" },
          "& .MuiDataGrid-virtualScrollerContent": { backgroundColor: colors.labz[300] },
          "& .MuiDataGrid-columnHeaderTitle": { color: colors.primary[100] },
          "& .MuiDataGrid-iconSeparator": { color: colors.grey[300] },
          "& .MuiToolbar-gutters": { color: colors.primary[100] },
          "& .MuiDataGrid-columnHeaders": { backgroundColor: colors.grey[900], borderBottom: "none" },
          "& .MuiDataGrid-virtualScroller": { backgroundColor: colors.primary[100] },
          "& .MuiDataGrid-footerContainer": { borderTop: "none", backgroundColor: colors.grey[900] },
          "& .MuiCheckbox-root": { color: `${colors.greenAccent[200]} !important` },
          "& .MuiDataGrid-toolbarContainer .MuiButton-text": { color: `${colors.grey[100]} !important`, },
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

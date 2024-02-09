import React, { useEffect, useState } from "react";
import axios from "axios";
import { Box, Button, TextField, Dialog, LinearProgress, DialogTitle, DialogContent, DialogActions, Typography } from "@mui/material";
import { v4 as uuidv4 } from 'uuid'; // Importe o uuidv4
import { DataGrid, GridToolbar } from "@mui/x-data-grid";
import { tokens } from "../../theme";
import { useTheme } from "@mui/material";
import Header from "../../components/Header";

const Configuracao = () => {
    const theme = useTheme();
    const colors = tokens(theme.palette.mode);
    const [isRoutineEnabled, setRoutineEnabled] = useState(false);
    const [respostaCliente, setRespostaCliente] = useState("");
    const [respostaProtocolo, setRespostaProtocolo] = useState("");
    const [listaDePessoas, setListaDePessoas] = useState([]);
    const [listaDePessoasAprovada, setListaDePessoasAprovada] = useState(false);
    const [resultados, setResultados] = useState([]);
    const [clientesMkData, setClientesMkData] = useState([]);
    const [pessoasSelecionadas, setPessoasSelecionadas] = useState([]);
    const [telefonePorId, setTelefonePorId] = useState({});
    const [mkToken, setMkToken] = useState(null);
    const [isTokenObtained, setTokenObtained] = useState(false); // Novo estado para controlar se o token já foi obtido
    const [codpessoa, setcodpessoa] = useState(""); // Adicione o estado para o codpessoa
    const [mensagem, setMensagem] = useState("Olá, @cliente, sua conexão está com problemas no momento, se houver a necessidade de atendimento, este é seu protocolo: @protocolo");
    const [minOltRxPower, setMinOltRxPower] = useState(null); // Estado para armazenar o valor mínimo
    const [oltRxPowerValues, setOltRxPowerValues] = useState([]);
    const [loading, setLoading] = useState(false); // Novo estado para indicar se os dados estão sendo carregados


    const handleRowSelection = (params) => {
        const selectedRows = params.api.getSelectedRows();
        setPessoasSelecionadas(selectedRows);
        console.log("Linhas selecionadas:", selectedRows);
    };

    const handleToggleRoutine = () => {
        setRoutineEnabled(!isRoutineEnabled);
        alert("Rotina Alterada com Sucesso")
    };

    const handleMinOltRxPowerChange = (e) => {
        const value = e.target.value;
        setMinOltRxPower(value === "" ? null : parseFloat(value)); // Converte para número ou define como null
    };

    useEffect(() => {
        if (isRoutineEnabled) {
            setLoading(true); // Ativar loading quando a rotina é habilitada

            console.log("Rotina Alterada com Sucesso")
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
                        console.log("AuthToken:", authToken);
                        console.log("Sucesso no primeiro token do Int-6");
                        const apiUrl = 'https://autoisp.onetelecom.net.br/api/diag/v2/onu_status?page=1&per_page=10';
                        const apiHeaders = {
                            'accept': 'application/json',
                            'Authorization': `JWT ${authToken}`,
                        };

                        axios.get(apiUrl, { headers: apiHeaders })
                            .then((apiResponse) => {
                                if (apiResponse.status === 200) {
                                    const apiData = apiResponse.data;
                                    const filteredValues = [];
                                    const contractIds = [];

                                    apiData.forEach((item) => {
                                        const oltRxPower = item.olt_rx_power;
                                        if (
                                            parseFloat(oltRxPower) >= minOltRxPower
                                        ) {
                                            setOltRxPowerValues(filteredValues.map((item) => item.olt_rx_power));
                                            console.log("teste RX", oltRxPowerValues);
                                            filteredValues.push(item);
                                            const contractId = item.contract_id;
                                            if (contractId) {
                                                contractIds.push(contractId);
                                            }
                                        }
                                    });
                                    const updatedContractIds = contractIds.map((contractId) => {
                                        return { originalContractId: contractId, customContractId: contractId };
                                    });

                                    updatedContractIds.forEach((contractId) => {
                                        const obterClientesMkUrl = `http://localhost:3000/obter_clientes_mk/${contractId.customContractId}`;
                                        axios.get(obterClientesMkUrl)
                                            .then((clientesMkResponse) => {
                                                if (clientesMkResponse.status === 200) {

                                                    sendConfigRequest();

                                                    const clientesMkData = clientesMkResponse.data.map((row) => ({
                                                        id: uuidv4(),
                                                        ...row,
                                                    }));
                                                    console.log("API Response:", clientesMkData);
                                                    setClientesMkData(clientesMkData);
                                                }
                                            })
                                            .catch((clientesMkError) => {
                                                console.error('Erro ao obter clientes MK:', clientesMkError);
                                            });
                                    });
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
        }
    }, [isRoutineEnabled, minOltRxPower]);

    const sendConfigRequest = () => {
        const selectedPhones = pessoasSelecionadas.map((id) => {
            const pessoa = clientesMkData.find((p) => p.id === id);
            return pessoa ? pessoa.telefone : "";
        });

        const validPhones = selectedPhones.filter((phone) => phone !== "");

        if (validPhones.length > 0) {
            const user = validPhones.join(',');

            console.log("Validação OPT-In", user);

            const options = {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded',
                    apikey: 'vaieqo8caibifiy2vintzl7s150ak8sv',
                },
                body: new URLSearchParams({ user }),
            };

            fetch('https://api.gupshup.io/sm/api/v1/app/opt/in/OneTelecom', options)
                .then(response => {
                    if (!response.ok) {
                        throw new Error(`HTTP error! Status: ${response.status}`);
                    }
                    return response.text();
                })
                .then(responseText => {
                    if (responseText.trim() !== "") {
                        try {
                            const jsonResponse = JSON.parse(responseText);
                            console.log('Gupshup API Response:', jsonResponse);
                            // Add more specific handling based on the response if needed
                        } catch (jsonError) {
                            console.error('Error parsing JSON:', jsonError);
                        }
                    } else {
                        console.log('Empty response from Gupshup API');
                    }
                })
                .catch(err => console.error('Error in Gupshup API request:', err));
        } else {
            console.log("No valid phone numbers to send config request.");
        }
    };


    const aprovarPessoasSelecionadas = () => {
        if (pessoasSelecionadas.length > 0) {
            const telefones = pessoasSelecionadas.map((id) => {
                const pessoa = clientesMkData.find((p) => p.id === id);
                return pessoa ? pessoa.telefone : "";
            });

            const codpessoa = pessoasSelecionadas.map((id) => {
                const pessoa = clientesMkData.find((p) => p.id === id);
                return pessoa ? pessoa.codpessoa : "";
            });

            const nome = pessoasSelecionadas.map((id) => {
                const pessoa = clientesMkData.find((p) => p.id === id);
                return pessoa ? pessoa.nome_razaosocial : "";
            });

            setcodpessoa(codpessoa);

            console.log(`Pessoas Aprovadas: ${codpessoa}, ${nome}, ${telefones}`);
            alert(`Pessoas Aprovadas: ${codpessoa}, ${nome}, ${telefones}`);

            const telefonesValidos = telefones.filter((telefone) => telefone !== "");
            if (telefonesValidos.length > 0) {
                const foneList = telefonesValidos.join(',');
                setListaDePessoasAprovada(pessoasSelecionadas);
            } else {
                console.log("Nenhum número de telefone válido encontrado nas pessoas selecionadas.");
            }
        } else {
            console.log("Nenhuma pessoa selecionada para aprovação.");
        }
    };


    const obterTokenDoMK = () => {
        const authUrl = "http://45.176.31.235:8080/mk/WSAutenticacao.rule?sys=MK0&token=096d4971b906abb978b2ac53b87f6a52&password=397e7988f43822&cd_servico=9999";

        axios.post(authUrl)
            .then((authResponse) => {
                if (authResponse.status === 200) {
                    const mkToken = authResponse.data.Token;
                    console.log("Token da MK obtido com sucesso:", mkToken);
                    setMkToken(mkToken);
                } else {
                    console.log('Erro em obter o token da MK', authResponse.status);
                    console.log('Response:', authResponse.data);
                }
            });
    };

    useEffect(() => {
        obterTokenDoMK();

        // Configurar a chamada a cada 1 minuto
        const intervalId = setInterval(() => {
            obterTokenDoMK();
        }, 60000); // 60000 milissegundos = 1 minuto

        // Retorne uma função de limpeza para evitar vazamento de memória
        return () => {
            clearInterval(intervalId);
        };
    }, []);


    const criarAtendimento = () => {
        if (mkToken) {
            if (codpessoa) {
                const urlAtendimento = `http://45.176.31.235:8080/mk/WSMKNovoAtendimento.rule?sys=MK0&token=${mkToken}&cd_cliente=${codpessoa}&cd_processo=67&cd_classificacao_ate=1&origem_contato=2&info=teste%20mk`;
                console.log("mkToken:", mkToken);
                console.log("codpessoa:", codpessoa);

                axios
                    .post(urlAtendimento)
                    .then((response) => {
                        if (response.status === 200) {
                            console.log("Resposta:", response.data);

                            // Atualize os estados "respostaCliente" e "respostaProtocolo" com os valores apropriados
                            setRespostaCliente(response.data.Cliente); // Substitua "nome_cliente" pelo campo correto na resposta
                            setRespostaProtocolo(response.data.Protocolo); // Substitua "protocolo" pelo campo correto na resposta
                            console.log(`Atendimento criado para ${respostaCliente}, com o protocolo: ${respostaProtocolo}`);
                            alert(`Atendimento criado para ${respostaCliente}, com o protocolo: ${respostaProtocolo}`);
                        } else {
                            console.log(`Falha na requisição. Código de status: ${response.status}`);
                            alert(`Falha na requisição. Código de status: ${response.status}`);
                        }
                    })
                    .catch((error) => {
                        console.error("Erro na requisição de criação de atendimento:", error);
                    });
            }
        } else {
            console.log("Token da MK não disponível. Certifique-se de obter o token antes de criar o atendimento.");
        }
    };

    const substituirCoringas = (mensagem) => {
        let mensagemFormatada = mensagem;
        mensagemFormatada = mensagemFormatada.replace(/@cliente/g, respostaCliente);
        mensagemFormatada = mensagemFormatada.replace(/@protocolo/g, respostaProtocolo);
        return mensagemFormatada;
    };


    const enviarMensagem = () => {
        if (listaDePessoasAprovada) {
            const mensagemFormatada = substituirCoringas(mensagem); // Substitui os coringas
            const foneList = clientesMkData.map((pessoa) => pessoa.telefone).join(',');

            const url = "https://api.gupshup.io/sm/api/v1/msg";
            const params = {
                message: mensagemFormatada,
                channel: "whatsapp",
                source: "155136000800",
                destination: foneList, // Substituir depois por foneList
                'src.name': "OneTelecom",
                disablePreview: "true",
                encode: "false",
            };
            const headers = {
                Accept: "application/json",
                "Content-Type": "application/x-www-form-urlencoded",
                Apikey: "vaieqo8caibifiy2vintzl7s150ak8sv",
            };

            axios
                .post(url, null, {
                    params,
                    headers,
                })
                .then((response) => {
                    if (response.status !== 401 || 500) {
                        console.log(`Mensagem Enviada com Sucesso`);
                        alert(`Mensagem Enviada com Sucesso`);
                    }
                })
                .catch((error) => {
                    console.error("Erro na requisição:", error);
                });
        } else {
            console.log("A lista de pessoas não foi aprovada. A mensagem não será enviada.");
        }
    };

    return (
        <>
            <div style={{ display: 'flex' }}>
                {/* Second Section */}
                <Box m="20px" display="flex" flexDirection="column">
                    <Header title="Configuração" subtitle="Gerenciamento de Filtros da Aplicação" />

                    <TextField
                        style={{ width: "27rem", backgroundColor: "rgba(44, 53, 50, 0.04)", margin: '5px', borderRadius: "0.3125rem", border: "0.5px", borderColor: "#2C3532" }}
                        type="text"
                        onChange={handleMinOltRxPowerChange}
                        placeholder="Valor Mínimo de oltRxPower"
                    />

                    <div style={{ padding: '10px' }}>
                        <Button
                            style={{ width: "12.875rem", height: "3.125rem", borderRadius: "0.3125rem", margin: '5px', marginLeft: '-10px', color: "#FFFF", backgroundColor: isRoutineEnabled ? "#FF0000" : "#5EA989" }}
                            variant="contained"
                            color="primary"
                            onClick={handleToggleRoutine}
                        >
                            {isRoutineEnabled ? 'Desligar Rotina' : 'Ligar Rotina'}
                        </Button>

                        <Button style={{ width: "12.875rem", height: "3.125rem", borderRadius: "0.3125rem", margin: '5px', color: "#FFFF", backgroundColor: "#79B5D7" }} variant="contained" color="primary" onClick={aprovarPessoasSelecionadas}>
                            Aprovar Selecionados
                        </Button>

                        <Button style={{ width: "12.875rem", height: "3.125rem", borderRadius: "0.3125rem", margin: '5px', color: "#FFFF", backgroundColor: "#44617b" }} variant="contained" color="primary" onClick={criarAtendimento}>
                            Criar Atendimento
                        </Button>
                    </div>
                </Box>

                {/* First Section */}
                <Box m="20px">
                    <TextField
                        multiline
                        type="text"
                        rows={4}
                        value={mensagem}
                        onChange={(e) => setMensagem(e.target.value)}
                        placeholder="Digite sua mensagem"
                        style={{ width: 450, margin: '5px', marginLeft: '0px', marginBottom: '10px', backgroundColor: "rgba(44, 53, 50, 0.04)" }}
                    />

                    <Button style={{ width: "12.875rem", height: "3.125rem", borderRadius: "0.3125rem", margin: '5px', color: "#FFFF", backgroundColor: "#f26c41" }} variant="contained" color="primary" onClick={sendConfigRequest}>
                        Autorizar Telefone
                    </Button>

                    <Button style={{ width: 150, height: 53, margin: '5px' }} variant="contained" color="primary" onClick={enviarMensagem}>
                        Enviar Mensagem
                    </Button>
                </Box>
            </div>


            <Box
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
                    rows={clientesMkData}
                    components={{ Toolbar: GridToolbar }}
                    columns={[
                        { field: "telefone", headerName: "Telefone", flex: 1 },
                        { field: "codpessoa", headerName: "Cod Pessoa", flex: 1 },
                        { field: "codcontrato", headerName: "Cod Contrato", flex: 1 },
                        { field: "nome_razaosocial", headerName: "Nome", flex: 1 },
                        { field: "cidade", headerName: "Cidade", flex: 1 },
                        { field: "bairro", headerName: "Bairro", flex: 1 },
                        { field: "oltRxPower", headerName: "Olt Rx Power", flex: 1, valueGetter: (params) => oltRxPowerValues[params.rowIndex] || '' }
                    ]}
                    selectionModel={pessoasSelecionadas}
                    onSelectionModelChange={(newSelection) => {
                        setPessoasSelecionadas(newSelection);
                        const mapeamentoTelefones = {};
                        newSelection.forEach((id) => {
                            const pessoa = clientesMkData.find((p) => p.id === id);
                            if (pessoa) {
                                mapeamentoTelefones[id] = pessoa.telefone;
                            }
                        });
                        setTelefonePorId(mapeamentoTelefones);
                    }}
                    checkboxSelection={true}
                    style={{ height: "55vh" }}
                    headerStyle={{
                        backgroundColor: "#020306",
                        color: "white",
                    }}
                />
            </Box>
        </>

    );
};

export default Configuracao;

import React, { useState, useEffect } from "react";
import { Box, Button, TextField, MenuItem } from "@mui/material";
import { Formik } from "formik";
import * as yup from "yup";
import useMediaQuery from "@mui/material/useMediaQuery";
import Header from "../../components/Header";
import Lista from "../../components/Lista";
import axios from "axios";

const Form = () => {
  const isNonMobile = useMediaQuery("(min-width:600px");
  const [estados, setEstados] = useState([]);
  const [cidades, setCidades] = useState([]);
  const [filteredCidades, setFilteredCidades] = useState([]);
  const [updateLista, setUpdateLista] = useState(false);


  const formatPhoneNumber = (phoneNumber) => {
    // Remove todos os caracteres não numéricos
    const numericPhoneNumber = phoneNumber.replace(/\D/g, "");
    // Formata o número no padrão (00) 0 0000-0000
    return `(${numericPhoneNumber.slice(0, 2)}) ${numericPhoneNumber.slice(2, 3)} ${numericPhoneNumber.slice(3, 7)}-${numericPhoneNumber.slice(7)}`;
  };

  const handleFormSubmit = (values) => {
    const dataAtual = new Date();
    const dataToSubmit = {
      ...values,
      cidade: values.idCidade, // Use idCidade instead of cidade
      dt_cadastro: dataAtual,
      ativo: 1
    };

    axios
      .post("https://main.d2zg9tfetcpofe.amplifyapp.com:3002/inserir_usuario", dataToSubmit)
      .then((response) => {
        console.log("Dados inseridos com sucesso:", response.dataToSubmit);
        // Adicione o console.log dos dados enviados para o servidor
        console.log("Dados do formulário enviados:", dataToSubmit);
        setUpdateLista(true);
      })
      .catch((error) => {
        console.error("Erro ao inserir dados:", error);
      });
  };

  const obterEstados = async () => {
    try {
      const response = await axios.get("https://main.d2zg9tfetcpofe.amplifyapp.com:3002/obter_estados");
      const estados = [...new Set(response.data.map((cidade) => cidade.estado))];
      setEstados(estados);
    } catch (error) {
      console.error("Erro ao obter lista de estados:", error);
    }
  };

  const obterCidadesPorEstado = async (estado) => {
    try {
      const response = await axios.get(`https://main.d2zg9tfetcpofe.amplifyapp.com:3002/obter_cidades?estado=${estado}`);
      setCidades(response.data);
      setFilteredCidades(response.data);
    } catch (error) {
      console.error("Erro ao obter lista de cidades:", error);
    }
  };

  useEffect(() => {
    obterEstados();
  }, []);

  const initialValues = {
    nome: "",
    cidade: "",
    bairro: "",
    estado: "",
    usuario: "",
    senha: "",
    telefone: "",
    email: "",
    cargo: "",
    idCidade: "",
  };


  return (
    <Box m="20px">
      <Header title="Criar Usuário" subtitle="Adicione novos usuários" />

      <Formik
        onSubmit={(values, { resetForm }) => {
          handleFormSubmit(values);
          resetForm();
        }}
        initialValues={initialValues}
        validationSchema={yup.object().shape({
          nome: yup.string().required("Campo obrigatório"),
          estado: yup.string().required("Campo obrigatório"),
          bairro: yup.string().required("Campo obrigatório"),
          usuario: yup.string().required("Campo obrigatório"),
          senha: yup
            .string()
            .required("Campo obrigatório")
            .min(6, "A senha deve ter pelo menos 6 caracteres") // Defina o mínimo desejado
            .matches(
              /^(?=.*[A-Z])(?=.*[a-z])(?=.*[0-9])(?=.*[!@#\$%^&*])/,
              "A senha deve conter pelo menos uma letra maiúscula, uma letra minúscula, um número e um caractere especial"
            ),
          telefone: yup.string().required("Campo obrigatório"),
          email: yup.string().email("E-mail inválido").required("Campo obrigatório"),
          cargo: yup.string().required("Campo obrigatório"),
        })}
      >
        {({
          values,
          errors,
          touched,
          handleBlur,
          handleChange,
          handleSubmit,
          resetForm,
        }) => (
          <form onSubmit={handleSubmit}>
            <Box
              display="grid"
              gap="10px"
              gridTemplateColumns="repeat(6, minmax(0, 1fr))" // Altere para 4 colunas
              sx={{
                "& > div": { gridColumn: isNonMobile ? undefined : "span 1" },
              }}
            >

              <TextField
                fullWidth
                variant="filled"
                type="text"
                label="Nome"
                onBlur={handleBlur}
                onChange={handleChange}
                value={values.nome}
                name="nome"
                error={!!touched.nome && (!!errors.nome || (values.isSubmitted && !!errors.nome))}
                helperText={touched.nome && (errors.nome || (values.isSubmitted && errors.nome))}
                sx={{ gridColumn: "span 2" }}
              />

              <TextField
                fullWidth
                variant="filled"
                type="email"
                label="E-mail"
                onBlur={handleBlur}
                onChange={handleChange}
                value={values.email}
                name="email"
                error={!!touched.email && (!!errors.email || (values.isSubmitted && !!errors.email))}
                helperText={touched.email && (errors.email || (values.isSubmitted && errors.email))}
                sx={{ gridColumn: "span 2" }}
              />

              <TextField
                fullWidth
                variant="filled"
                type="text"
                label="Telefone"
                onBlur={handleBlur}
                onChange={(e) => {
                  const formattedPhoneNumber = formatPhoneNumber(e.target.value);
                  handleChange({ target: { name: "telefone", value: formattedPhoneNumber } });
                }}
                value={values.telefone}
                name="telefone"
                error={!!touched.telefone && (!!errors.telefone || (values.isSubmitted && !!errors.telefone))}
                helperText={touched.telefone && (errors.telefone || (values.isSubmitted && errors.telefone))}
                sx={{ gridColumn: "span 2" }}
              />

              <TextField
                fullWidth
                select
                variant="filled"
                label="Estado"
                onBlur={handleBlur}
                onChange={(e) => {
                  handleChange(e);
                  obterCidadesPorEstado(e.target.value);
                }}
                value={values.estado}
                name="estado"
                error={!!touched.estado && !!errors.estado}
                helperText={touched.estado && errors.estado}
                sx={{ gridColumn: "span 2" }}
              >
                {estados
                  .slice()
                  .sort() // Sort the estados array alphabetically
                  .map((estado) => (
                    <MenuItem key={estado} value={estado}>
                      {estado}
                    </MenuItem>
                  ))}
              </TextField>

              <TextField
                fullWidth
                select
                variant="filled"
                label="Cidade"
                onBlur={handleBlur}
                onChange={handleChange}
                value={values.idCidade} // Use idCidade instead of cidade
                name="idCidade" // Use idCidade instead of cidade
                error={!!touched.idCidade && !!errors.idCidade}
                helperText={touched.idCidade && errors.idCidade}
                sx={{ gridColumn: "span 2" }}
              >
                {filteredCidades
                  .slice()
                  .sort((a, b) => a.nome.localeCompare(b.nome))
                  .map((cidade) => (
                    <MenuItem key={cidade.id} value={cidade.id}>
                      {cidade.nome}
                    </MenuItem>
                  ))}
              </TextField>

              <TextField
                fullWidth
                variant="filled"
                type="text"
                label="Bairro"
                onBlur={handleBlur}
                onChange={handleChange}
                value={values.bairro}
                name="bairro"
                error={!!touched.bairro && (!!errors.bairro || (values.isSubmitted && !!errors.bairro))}
                helperText={touched.bairro && (errors.bairro || (values.isSubmitted && errors.bairro))}
                sx={{ gridColumn: "span 2" }}
              />

              <TextField
                fullWidth
                variant="filled"
                type="text"
                label="Usuário"
                onBlur={handleBlur}
                onChange={handleChange}
                value={values.usuario}
                name="usuario"
                error={!!touched.usuario && (!!errors.usuario || (values.isSubmitted && !!errors.usuario))}
                helperText={touched.usuario && (errors.usuario || (values.isSubmitted && errors.usuario))}
                sx={{ gridColumn: "span 2" }}
              />

              <TextField
                fullWidth
                variant="filled"
                type="senha"
                label="Senha"
                onBlur={handleBlur}
                onChange={handleChange}
                value={values.senha}
                name="senha"
                error={!!touched.senha && (!!errors.senha || (values.isSubmitted && !!errors.senha))}
                helperText={touched.senha && (errors.senha || (values.isSubmitted && errors.senha))}
                sx={{ gridColumn: "span 2" }}
              />

              <TextField
                fullWidth
                select
                variant="filled"
                label="Cargo"
                onBlur={handleBlur}
                onChange={handleChange}
                value={values.cargo}
                name="cargo"
                error={!!touched.cargo && (!!errors.cargo || (values.isSubmitted && !!errors.cargo))}
                helperText={touched.cargo && (errors.cargo || (values.isSubmitted && errors.cargo))}
                sx={{ gridColumn: "span 2" }}
              >
                {["Master", "Admin", "Usuário"].map((cargo) => (
                  <MenuItem key={cargo} value={cargo}>
                    {cargo}
                  </MenuItem>
                ))}
              </TextField>

            </Box>

            <Box
              mt="20px"
              display="flex"
              justifyContent="center"
              textAlign="center">
              <Button
                type="button"
                variant="outlined"
                color="error"
                ml="10px"
                onClick={() => resetForm()}
              >
                Limpar
              </Button>
              <Button
                type="submit"
                variant="contained"
                color="primary"
              >
                Enviar
              </Button>
            </Box>
          </form>
        )}
      </Formik>
      <Lista update={updateLista} setUpdate={setUpdateLista} />
    </Box>

  );
};

export default Form;

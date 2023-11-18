import { useState } from "react";
import FullCalendar, { formatDate } from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import timeGridPlugin from "@fullcalendar/timegrid";
import interactionPlugin from "@fullcalendar/interaction";
import listPlugin from "@fullcalendar/list";
import {
  Box,
  List,
  ListItem,
  ListItemText,
  Typography,
  useTheme,
} from "@mui/material";
import Header from "../../components/Header";
import { tokens } from "../../theme";
import ptBrLocale from '@fullcalendar/core/locales/pt-br'; // Importe o arquivo de tradução

const Calendario = () => {
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);
  const [eventosAtuais, setEventosAtuais] = useState([]);

  const lidarComCliqueNaData = (selecionado) => {
    const titulo = prompt("Por favor, insira o nome do evento");
    const apiDoCalendario = selecionado.view.calendar;
    apiDoCalendario.unselect();

    if (titulo) {
      apiDoCalendario.addEvent({
        id: `${selecionado.dateStr}-${titulo}`,
        title: titulo,
        start: selecionado.startStr,
        end: selecionado.endStr,
        allDay: selecionado.allDay,
      });
    }
  };

  const lidarComCliqueNoEvento = (selecionado) => {
    if (
      window.confirm(
        `Você tem certeza que deseja deletar este evento? '${selecionado.event.title}'`
      )
    ) {
      selecionado.event.remove();
    }
  };

  return (
    <Box m="20px">
      <Header title="Calendário" subtitle="Seus eventos estão aqui" />

      <Box display="flex" justifyContent="space-between">
        {/* BARRA LATERAL DO CALENDÁRIO */}
        <Box
          flex="1 1 20%"
          backgroundColor={colors.primary[400]}
          p="15px"
          borderRadius="4px"
        >
          <Typography variant="h5">Eventos</Typography>
          <List>
            {eventosAtuais.map((evento) => (
              <ListItem
                key={evento.id}
                sx={{
                  backgroundColor: colors.greenAccent[500],
                  margin: "10px 0",
                  borderRadius: "2px",
                }}
              >
                <ListItemText
                  primary={evento.title}
                  secondary={
                    <Typography>
                      {new Date(evento.start).toLocaleDateString("pt-BR")} {" "}
                    </Typography> 
                  }
                />
              </ListItem>
            ))}
          </List>
        </Box>

        {/* CALENDÁRIO */}
        <Box flex="1 1 100%" ml="15px">
          <FullCalendar
            height="75vh"
            plugins={[
              dayGridPlugin,
              timeGridPlugin,
              interactionPlugin,
              listPlugin,
            ]}
            headerToolbar={{
              left: "prev,next today",
              center: "title",
              right: "dayGridMonth,timeGridWeek,timeGridDay,listMonth",
            }}
            initialView="dayGridMonth"
            editable={true}
            selectable={true}
            selectMirror={true}
            dayMaxEvents={true}
            select={lidarComCliqueNaData}
            eventClick={lidarComCliqueNoEvento}
            eventsSet={(eventos) => setEventosAtuais(eventos)}
            /* initialEvents={[]} */
            locales={[ ptBrLocale ]} // Adicione o locale de tradução
            locale="pt-br" // Defina o locale como "pt-br"
          />
        </Box>
      </Box>
    </Box>
  );
};

export default Calendario;

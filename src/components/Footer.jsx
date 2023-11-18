import { Typography, Box, useTheme } from "@mui/material";
import { tokens } from "../theme";

const Footer = ({ title, subtitle }) => {
    const theme = useTheme();
    const colors = tokens(theme.palette.mode);
    
    const style = {
        marginBottom: "30px",
        footer: {
            backgroundColor: "#1a252f",
            color: "#C8C8C8",
            textAlign: "center",
            fontWeight: "700",
            fontSize: "1px",
            padding: "1rem 0",
        },
        footerImg: {
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            margin: "1rem",
        },
        footerImgImg: {
            width: "auto",
            height: "1.5rem",
        },
    };
    
    return (
        <Box style={style}>
            <>
                <footer style={style.footer}>
                    <div style={style.footerImg}>
                        <img src="img\logo_endbar.png" alt=""></img>
                    </div>
                    <div class="footer__social">
                        <a href="#" class="footer__icon"><i class='bx bxl-facebook' ></i></a>
                        <a href="#" class="footer__icon"><i class='bx bxl-instagram' ></i></a>
                        <a href="#" class="footer__icon"><i class='bx bxl-whatsapp' ></i></a>
                    </div>
                    <p class="footer__copy">&#169; 2023 ADUNISC. Todos direitos reservados. Desenvolvido por Quidittas Web Soluções</p>
                </footer>
            </>
        </Box>
    );
};

export default Footer;

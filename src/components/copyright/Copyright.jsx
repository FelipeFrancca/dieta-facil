import { Box, Link, Typography } from "@mui/material";

export default function Copyright(props) {
  return (
    <Box className="Copyright" sx={{display: "flex", justifyContent: "center", mt: 2}}>
      <Typography>
        <Link sx={{textDecoration: "none", color: "000"}} href="https://felipefrancca-portfolio.netlify.app" target="blank">
          Felipe França
        </Link>{" "}
        {"Copyright "}
        {new Date().getFullYear()}
        {" ©"}
      </Typography>
    </Box>
  );
}

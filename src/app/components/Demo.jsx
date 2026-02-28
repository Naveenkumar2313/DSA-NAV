import { Box, Typography } from "@mui/material";

const Demo = () => {
  return (
    <Box
      display="flex"
      justifyContent="center"
      alignItems="center"
      minHeight="100vh"
      flexGrow={1}
    >
      <Typography variant="h2" component="h1">
        Demo
      </Typography>
    </Box>
  );
};

export default Demo; 
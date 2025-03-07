import React from 'react';
import { Container, Typography, Box, Paper } from '@mui/material';
import { Helmet } from 'react-helmet';

export default function Disclaimer() {
  return (
    <Container maxWidth="md" sx={{ py: 4 }}>
      <Helmet>
        <title>Disclaimer - WSBN.tech PDF Toolkit</title>
      </Helmet>
      
      <Paper elevation={1} sx={{ p: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          Disclaimer
        </Typography>

        <Box sx={{ mt: 3 }}>
          <Typography variant="h6" gutterBottom>
            1. Service Availability
          </Typography>
          <Typography paragraph>
            We strive to provide uninterrupted service but cannot guarantee that our website will be available at all times. We reserve the right to modify or discontinue the service without notice.
          </Typography>

          <Typography variant="h6" gutterBottom>
            2. File Processing
          </Typography>
          <Typography paragraph>
            While we make every effort to ensure accurate PDF processing, we cannot guarantee that all operations will be successful with every PDF file. Users are advised to keep backups of their original files.
          </Typography>

          <Typography variant="h6" gutterBottom>
            3. No Warranty
          </Typography>
          <Typography paragraph>
            The service is provided "as is" without any warranties, express or implied. We do not warrant that the service will be error-free or uninterrupted.
          </Typography>

          <Typography variant="h6" gutterBottom>
            4. Limitation of Liability
          </Typography>
          <Typography paragraph>
            We shall not be liable for any direct, indirect, incidental, special, or consequential damages resulting from the use or inability to use our services.
          </Typography>

          <Typography variant="h6" gutterBottom>
            5. User Responsibility
          </Typography>
          <Typography paragraph>
            Users are responsible for ensuring they have the right to process any PDF files they upload and for maintaining backups of their important documents.
          </Typography>
        </Box>
      </Paper>
    </Container>
  );
} 
import React from 'react';
import { Container, Typography, Box, Paper } from '@mui/material';
import { Helmet } from 'react-helmet';

export default function PrivacyPolicy() {
  return (
    <Container maxWidth="md" sx={{ py: 4 }}>
      <Helmet>
        <title>Privacy Policy - WSBN.tech PDF Toolkit</title>
      </Helmet>
      
      <Paper elevation={1} sx={{ p: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          Privacy Policy
        </Typography>

        <Box sx={{ mt: 3 }}>
          <Typography variant="h6" gutterBottom>
            1. Information Collection
          </Typography>
          <Typography paragraph>
            We do not collect or store any of your PDF files or personal information. All file processing is performed locally in your browser.
          </Typography>

          <Typography variant="h6" gutterBottom>
            2. Data Processing
          </Typography>
          <Typography paragraph>
            All PDF operations (merging, splitting, stamping, etc.) are performed entirely within your browser. Your files never leave your device and are not uploaded to any server.
          </Typography>

          <Typography variant="h6" gutterBottom>
            3. Cookies and Analytics
          </Typography>
          <Typography paragraph>
            We use minimal cookies necessary for the website's basic functionality. We may use anonymous analytics to improve our service.
          </Typography>

          <Typography variant="h6" gutterBottom>
            4. Third-Party Services
          </Typography>
          <Typography paragraph>
            Our website may include links to third-party websites. We are not responsible for the privacy practices of these external sites.
          </Typography>

          <Typography variant="h6" gutterBottom>
            5. Updates to Privacy Policy
          </Typography>
          <Typography paragraph>
            We may update this privacy policy from time to time. Any changes will be posted on this page.
          </Typography>
        </Box>
      </Paper>
    </Container>
  );
} 
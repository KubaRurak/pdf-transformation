import * as React from 'react';
import Grid from '@mui/material/Grid';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Container from '@mui/material/Container';
import MergeIcon from '@mui/icons-material/MergeType';
import CallSplitIcon from '@mui/icons-material/CallSplit';
import FeatureCard from './FeatureCard';


function AlbumComponent() {

  return (
    <>
      <main>
        {/* Hero unit */}
        <Box
          sx={{
            pt: 8,
            pb: 0,
          }}
        >
          <Container maxWidth="sm">
            <Typography
              component="h1"
              variant="h2"
              align="center"
              color="text.primary"
              gutterBottom
            >
              Album layout
            </Typography>
            <Typography variant="h5" align="center" color="text.secondary" paragraph>
              Something short and leading about the collection below—its contents,
              the creator, etc. Make it short and sweet, but not too short so folks
              don&apos;t simply skip over it entirely.
            </Typography>
          </Container>
        </Box>
        <Container sx={{ py: 4 }} maxWidth="lg">
          <Grid container spacing={2}>
            <Grid item xs={12} sm={6} md={2.4}>
              <FeatureCard
                IconComponent={MergeIcon}
                title="Merge PDFs"
                description="Combine multiple PDFs in whatever order you want."
                route="/merge-pdfs"
              />
            </Grid>
            <Grid item xs={12} sm={6} md={2.4}>
              <FeatureCard
                IconComponent={CallSplitIcon}
                title="Split pdfs"
                description="Split pdfs into multiple files."
                route="/-pdfs"
              />
            </Grid>
          </Grid>
        </Container>
      </main>
    </>
  );
}

export default AlbumComponent
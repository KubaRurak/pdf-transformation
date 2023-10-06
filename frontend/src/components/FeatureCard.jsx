import { useNavigate } from 'react-router-dom';
import ButtonBase from '@mui/material/ButtonBase';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Typography from '@mui/material/Typography';

function FeatureCard({ IconComponent, title, description, route }) {
  const navigate = useNavigate();

  const handleCardClick = () => {
    navigate(route);
  };

  return (
    <ButtonBase onClick={handleCardClick} style={{ width: '100%' }}>
      <Card
        sx={{ 
          width: '100%', 
          height: 200,
          display: 'flex', 
          flexDirection: 'column', 
          position: 'relative', 
          padding: 1,
          transition: 'background-color 0.3s, transform 0.3s', // smooth transition for background color and scaling
          "&:hover": {
            backgroundColor: '#f5f5f5', // slight grey on hover
          },
          "&:hover > svg": {
            fontSize: 45, // make icon slightly bigger on hover
          }
        }}
      >
        <IconComponent color="primary" sx={{ fontSize: 45, position: 'absolute', top: 15, left: 15 }} />
        <CardContent sx={{ mt: 5, pt: 3, pb: 1 }}>
          <Typography align="left" gutterBottom variant="h6" component="div" sx={{fontWeight: 700}}>
            {title}
          </Typography>
          <Typography align="left" variant="body2" sx={{ mt: 1, fontWeight: 600 }} color="text.secondary">
            {description}
          </Typography>
        </CardContent>
      </Card>
    </ButtonBase>
  );
}

export default FeatureCard;
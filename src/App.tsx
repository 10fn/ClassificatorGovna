import { Paper } from '@mui/material';

function App() {
  return (
    <Paper
      elevation={3}
      sx={{
        width: 800,
        height: 600,
        position: 'absolute',
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -50%)',
        p: 4,
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
      }}
    >

    </Paper>
  );
}

export default App;
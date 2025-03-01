// import { useState } from 'react'
// import reactLogo from './assets/react.svg'
// import viteLogo from '/vite.svg'
// import './App.css'

// function App() {
//   const [emailContent, setEmailContent] = useState('')
//   const [tone, setTone] = useState('')
//   const [generatedReply, setGeneratedReply] = useState('')
//   const [loading, setLoading] = useState(false)
//   const [error, setError] = useState('')

//   return (
//     <>
      
//     </>
//   )
// }

// export default App

import { useState } from 'react'
import viteLogo from '/vite.svg'
import './App.css'
import { 
  Container, 
  Typography, 
  TextField, 
  FormControl, 
  InputLabel, 
  Select, 
  MenuItem, 
  Button, 
  Box, 
  CircularProgress, 
  Paper, 
  Alert, 
  Divider,
  Card,
  CardContent
} from '@mui/material'
import axios from 'axios'

function App() {
  const [emailContent, setEmailContent] = useState('')
  const [tone, setTone] = useState('professional')
  const [generatedReply, setGeneratedReply] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleGenerateReply = async () => {
    // Validate input
    if (!emailContent.trim()) {
      setError('Please enter an email to respond to')
      return
    }

    setLoading(true)
    setError('')
    
    try {
      const response = await axios.post('http://localhost:8080/api/email/generate', {
        emailContent,
        tone
      })

      console.log(response)
      
      setGeneratedReply(typeof response.data === 'string' ? response.data : JSON.stringify(response.data))
    } catch (err) {
      console.error('Error generating reply:', err)
      setError('Failed to generate reply. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const handleCopyToClipboard = () => {
    navigator.clipboard.writeText(generatedReply)
      .then(() => {
        alert('Reply copied to clipboard!')
      })
      .catch(err => {
        console.error('Failed to copy text: ', err)
      })
  }

  return (
    <Container maxWidth="md" sx={{ py: 4 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 4 }}>
        <img src={viteLogo} alt="Vite logo" style={{ height: '40px', marginRight: '16px' }} />
        <Typography variant="h4" component="h1">
          Email Reply Generator
        </Typography>
      </Box>

      <Paper elevation={3} sx={{ p: 3, mb: 4 }}>
        <Typography variant="h6" gutterBottom>
          Input
        </Typography>
        
        <TextField
          label="Paste email to respond to"
          multiline
          rows={6}
          fullWidth
          value={emailContent || ''}
          onChange={(e) => setEmailContent(e.target.value)}
          placeholder="Paste the email you want to respond to here..."
          variant="outlined"
          sx={{ mb: 3 }}
        />
        
        <FormControl fullWidth sx={{ mb: 3 }}>
          <InputLabel id="tone-select-label">Reply Tone</InputLabel>
          <Select
            labelId="tone-select-label"
            id="tone-select"
            value={tone || ''}
            label="Reply Tone"
            onChange={(e) => setTone(e.target.value)}
          >
            <MenuItem value="professional">Professional</MenuItem>
            <MenuItem value="friendly">Friendly</MenuItem>
            <MenuItem value="formal">Formal</MenuItem>
            <MenuItem value="casual">Casual</MenuItem>
            <MenuItem value="apologetic">Apologetic</MenuItem>
            <MenuItem value="grateful">Grateful</MenuItem>
          </Select>
        </FormControl>
        
        <Button 
          variant="contained" 
          color="primary" 
          onClick={handleGenerateReply}
          disabled={!emailContent || loading}
          fullWidth
          size="large"
        >
          {loading ? <CircularProgress size={24} color="inherit" /> : 'Generate Reply'}
        </Button>
        
        {error && <Alert severity="error" sx={{ mt: 2 }}>{error}</Alert>}
      </Paper>

      {generatedReply && (
        <Card variant="outlined" sx={{ mb: 4 }}>
          <CardContent>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
              <Typography variant="h6">
                Generated Reply
              </Typography>
              <Button 
                variant="outlined" 
                size="small"
                onClick={handleCopyToClipboard}
              >
                Copy to Clipboard
              </Button>
            </Box>
            <Divider sx={{ mb: 2 }} />
            <Typography 
              variant="body1" 
              sx={{ 
                whiteSpace: 'pre-wrap',
                textAlign: 'left' // Explicitly set text alignment to left
              }}
            >
              {generatedReply}
            </Typography>
          </CardContent>
        </Card>
      )}
    </Container>
  )
}

export default App

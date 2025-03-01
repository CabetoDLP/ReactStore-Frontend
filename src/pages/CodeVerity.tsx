import React, { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom'; // Importa useNavigate
import axiosInstance from '../api/axios';
import {
  TextField,
  Button,
  Typography,
  Container,
  Box,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
} from '@mui/material';

const CodeVerity: React.FC = () => {
  const location = useLocation();
  const searchParams = new URLSearchParams(location.search);
  const email = searchParams.get('email');
  const [digits, setDigits] = useState<string[]>(Array(6).fill(''));
  const [message, setMessage] = useState<string>('');
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const navigate = useNavigate(); // Inicializa useNavigate

  const handleDigitChange = (index: number, value: string) => {
    const newDigits = [...digits];
    newDigits[index] = value;
    setDigits(newDigits);

    if (value && index < 5) {
      const nextInput = document.getElementById(`digit-${index + 1}`);
      if (nextInput) {
        nextInput.focus();
      }
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === 'Backspace' && !digits[index] && index > 0) {
      const prevInput = document.getElementById(`digit-${index - 1}`);
      if (prevInput) {
        prevInput.focus();
      }
    }
  };

  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const pastedText = e.clipboardData.getData('text');

    if (pastedText.length === 6) {
      const newDigits = pastedText.split('');
      setDigits(newDigits);

      const lastInput = document.getElementById(`digit-5`);
      if (lastInput) {
        lastInput.focus();
      }
    } else {
      setMessage('The verification code must have 6 characters.');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!email) {
      setMessage('Email is missing in the URL.');
      setIsModalOpen(true);
      return;
    }

    const code = digits.join('');

    try {
      const response = await axiosInstance.post('/users/verify', { email, code });
      setMessage(response.data.message);
      setIsModalOpen(true);

      // Si la verificación es exitosa, redirige al usuario a /login
      if (response.status === 200) {
        setTimeout(() => {
          navigate('/login'); // Redirige después de mostrar el mensaje
        }, 2000); // Espera 2 segundos antes de redirigir
      }
    } catch (error: any) {
      setMessage(error.response?.data?.message || 'Error verifying account');
      setIsModalOpen(true);
    }
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
  };

  return (
    <Container maxWidth="sm">
      <Box sx={{ marginTop: 8, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
        <Typography component="h1" variant="h5">
          Verify Your Account
        </Typography>
        <Box component="form" onSubmit={handleSubmit} sx={{ mt: 3 }}>
          <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center' }}>
            {digits.map((digit, index) => (
              <TextField
                key={index}
                id={`digit-${index}`}
                variant="outlined"
                margin="normal"
                inputProps={{
                  maxLength: 1,
                  style: { textAlign: 'center' },
                }}
                value={digit}
                onChange={(e) => handleDigitChange(index, e.target.value)}
                onKeyDown={(e) => handleKeyDown(index, e)}
                onPaste={index === 0 ? handlePaste : undefined}
                required
              />
            ))}
          </Box>
          <Button
            fullWidth
            type="submit"
            variant="contained"
            sx={{ mt: 3, mb: 2 }}
          >
            Verify
          </Button>
        </Box>
      </Box>

      {/* Modal para mostrar el mensaje de éxito o error */}
      <Dialog open={isModalOpen} onClose={handleCloseModal}>
        <DialogTitle>Verification Result</DialogTitle>
        <DialogContent>
          <DialogContentText>{message}</DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseModal} color="primary">
            Close
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default CodeVerity;
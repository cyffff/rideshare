import React, { useState, useEffect } from 'react';
import {
  Box,
  Button,
  Typography,
  Card,
  CardContent,
  CircularProgress,
  TextField,
  Alert,
  CardMedia,
  Paper,
  Divider
} from '@mui/material';
import { CreditCard as CreditCardIcon, Lock as LockIcon } from '@mui/icons-material';
import { loadStripe } from '@stripe/stripe-js';
import {
  CardElement,
  Elements,
  useStripe,
  useElements,
  CardNumberElement,
  CardExpiryElement,
  CardCvcElement
} from '@stripe/react-stripe-js';
import axios from 'axios';

// Define Payment Props
interface PaymentProps {
  amount: number;
  rideId: number;
  onSuccess: () => void;
  onCancel: () => void;
}

// Credit Card Form Component
const CreditCardForm: React.FC<PaymentProps> = ({ amount, rideId, onSuccess, onCancel }) => {
  const stripe = useStripe();
  const elements = useElements();
  
  const [succeeded, setSucceeded] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [processing, setProcessing] = useState(false);
  const [clientSecret, setClientSecret] = useState('');
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');

  useEffect(() => {
    // Create PaymentIntent as soon as the component mounts
    createPaymentIntent();
  }, []);

  const createPaymentIntent = async () => {
    try {
      const response = await axios.post(`/api/payments/create-payment-intent`, {
        amount,
        rideId
      });
      
      setClientSecret(response.data.clientSecret);
    } catch (err) {
      console.log('Error creating payment intent:', err);
      setError('Failed to initialize payment. Please try again.');
    }
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    if (!stripe || !elements) {
      // Stripe.js has not loaded yet
      return;
    }

    setProcessing(true);

    try {
      const cardElement = elements.getElement(CardElement);
      
      if (!cardElement) {
        throw new Error('Card element not found');
      }

      const payload = await stripe.confirmCardPayment(clientSecret, {
        payment_method: {
          card: cardElement,
          billing_details: {
            name: name,
            email: email,
          },
        },
      });

      if (payload.error) {
        setError(`Payment failed: ${payload.error.message}`);
        setProcessing(false);
      } else {
        setError(null);
        setSucceeded(true);
        setProcessing(false);
        
        // Call the API to finalize the payment on backend
        await axios.post(`/api/rides/${rideId}/process-payment`, {
          paymentIntentId: payload.paymentIntent.id
        });
        
        // Call onSuccess callback
        onSuccess();
      }
    } catch (err) {
      console.error('Payment error:', err);
      setError('An unexpected error occurred. Please try again.');
      setProcessing(false);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}
      
      {succeeded && (
        <Alert severity="success" sx={{ mb: 2 }}>
          Payment successful!
        </Alert>
      )}
      
      <Box mb={3}>
        <TextField
          label="Name on card"
          variant="outlined"
          fullWidth
          required
          value={name}
          onChange={(e) => setName(e.target.value)}
          disabled={processing || succeeded}
        />
      </Box>
      
      <Box mb={3}>
        <TextField
          label="Email"
          variant="outlined"
          fullWidth
          type="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          disabled={processing || succeeded}
        />
      </Box>
      
      <Box mb={3}>
        <Typography variant="subtitle2" gutterBottom component="div">
          Card Details
        </Typography>
        <Paper variant="outlined" sx={{ p: 2 }}>
          <CardElement
            options={{
              style: {
                base: {
                  fontSize: '16px',
                  color: '#424770',
                  '::placeholder': {
                    color: '#aab7c4',
                  },
                },
                invalid: {
                  color: '#9e2146',
                },
              },
            }}
          />
        </Paper>
      </Box>
      
      <Box display="flex" justifyContent="space-between">
        <Button 
          onClick={onCancel}
          disabled={processing}
          variant="outlined"
        >
          Cancel
        </Button>
        <Button
          type="submit"
          variant="contained"
          color="primary"
          disabled={processing || succeeded || !stripe}
          startIcon={processing ? <CircularProgress size={20} /> : <LockIcon />}
        >
          {processing ? 'Processing...' : `Pay $${amount.toFixed(2)}`}
        </Button>
      </Box>
    </form>
  );
};

// Main Payment Component
const Payment: React.FC<PaymentProps> = (props) => {
  const [stripePromise, setStripePromise] = useState<any>(null);

  useEffect(() => {
    // Fetch publishable key from backend
    const getPublishableKey = async () => {
      try {
        const response = await axios.get('/api/payments/publishable-key');
        const stripePublishableKey = response.data.publishableKey;
        setStripePromise(loadStripe(stripePublishableKey));
      } catch (error) {
        console.error('Error fetching Stripe publishable key:', error);
      }
    };

    getPublishableKey();
  }, []);

  return (
    <Card elevation={3}>
      <CardMedia
        component="img"
        height="140"
        image="/payment-header.jpg"
        alt="Credit card payment"
        sx={{ objectFit: 'cover' }}
      />
      <CardContent>
        <Box mb={3}>
          <Typography variant="h5" component="div" gutterBottom>
            Payment Details
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Your payment is secure and processed via Stripe.
          </Typography>
        </Box>
        
        <Box mb={3}>
          <Typography variant="h6" gutterBottom>
            Ride Summary
          </Typography>
          <Box display="flex" justifyContent="space-between" mb={1}>
            <Typography variant="body1">Ride fare</Typography>
            <Typography variant="body1">${(props.amount * 0.9).toFixed(2)}</Typography>
          </Box>
          <Box display="flex" justifyContent="space-between" mb={1}>
            <Typography variant="body1">Service fee</Typography>
            <Typography variant="body1">${(props.amount * 0.1).toFixed(2)}</Typography>
          </Box>
          <Divider sx={{ my: 1 }} />
          <Box display="flex" justifyContent="space-between">
            <Typography variant="h6">Total</Typography>
            <Typography variant="h6">${props.amount.toFixed(2)}</Typography>
          </Box>
        </Box>
        
        {stripePromise ? (
          <Elements stripe={stripePromise}>
            <CreditCardForm {...props} />
          </Elements>
        ) : (
          <Box display="flex" justifyContent="center" p={3}>
            <CircularProgress />
          </Box>
        )}
      </CardContent>
    </Card>
  );
};

export default Payment; 
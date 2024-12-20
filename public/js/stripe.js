/* eslint-disable */
import axios from 'axios';
import { showAlert } from './alerts';

export const bookTour = async tourId => {
  try {
    // 1) Get checkout session from API
    const session = await axios(`/api/v1/bookings/checkout-session/${tourId}`);

    if (!session.data.session || !session.data.session.id) {
      throw new Error('Invalid session data received from the server');
    }

    // 2) Create Stripe instance
    const stripe = Stripe(session.data.stripePublicKey); // Assuming you're sending the public key from the server

    // 3) Redirect to Stripe checkout
    const result = await stripe.redirectToCheckout({
      sessionId: session.data.session.id
    });

    if (result.error) {
      throw new Error(result.error.message);
    }
  } catch (err) {
    console.error('Stripe checkout error:', err);
    showAlert(
      'error',
      err.message || 'An error occurred during checkout. Please try again.'
    );
  }
};

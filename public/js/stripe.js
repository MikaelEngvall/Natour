/* eslint-disable */
import axios from 'axios';
import { showAlert } from './alerts';

export const bookTour = async tourId => {
  // 1) Get checkout session from API
  const stripe = Stripe(
    'pk_test_51QW3qOFmUcckFLm4YwmyldApnjbIqujmsCYXsIWrEANImlFbEbHHUaq3LOndDM2iSooiw53aetvLbD1lmJr3Gqah001lEypxPg'
  );
  try {
    const session = await axios(`/api/v1/bookings/checkout-session/${tourId}`);
    // console.log(session);
    // 2) Create checkout form  + change credit card
    await stripe.redirectToCheckout({
      sessionId: session.data.session.id
    });
  } catch (err) {
    console.log(err);
    showAlert('error', err);
  }
};

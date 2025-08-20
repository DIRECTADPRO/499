// Location: netlify/functions/create-payment-intent.js
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

exports.handler = async (event) => {
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: 'Method Not Allowed' };
  }

  try {
    const { amount } = JSON.parse(event.body);

    // Basic validation to ensure amount is a number and within a reasonable range
    if (!amount || typeof amount !== 'number' || amount < 499 || amount > 10000) {
        return { statusCode: 400, body: 'Invalid amount.' };
    }

    const paymentIntent = await stripe.paymentIntents.create({
      amount: amount,
      currency: 'usd',
      automatic_payment_methods: {
        enabled: true,
      },
    });

    return {
      statusCode: 200,
      body: JSON.stringify({ clientSecret: paymentIntent.client_secret }),
    };
  } catch (error) {
    console.error('Error creating PaymentIntent:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: 'Failed to create payment intent.' }),
    };
  }
};
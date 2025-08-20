// Location: netlify/functions/generate-invite.js
const fetch = require('node-fetch');

exports.handler = async (event) => {
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: 'Method Not Allowed' };
  }

  const { email } = JSON.parse(event.body);
  const { NETLIFY_API_TOKEN, SITE_ID } = process.env;

  if (!email) {
    return { statusCode: 400, body: 'Email is required.' };
  }
  
  const NETLIFY_IDENTITY_URL = `https://${SITE_ID}.netlify.app/.netlify/identity`;

  try {
    const inviteResponse = await fetch(`${NETLIFY_IDENTITY_URL}/invite`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${NETLIFY_API_TOKEN}` },
      body: JSON.stringify({ email: email }),
    });

    if (!inviteResponse.ok) {
      const errorData = await inviteResponse.json();
      console.error("Netlify Identity Error:", errorData);
      throw new Error('Could not invite user.');
    }

    const userData = await inviteResponse.json();
    const inviteLink = userData.action_link;

    return {
      statusCode: 200,
      body: JSON.stringify({ inviteLink: inviteLink }),
    };

  } catch (error) {
    console.error('Error:', error.message);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: 'Failed to generate invite link.' }),
    };
  }
};
// Location: netlify/functions/generate-invite.js
const { createClient } = require('@supabase/supabase-js');

exports.handler = async (event) => {
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: 'Method Not Allowed' };
  }

  try {
    const { email } = JSON.parse(event.body);
    if (!email) {
      return { statusCode: 400, body: 'Email is required.' };
    }

    const supabase = createClient(
      process.env.SUPABASE_URL,
      process.env.SUPABASE_SERVICE_KEY
    );

    // We will attempt to invite the user by email
    const { data, error } = await supabase.auth.admin.inviteUserByEmail(email);

    // The Supabase client throws an error if it fails.
    // If an error object is returned without throwing, this is a safety check.
    if (error) {
      // We re-throw the error to be caught by our catch block below
      throw error;
    }

    console.log("Successfully invited a NEW user:", data);
    // This is the success case for a brand new user
    return {
      statusCode: 200,
      body: JSON.stringify({ status: 'invite_sent', message: `Invite sent to new user ${email}` }),
    };

  } catch (error) {
    // This `catch` block will handle all errors, including the "user already exists" case
    
    if (error.code === 'email_exists' || (error.message && error.message.includes('already been registered'))) {
        console.log(`User with email ${email} already exists. This is a success case.`);
        // THIS IS NOT A FATAL ERROR. The user paid and already has an account.
        // We return a 200 OK status with a special `status` so the frontend knows what to do.
        return {
            statusCode: 200,
            body: JSON.stringify({ status: 'user_exists', message: 'User already has an account.' })
        };
    }

    // This is a real, unexpected error
    console.error('Error in function execution:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: 'Failed to process registration.' }),
    };
  }
};
// Location: netlify/functions/generate-invite.js
const { createClient } = require('@supabase/supabase-js');

exports.handler = async (event) => {
  // Ensure the request is a POST
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: 'Method Not Allowed' };
  }

  try {
    const { email } = JSON.parse(event.body);
    if (!email) {
      return { statusCode: 400, body: 'Email is required.' };
    }

    // Initialize the Supabase client with your new environment variables
    // This uses the service_role key, which has admin rights to invite users
    const supabase = createClient(
      process.env.SUPABASE_URL,
      process.env.SUPABASE_SERVICE_KEY
    );

    // Use the Supabase Admin command to invite a new user
    // This will send an email with an invite link to the user
    const { data, error } = await supabase.auth.admin.inviteUserByEmail(email);

    // Handle any errors from Supabase
    if (error) {
      console.error("Supabase Invite Error:", error);
      throw new Error(error.message);
    }
    
    console.log("Successfully invited user:", data);

    // Success!
    return {
      statusCode: 200,
      body: JSON.stringify({ message: `Invite sent successfully to ${email}` }),
    };

  } catch (error) {
    console.error('Error in function execution:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: 'Failed to generate invite link.' }),
    };
  }
};
const axios = require('axios');

exports.handler = async function (event, context) {
  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      body: JSON.stringify({ message: 'Method Not Allowed' })
    };
  }

  console.log(event.body);
  const { username, access_token } = JSON.parse(event.body);

  try {
    // Kullanıcı bilgilerini al
    const userResponse = await axios.get(`https://api.intra.42.fr/v2/users/${username}`, {
      headers: { Authorization: `Bearer ${access_token}` }
    });

    const userId = userResponse.data.id;

    // Kullanıcının etkinliklerini al
    const userEventsResponse = await axios.get(`https://api.intra.42.fr/v2/users/${userId}/events`, {
      headers: { Authorization: `Bearer ${access_token}` }
    });
    console.log(userEventsResponse)
    return {
      statusCode: 200,
      body: JSON.stringify({
        events: userEventsResponse.data
      })
    };

  } catch (error) {
    return {
      statusCode: error.response?.status || 500,
      body: JSON.stringify({ error: error.message })
    };
  }
};

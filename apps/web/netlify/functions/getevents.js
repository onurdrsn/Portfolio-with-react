const axios = require('axios');
const querystring = require('querystring'); // BU YENİ

exports.handler = async function (event, context) {
  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      body: JSON.stringify({ message: 'Method Not Allowed' })
    };
  }

  // Gelen x-www-form-urlencoded veriyi çöz
  const payload = querystring.parse(event.body); // BU YENİ

  try {
    const response = await axios.post('https://api.intra.42.fr/oauth/token',
      new URLSearchParams({
        ...payload,
      }).toString(),
      {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded'
        }
      }
    );

    return {
      statusCode: 200,
      body: JSON.stringify(response.data)
    };

  } catch (error) {
    return {
      statusCode: error.response?.status || 500,
      body: JSON.stringify({ error: error.message })
    };
  }
};

const twilio = require('twilio');
const { TWILIO_SID, TWILIO_AUTH_TOKEN, TWILIO_PHONE_NUMBER } = process.env;

const client = twilio(TWILIO_SID, TWILIO_AUTH_TOKEN);

async function sendReadyText(phone, nameOrNumber) {
  try {
    await client.messages.create({
      body: `Hi ${nameOrNumber}, your order is ready for pickup!`,
      from: TWILIO_PHONE_NUMBER,
      to: phone
    });
    console.log(`Text sent to ${phone}`);
  } catch (err) {
    console.error(`Failed to send SMS:`, err.message);
  }
}

module.exports = { sendReadyText };

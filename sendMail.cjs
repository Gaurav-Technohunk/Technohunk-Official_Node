require('dotenv').config();

const express = require('express');
const nodemailer = require('nodemailer');
const cors = require('cors');
const bodyParser = require('body-parser');
const app = express();
const PORT = process.env.PORT;

app.use(cors());
app.use(bodyParser.json());

// Configure the transporter with Gmail + App Password
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.USER,
    pass: process.env.PASS
  }
});

// Route to send email
app.post('/api/sendMail', async (req, res) => {
  const { name, email, number, area, message } = req.body;

  // Basic validation
  if (!name || !email || !number || !area || !message) {
    return res.status(400).json({ error: 'All fields are required.' });
  }

  // Log incoming payload for debugging
  console.log('Payload received:', req.body);

  const mailOptions = {
    from: 'latestaltfordiscord@gmail.com',
    to: 'latestaltfordiscord@gmail.com',
    subject: `New Message from ${name}`,
    replyTo: email,
    text: `
Name: ${name}
Email: ${email}
Number: ${number}
Area: ${area}
Message: ${message}
    `
  };

  try {
    // Attempt to send the email
    const info = await transporter.sendMail(mailOptions);
    console.log('Email sent:', info.messageId);
    res.json({ success: true, messageId: info.messageId });
  } catch (error) {
    console.error('Error sending email:', error);
    res.status(500).json({ error: 'Failed to send email.', details: error.message });
  }
});

// Start the server
app.listen(PORT, () => {
  console.log(`✅ Server running on port ${PORT}`);
});
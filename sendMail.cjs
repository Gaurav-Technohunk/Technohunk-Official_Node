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
  // Support both payload formats
  // Old: { name, email, number, area, message }
  // New: { name, email, subject, phone, message }
  const {
    name,
    email,
    number,
    area,
    message,
    subject,
    phone
  } = req.body;

  // Determine which format is being used
  let mailText = '';
  let mailSubject = '';
  if (subject && phone) {
    // New format
    mailSubject = `New Message (${subject}) from ${name}`;
    mailText = `Name: ${name}\nEmail: ${email}\nPhone: ${phone}\nSubject: ${subject}\nMessage: ${message}`;
    if (!name || !email || !phone || !subject || !message) {
      return res.status(400).json({ error: 'All fields are required.' });
    }
  } else {
    // Old format
    mailSubject = `New Message from ${name}`;
    mailText = `Name: ${name}\nEmail: ${email}\nNumber: ${number}\nArea: ${area}\nMessage: ${message}`;
    if (!name || !email || !number || !area || !message) {
      return res.status(400).json({ error: 'All fields are required.' });
    }
  }

  // Log incoming payload for debugging
  console.log('Payload received:', req.body);

  const mailOptions = {
    from: 'gaurav.119@gmail.com',
    to: 'gaurav.119@gmail.com',
    subject: mailSubject,
    replyTo: email,
    text: mailText
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
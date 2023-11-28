const nodemailer = require('nodemailer');
require('dotenv').config();
const axios = require('axios');

exports.sendEmail = async (req, res) => {
    const { name, email, message } = req.body;

    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.EMAIL_GMAIL,
        pass: process.env.PASS_GMAIL,
      }
    });
  
    const mailOptions = {
      from: process.env.EMAIL_GMAIL,
      to: "mattianoris.business@gmail.com",
      subject: 'Assistenza - Modulo di contatto',
      html: `
        <p>Ciao,</p>
        <p>Hai ricevuto un nuovo messaggio di assistenza dal modulo di contatto.</p>
        <p><strong>Nome:</strong> ${name}</p>
        <p><strong>Email:</strong> ${email}</p>
        <p><strong>Messaggio:</strong> ${message}</p>
        <p>Grazie,</p>
        <p>Il tuo team di assistenza</p>
      `
    };
  
    transporter.sendMail(mailOptions, (error, info) => {
      if (error) {
        console.error(error);
        res.status(500).send('Si è verificato un errore durante l\'invio dell\'email.');
      } else {
        console.log('Email inviata: ' + info.response);
        res.status(200).send('Grazie per averci contattato. Ti risponderemo il prima possibile.');
      }
    });
  };

  exports.sendSMS = async (number, message) => {
    const apiEndpoint = 'https://rest.clicksend.com/v3/sms/send';
    const username = 'info@comparacorsi.it';
    const apiKey = '60B7E5DB-2473-5C03-64DC-578EE3B8F09E';
  
    const smsCollection = {
      messages: [
        {
          to: number,
          source: 'sdk',
          body: message,
        },
      ],
    };
  
    try {
      const response = await axios.post(apiEndpoint, smsCollection, {
        auth: {
          username: username,
          password: apiKey,
        },
        headers: {
          'Content-Type': 'application/json',
        },
      });
  
      console.log(response.data);
    } catch (error) {
      console.error(error.response.data);
    }
  };  

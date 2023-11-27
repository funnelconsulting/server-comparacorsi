const nodemailer = require('nodemailer');
require('dotenv').config();

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

  exports.sendMailConfirmPayment = (userEmail, leadCount) => {

    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.EMAIL_GMAIL,
        pass: process.env.PASS_GMAIL,
      }
    });
    const message = `Elaboreremo la tua richiesta il prima possibile.`;
    const subject = "Pagamento ricevuto";
  
    const mailOptions = {
      from: process.env.EMAIL_GMAIL,
      to: userEmail,
      subject: subject,
      html: `
        <p>Ciao,</p>
        <p>Abbiamo ricevuto il tuo acquisto per ${leadCount} lead</p>
        <p>${message}</p>
        <p>Grazie,</p>
        <p>Il tuo team di Multiversity</p>
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

  exports.sendMailLeadInsufficienti = (userEmail, leadCount) => {

    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.EMAIL_GMAIL,
        pass: process.env.PASS_GMAIL,
      }
    });
    const message = `Siamo spiacenti, ma non ci sono abbastanza lead disponibili.`;
    const subject = "Lead Insufficienti";
  
    const mailOptions = {
      from: process.env.EMAIL_GMAIL,
      to: userEmail,
      subject: subject,
      html: `
        <p>Ciao,</p>
        <p>Abbiamo ricevuto il tuo acquisto. Sfortunatamente i lead nel database sono inferiori a quelli richiesti.
        Ti preghiamo di attendere qualche giorno per ricevere ${leadCount} lead</p>
        <p><strong>Messaggio:</strong> ${message}</p>
        <p>Grazie,</p>
        <p>Il tuo team di Multiversity</p>
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


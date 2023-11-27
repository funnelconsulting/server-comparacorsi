const User = require('../models/user');
const {hashPassword, comparePassword} = require('../helpers/auth');
const jwt = require('jsonwebtoken');
const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);
const nodemailer = require('nodemailer');
require('dotenv').config()

exports.register = async (req, res) => {
  try {
    // validation
    const { name, email, password, role, pIva, codeSdi, nameECP, isChecked, legaleResponsabile, via, emailLegale, tag } = req.body;
    if (!name) {
      return res.json({
        error: "Name is required",
      });
    }
    if (!password || password.length < 6) {
      return res.json({
        error: "Password is required and should be 6 characters long",
      });
    }
    const exist = await User.findOne({ email });
    if (exist) {
      return res.json({
        error: "Email is taken",
      });
    }
    const hashedPassword = await hashPassword(password);

    const customer = await stripe.customers.create({
      email: emailLegale,
      name: nameECP,
      metadata: {
        pIva,
        codeSdi,
        nameECP,
        via,
        legaleResponsabile,
        emailLegale,
      },
    });

    const codeVerifyEmail = Math.floor(100000 + Math.random() * 900000);
    try {
      const user = await new User({
        name,
        email,
        password: hashedPassword,
        stripe_customer_id: customer.id,
        pIva,
        codeSdi,
        nameECP,
        role,
        isChecked,
        codeVerifyEmail,
        via,
        legaleResponsabile,
        emailLegale,
        tag,
      }).save();
  
      const token = jwt.sign({ _id: user._id }, process.env.JWT_SECRET, {
        expiresIn: "365d",
      });

      const { password, ...rest } = user._doc;
      const transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
          user: process.env.EMAIL_GMAIL,
          pass: process.env.PASS_GMAIL,
        }
      });
  
      const mailOptions = {
        from: process.env.EMAIL_GMAIL,
        to: 'info+leadsystem@funnelconsulting.it',
        subject: 'Nuova iscrizione',
        text: `Si è iscrittto un nuovo utente: Email: ${email}, Nome : ${name}, Nome ECP: ${nameECP}, partita IVA: ${pIva}, Codice SDI: ${codeSdi}.`,
      };

      const mailOptionsVerifyEmail = {
        from: process.env.EMAIL_GMAIL,
        to: email,
        subject: 'Verifica la tua email',
        text: `Puoi verificare la tua email con questo codice: ${codeVerifyEmail}.`,
      };

      transporter.sendMail(mailOptionsVerifyEmail, (error, info) => {
        if (error) {
          console.log(error);
          return res.status(500).json({ error: 'Si è verificato un errore durante l\'invio dell\'email' });
        }
        console.log('Email inviata:', info.response);
        res.status(200).json({ message: 'Email inviata correttamente' });
      })
  
      transporter.sendMail(mailOptions, (error, info) => {
        if (error) {
          console.log(error);
          return res.status(500).json({ error: 'Si è verificato un errore durante l\'invio dell\'email' });
        }
        console.log('Email inviata:', info.response);
        res.status(200).json({ message: 'Email inviata correttamente' });
      })
      return res.json({
        token,
        user: rest,
      });
    } catch (err) {
      console.log(err);
    }
  } catch (err) {
    console.log(err);
  }
};

exports.login = async (req, res) => {
  try {
    // check email
    const user = await User.findOne({ email: req.body.email });
    if (!user) {
      return res.json({
        error: "No user found",
      });
    }
    // check password
    const match = await comparePassword(req.body.password, user.password);
    if (!match) {
      return res.json({
        error: "Wrong password",
      });
    }
    // create signed token
    const token = jwt.sign({ _id: user._id }, process.env.JWT_SECRET, {
      expiresIn: "365d",
    });

    const { password, ...rest } = user._doc;

    res.json({
      token,
      user: rest,
    });
  } catch (err) {
    console.log(err);
  }
};

exports.updateUser = async (req, res) => {
  console.log(req.body)
  try {
    const { nameECP, codeSdi, pIva, via, city, stato, cap, emailNotification } = req.body;

    const user = await User.findByIdAndUpdate(req.body._id, {
      nameECP,
      codeSdi,
      pIva,
      via,
      stato,
      city,
      cap,
      emailNotification,
    }, { new: true });

    const { password, ...rest } = user._doc;
    return res.json({
      user: rest,
    });
  } catch (err) {
    console.log(err);
    res.status(500).send("Internal Server Error");
  }
};

exports.recoveryPassword = async (req, res) => {
  console.log(req.body);
  const pIva = req.body.partitaIvaReset;
  const email = req.body.emailReset;

  try {
    const user = await User.findOne({ email, pIva });

    if (!user) {
      return res.status(404).json({ error: 'Utente non trovato' });
    }

    // Genera un codice casuale di 6 cifre
    const code = Math.floor(100000 + Math.random() * 900000);

    // Salva il codice generato nell'utente nel database
    user.passwordResetCode = code;
    await user.save();

    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.EMAIL_GMAIL,
        pass: process.env.PASS_GMAIL,
      }
    });

    const mailOptions = {
      from: process.env.EMAIL_GMAIL,
      to: /*email, */ 'mattianoris.business@gmail.com',
      subject: 'Codice di recupero password',
      text: `Il tuo codice di recupero password è: ${code}`,
    };

    transporter.sendMail(mailOptions, (error, info) => {
      if (error) {
        console.log(error);
        return res.status(500).json({ error: 'Si è verificato un errore durante l\'invio dell\'email' });
      }
      console.log('Email inviata:', info.response);
      res.status(200).json({ message: 'Email inviata correttamente' });
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: 'Si è verificato un errore durante il recupero della password' });
  }
};

exports.resetPassword = async (req, res) => {
  const email = req.body.emailResetNext;
  const code = req.body.codeResetNext;
  const newPassword = req.body.newPassword

  try {
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ error: 'Utente non trovato' });
    }

    if (user.passwordResetCode !== code) {
      return res.status(400).json({ error: 'Codice di recupero password non valido' });
    }

    const hashedPassword = await hashPassword(newPassword);

    user.password = hashedPassword;
    user.passwordResetCode = null;
    await user.save();

    res.status(200).json({ message: 'Password reimpostata con successo' });
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: 'Si è verificato un errore durante la reimpostazione della password' });
  }
};

exports.verifyEmail = async (req, res) => {
  const email = req.body.email;
  const codeVerifyEmail = req.body.codeVerifyEmail;

  try {
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ error: 'Utente non trovato' });
    }

    if (user.codeVerifyEmail !== codeVerifyEmail) {
      return res.status(400).json({ error: 'Codice di recupero password non valido' });
    }

    user.codeVerifyEmail = 'Verificata';
    await user.save();

    const updatedUser = await User.findById(user._id).lean();

    res.json({
      user: updatedUser,
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: 'Si è verificato un errore durante la reimpostazione della password' });
  }
};
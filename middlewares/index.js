const expressJwt = require('express-jwt');
const User = require('../models/user');
const nodemailer = require('nodemailer');
require('dotenv').config();

exports.requireSignin = expressJwt({
  secret: process.env.JWT_SECRET,
  algorithms: ["HS256"],
});

exports.sendNotification = async (userId) => {
  try {
    const user = await User.findById(userId);

    if (!user || !user.notificationsEnabled || user.notificationSubscriptions.length === 0) {
      console.log('Utente non trovato o notifiche non abilitate');
      return;
    }

    const notificationPayload = JSON.stringify({
      title: "Nuovi lead assegnati",
      body: "Hai nuovi lead assegnati",
      image: "https://cdn2.vectorstock.com/i/thumb-large/94/66/emoji-smile-icon-symbol-smiley-face-vector-26119466.jpg",
    });

    const options = {
      TTL: 3600, 
      vapidDetails: {
        subject: "mailto:info@funnelconsulting.it", 
        publicKey: publicVapidKey,
        privateKey: privateVapidKey,
      },
    };

    for (const subscription of user.notificationSubscriptions) {
      const pushSub = {
        endpoint: subscription.endpoint,
        keys: {
          auth: subscription.keys.auth,
          p256dh: subscription.keys.p256dh,
        },
      };

      await webpush.sendNotification(pushSub, notificationPayload, options);
    }

    console.log('Notifica inviata con successo');
  } catch (error) {
    console.error('Errore nell\'invio della notifica:', error);
  }
};

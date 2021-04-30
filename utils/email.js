const nodemailer = require('nodemailer');

const sendEmail = async options => {
  // 1) Create a transporter
  console.log("0");

  const transporter = nodemailer.createTransport({
    host: process.env.EMAIL_HOST,
    port: process.env.EMAIL_PORT,
    auth: {
      user: process.env.EMAIL_USERNAME,
      pass: process.env.EMAIL_PASSWORD
    }
  });
  console.log("1");

  // 2) Define the email options
  const mailOptions = {
    from: 'Jonas Schmedtmann <medoatef5550@gmail.com>',
    to: options.email,
    subject: options.subject,
    text: options.message
    // html:
  };
  console.log("3");

  // 3) Actually send the email
  await transporter.sendMail(mailOptions);
  console.log("4");
};

module.exports = sendEmail;

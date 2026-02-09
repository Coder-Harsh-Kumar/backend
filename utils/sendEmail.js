const nodemailer = require('nodemailer');

const sendEmail = async (options) => {
    // 1. Create Transporter
    const transporter = nodemailer.createTransport({
        service: 'gmail', // You can use other services or SMTP
        auth: {
            user: process.env.EMAIL_USER,
            pass: process.env.EMAIL_PASS
        }
    });

    // 2. Define Email Options
    const mailOptions = {
        from: 'FaithConnect <noreply@faithconnect.com>',
        to: options.email,
        subject: options.subject,
        html: options.message
    };

    // 3. Send Email
    await transporter.sendMail(mailOptions);
};

module.exports = sendEmail;

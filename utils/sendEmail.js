const nodemailer = require('nodemailer');

const sendEmail = async (options) => {
    // 1. Create Transporter (Using Gmail as example)
    // You MUST add EMAIL_USER and EMAIL_PASS to .env
    const transporter = nodemailer.createTransport({
        service: 'gmail',
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

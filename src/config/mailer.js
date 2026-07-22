import nodemailer from 'nodemailer';

const transporter = nodemailer.createTransport({
  service: 'gmail',
  pool:    true,
  maxConnections: 1,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

export const sendMail = async ({ to, subject, text, html }) => {
  return transporter.sendMail({
    from: `"Open Recruitment LEPKOM" <${process.env.EMAIL_USER}>`,
    to,
    subject,
    text,
    html,
  });
};

export default transporter;

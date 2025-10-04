import nodemailer from "nodemailer";

// For development, we'll use a simple setup that logs emails to the console.
// In a production environment, you would replace this with a real email transport
// like SMTP, SendGrid, Mailgun, etc., and configure it with credentials from .env.
const transporter = nodemailer.createTransport({
  // A simple transport that logs the email to the console
  streamTransport: true,
  newline: 'unix',
  buffer: true,
});

export async function sendPasswordResetEmail(email: string, token: string, host: string) {
  const resetLink = `http://${host}/reset-password?token=${token}`;

  const mailOptions = {
    from: '"InboxFlow Support" <no-reply@inboxflow.com>',
    to: email,
    subject: "Your Password Reset Request",
    text: `You are receiving this because you (or someone else) have requested the reset of the password for your account.\n\n` +
          `Please click on the following link, or paste this into your browser to complete the process:\n\n` +
          `${resetLink}\n\n` +
          `If you did not request this, please ignore this email and your password will remain unchanged.\n`,
    html: `<p>You are receiving this because you (or someone else) have requested the reset of the password for your account.</p>` +
          `<p>Please click on the following link, or paste this into your browser to complete the process:</p>` +
          `<p><a href="${resetLink}">${resetLink}</a></p>` +
          `<p>If you did not request this, please ignore this email and your password will remain unchanged.</p>`
  };

  try {
    const info = await transporter.sendMail(mailOptions);
    console.log("Password reset email sent (logged to console):");
    // The `info.message` contains the full raw email content, including the link.
    console.log(info.message.toString());
    return true;
  } catch (error) {
    console.error("Error sending password reset email:", error);
    return false;
  }
}
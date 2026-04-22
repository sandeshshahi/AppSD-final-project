import nodemailer from "nodemailer";

// NOTE: In a real app, these credentials go in your .env file!
const transporter = nodemailer.createTransport({
  host: "sandbox.smtp.mailtrap.io",
  port: 2525,
  auth: {
    user: process.env.MAILTRAP_USER,
    pass: process.env.MAILTRAP_PASS,
  },
});

export const sendBookingEmail = async (
  to: string,
  patientName: string,
  appointmentDetails: any,
) => {
  const { date, time, dentistName } = appointmentDetails;

  const mailOptions = {
    from: '"ADS Dental Surgery" <noreply@ads-dental.com>',
    to,
    subject: "Appointment Confirmed! 🦷",
    html: `
      <div style="font-family: sans-serif; line-height: 1.5; color: #333;">
        <h2>Hello, ${patientName}!</h2>
        <p>Your dental appointment has been successfully booked.</p>
        <hr />
        <p><strong>Date:</strong> ${date}</p>
        <p><strong>Time:</strong> ${time}</p>
        <p><strong>Dentist:</strong> Dr. ${dentistName}</p>
        <hr />
        <p>If you need to reschedule, please contact us at least 24 hours in advance.</p>
        <p>Best regards,<br/>The ADS Dental Team</p>
      </div>
    `,
  };

  try {
    const info = await transporter.sendMail(mailOptions);
    console.log("Email sent successfully: " + info.messageId);
  } catch (error) {
    console.error("Error sending email:", error);
  }
};

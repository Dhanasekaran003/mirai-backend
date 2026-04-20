import dotenv from "dotenv";
dotenv.config();
import nodemailer from "nodemailer";
import { format, toZonedTime, fromZonedTime } from "date-fns-tz";

import express from "express";
import cors from "cors";
import bodyParser from "body-parser";

const app = express();

app.use(cors());
app.use(express.json());

const createTransporter = () => {
  console.log("Creating transporter:", {
    host: process.env.SMTP_HOST,
    port: process.env.SMTP_PORT,
  });

  return nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT),
    secure: true,
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  });
};

const transporter = createTransporter();

app.post("/api/contact", async (req, res) => {
  try {
    const {
      fullName,
      email,
      company,
      phone,
      industry,
      message,
      orgSize,
      purpose,
    } = req.body;

    const adminMail = {
      from: `"Contact Form" <${process.env.SMTP_USER}>`,
      to: process.env.ADMIN_EMAIL,
      subject: "New Contact Inquiry",
      html: `
<div style="font-family: Arial, sans-serif; background-color: #f4f6f8; padding: 20px;">
  <div style="max-width: 600px; margin: auto; background: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 2px 8px rgba(0,0,0,0.1);">
    
    <div style="background: #1a73e8; color: #ffffff; padding: 16px 24px;">
      <h2 style="margin: 0;">New Contact Inquiry</h2>
    </div>

    <div style="padding: 20px;">
      <p style="font-size: 14px; color: #555;">You have received a new inquiry from your website:</p>

      <table style="width: 100%; border-collapse: collapse; margin-top: 10px;">
        <tr>
          <td style="padding: 8px; font-weight: bold;">Name:</td>
          <td style="padding: 8px;">${fullName}</td>
        </tr>
        <tr style="background: #f9f9f9;">
          <td style="padding: 8px; font-weight: bold;">Email:</td>
          <td style="padding: 8px;">${email}</td>
        </tr>
        <tr>
          <td style="padding: 8px; font-weight: bold;">Company:</td>
          <td style="padding: 8px;">${company || "-"}</td>
        </tr>
        <tr style="background: #f9f9f9;">
          <td style="padding: 8px; font-weight: bold;">Phone:</td>
          <td style="padding: 8px;">${phone || "-"}</td>
        </tr>
        <tr>
          <td style="padding: 8px; font-weight: bold;">Industry:</td>
          <td style="padding: 8px;">${industry || "-"}</td>
        </tr>
        <tr>
          <td style="padding: 8px; font-weight: bold;">Organization Size:</td>
          <td style="padding: 8px;">${orgSize || "-"}</td>
        </tr>
        <tr>
          <td style="padding: 8px; font-weight: bold;">Purpose:</td>
          <td style="padding: 8px;">${purpose || "-"}</td>
        </tr>
      </table>

      <div style="margin-top: 20px;">
        <p style="font-weight: bold;">Message:</p>
        <p style="background: #f4f6f8; padding: 12px; border-radius: 5px; color: #333;">
          ${message}
        </p>
      </div>
    </div>

    <div style="background: #f4f6f8; padding: 12px; text-align: center; font-size: 12px; color: #888;">
      © ${new Date().getFullYear()} MiraiWorld. All rights reserved.
    </div>

  </div>
</div> `,
    };

    const userMail = {
      from: `"MIRAi" <${process.env.SMTP_USER}>`,
      to: email,
      subject: "We received your inquiry",
      html: `
<div style="font-family: Arial, sans-serif; background-color: #f4f6f8; padding: 20px;">
  <div style="max-width: 600px; margin: auto; background: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 2px 8px rgba(0,0,0,0.1);">
    
    <div style="background: #1a73e8; color: #ffffff; padding: 16px 24px;">
      <h2 style="margin: 0;">Thank You for Contacting Us</h2>
    </div>

    <div style="padding: 20px;">
      <p style="font-size: 15px; color: #333;">Hi <strong>${fullName}</strong>,</p>

      <p style="color: #555; line-height: 1.6;">
        Thank you for reaching out to us. We have successfully received your inquiry, and our team will review your message and get back to you shortly.
      </p>

      <p style="margin-top: 20px; color: #555;">
        If your request is urgent, feel free to reply directly to this email.
      </p>

      <p style="margin-top: 20px;">
        Best Regards,<br/>
        <strong>MiraiWorld Team</strong>
      </p>
    </div>

    <div style="background: #f4f6f8; padding: 12px; text-align: center; font-size: 12px; color: #888;">
      This is an automated response. Please do not reply directly unless necessary.
    </div>

  </div>
</div>
`,
    };

    await transporter.sendMail(adminMail);
    await transporter.sendMail(userMail);

    return res.status(200).json({
      success: true,
      message: "Inquiry submitted successfully",
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      success: false,
      message: "Failed to send inquiry",
    });
  }
});

// app.post("/api/schedule-demo", async (req, res) => {
//   try {
//     const { name, email, date, time, timeZone } = req.body;

//     const utcDate = fromZonedTime(time, timeZone);

//     const userTime = format(toZonedTime(utcDate, timeZone), "hh:mm a zzz", {
//       timeZone,
//     });

//     const adminTimeZone = "Asia/Kolkata";
//     const adminTime = format(
//       toZonedTime(utcDate, adminTimeZone),
//       "hh:mm a zzz",
//       { timeZone: adminTimeZone },
//     );

//     const formattedDate = format(
//       toZonedTime(utcDate, timeZone),
//       "EEEE, MMMM d yyyy",
//       { timeZone },
//     );

//     const adminMail = {
//       from: `"Schedule Demo" <${process.env.SMTP_USER}>`,
//       to: process.env.ADMIN_EMAIL,
//       subject: "New Demo Scheduled 🚀",
//       html: `
// <div style="font-family: Arial, sans-serif; background-color: #f4f6f8; padding: 20px;">
//   <div style="max-width: 600px; margin: auto; background: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 2px 8px rgba(0,0,0,0.1);">

//     <div style="background: #1a73e8; color: #ffffff; padding: 16px 24px;">
//       <h2 style="margin: 0;">New Demo Scheduled</h2>
//     </div>

//     <div style="padding: 20px;">
//       <p style="color: #555;">A new demo has been scheduled:</p>

//       <table style="width: 100%; border-collapse: collapse;">
//         <tr>
//           <td style="padding: 8px; font-weight: bold;">Name:</td>
//           <td style="padding: 8px;">${name}</td>
//         </tr>
//         <tr style="background: #f9f9f9;">
//           <td style="padding: 8px; font-weight: bold;">Email:</td>
//           <td style="padding: 8px;">${email}</td>
//         </tr>
//         <tr>
//           <td style="padding: 8px; font-weight: bold;">Date:</td>
//           <td style="padding: 8px;">${formattedDate}</td>
//         </tr>
//         <tr style="background: #f9f9f9;">
//           <td style="padding: 8px; font-weight: bold;">Time:</td>
//           <td style="padding: 8px;">(IST):${adminTime}</td>
//         </tr>
//       </table>
//     </div>

//     <div style="background: #f4f6f8; padding: 12px; text-align: center; font-size: 12px; color: #888;">
//       © ${new Date().getFullYear()} MiraiWorld
//     </div>

//   </div>
// </div>
// `,
//     };

//     const userMail = {
//       from: `"MIRAi" <${process.env.SMTP_USER}>`,
//       to: email,
//       subject: "Your Demo is Confirmed",
//       html: `
// <div style="font-family: Arial, sans-serif; background-color: #f4f6f8; padding: 20px;">
//   <div style="max-width: 600px; margin: auto; background: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 2px 8px rgba(0,0,0,0.1);">

//     <div style="background: #1a73e8; color: #ffffff; padding: 16px 24px;">
//       <h2 style="margin: 0;">Demo Confirmed</h2>
//     </div>

//     <div style="padding: 20px;">
//       <p>Hi <strong>${name}</strong>,</p>

//       <p>Your demo has been successfully scheduled.</p>

//       <table style="width: 100%; border-collapse: collapse; margin-top: 10px;">
//         <tr>
//           <td style="padding: 8px; font-weight: bold;">Date:</td>
//           <td style="padding: 8px;">${formattedDate}</td>
//         </tr>
//         <tr style="background: #f9f9f9;">
//           <td style="padding: 8px; font-weight: bold;">Time:</td>
//           <td style="padding: 8px;">${userTime}</td>
//         </tr>
//         <tr>
//           <td style="padding: 8px; font-weight: bold;">Timezone:</td>
//           <td style="padding: 8px;">${timeZone}</td>
//         </tr>
//       </table>

//       <p style="margin-top: 20px;">
//         Our team will connect with you at the scheduled time.
//       </p>

//       <p style="margin-top: 20px;">
//         Regards,<br/>
//         <strong>MiraiWorld Team</strong>
//       </p>
//     </div>

//     <div style="background: #f4f6f8; padding: 12px; text-align: center; font-size: 12px; color: #888;">
//       This is an automated email confirmation.
//     </div>

//   </div>
// </div>
// `,
//     };

//     await transporter.sendMail(adminMail);
//     await transporter.sendMail(userMail);

//     return res.status(200).json({
//       success: true,
//       message: "Demo scheduled successfully",
//     });
//   } catch (error) {
//     console.error(error);
//     return res.status(500).json({
//       success: false,
//       message: "Failed to schedule demo",
//     });
//   }
// });

// app.post("/api/schedule-demo", async (req, res) => {
//   try {
//     const { name, email, date, time, timeZone } = req.body;

//     if (!date || !time || !timeZone) {
//       throw new Error("Missing required fields");
//     }

//     const utcDate = new Date(time);

//     if (isNaN(utcDate)) {
//       throw new Error("Invalid time value received");
//     }

//     const userTime = format(toZonedTime(utcDate, timeZone), "hh:mm a zzz", {
//       timeZone,
//     });

//     const adminTimeZone = "Asia/Kolkata";

//     const adminTime = format(
//       toZonedTime(utcDate, adminTimeZone),
//       "hh:mm a zzz",
//       { timeZone: adminTimeZone },
//     );

//     const startISO = utcDate.toISOString();
//     const endISO = new Date(utcDate.getTime() + 30 * 60000).toISOString();

//     const teamsLink = `https://teams.microsoft.com/l/meeting/new?subject=Demo%20Meeting&startTime=${startISO}&endTime=${endISO}`;

//     // ================= ADMIN MAIL (KEEP YOUR TEMPLATE) =================
//     const adminMail = {
//       from: `"Schedule Demo" <${process.env.SMTP_USER}>`,
//       to: process.env.ADMIN_EMAIL,
//       subject: "New Demo Scheduled ",
//       html: `
// <div style="font-family: Arial, sans-serif; background-color: #f4f6f8; padding: 20px;">
//   <div style="max-width: 600px; margin: auto; background: #ffffff; border-radius: 8px; overflow: hidden;">

//     <div style="background: #1a73e8; color: #ffffff; padding: 16px;">
//       <h2>New Demo Scheduled</h2>
//     </div>

//     <div style="padding: 20px;">
//       <table style="width: 100%;">
//         <tr>
//           <td><b>Name:</b></td>
//           <td>${name}</td>
//         </tr>
//         <tr>
//           <td><b>Email:</b></td>
//           <td>${email}</td>
//         </tr>
//         <tr>
//           <td><b>Date:</b></td>
//           <td>${formattedDate}</td>
//         </tr>
//         <tr>
//           <td><b>Time (IST):</b></td>
//           <td>${adminTime}</td>
//         </tr>
//         <tr>
//           <td><b>Meeting:</b></td>
//           <td><a href="${teamsLink}">Join Teams Meeting</a></td>
//         </tr>
//       </table>
//     </div>
//   </div>
// </div>
// `,
//     };

//     // ================= USER MAIL (KEEP YOUR TEMPLATE) =================
//     const userMail = {
//       from: `"MIRAi" <${process.env.SMTP_USER}>`,
//       to: email,
//       subject: "Your Demo is Confirmed",
//       html: `
// <div style="font-family: Arial, sans-serif; background-color: #f4f6f8; padding: 20px;">
//   <div style="max-width: 600px; margin: auto; background: #ffffff; border-radius: 8px;">

//     <div style="background: #1a73e8; color: #ffffff; padding: 16px;">
//       <h2>Demo Confirmed</h2>
//     </div>

//     <div style="padding: 20px;">
//       <p>Hi <b>${name}</b>,</p>

//       <table style="width: 100%;">
//         <tr>
//           <td><b>Date:</b></td>
//           <td>${formattedDate}</td>
//         </tr>
//         <tr>
//           <td><b>Time:</b></td>
//           <td>${userTime}</td>
//         </tr>
//         <tr>
//           <td><b>Timezone:</b></td>
//           <td>${timeZone}</td>
//         </tr>
//         <tr>
//           <td><b>Meeting:</b></td>
//           <td><a href="${teamsLink}">Join Teams Meeting</a></td>
//         </tr>
//       </table>

//       <p style="margin-top: 20px;">Our team will connect with you.</p>
//     </div>
//   </div>
// </div>
// `,
//     };

//     await transporter.sendMail(adminMail);
//     await transporter.sendMail(userMail);

//     res.json({ success: true });
//   } catch (error) {
//     console.error(error);
//     res.status(500).json({ success: false });
//   }
// });

const generateICS = (startISO, endISO, title, description, meetingUrl) => {
  const formatDate = (date) =>
    new Date(date).toISOString().replace(/[-:]/g, "").split(".")[0] + "Z";

  return `BEGIN:VCALENDAR
VERSION:2.0
CALSCALE:GREGORIAN
METHOD:REQUEST
BEGIN:VEVENT
UID:${Date.now()}@mirai.com
DTSTAMP:${formatDate(new Date())}
DTSTART:${formatDate(startISO)}
DTEND:${formatDate(endISO)}
SUMMARY:${title}
DESCRIPTION:${description}\\nJoin Meeting: ${meetingUrl}
URL:${meetingUrl}
LOCATION:Online
END:VEVENT
END:VCALENDAR`;
};

app.post("/api/schedule-demo", async (req, res) => {
  try {
    const { name, email, date, time, timeZone, purpose } = req.body;

    if (!name || !email || !date || !time || !timeZone) {
      throw new Error("Missing required fields");
    }

    const utcDate = new Date(time);

    if (isNaN(utcDate)) {
      throw new Error("Invalid time value");
    }

    if (utcDate <= new Date()) {
      return res.status(400).json({
        success: false,
        message: "Cannot book past time",
      });
    }

    const endDate = new Date(utcDate.getTime() + 30 * 60000);

    const formattedDate = format(
      toZonedTime(utcDate, timeZone),
      "dd MMM yyyy",
      { timeZone },
    );

    const userTime = format(toZonedTime(utcDate, timeZone), "hh:mm a zzz", {
      timeZone,
    });

    // 🧑‍💼 Admin view (IST with correct date shift)
    const adminTimeZone = "Asia/Kolkata";

    const adminDate = format(
      toZonedTime(utcDate, adminTimeZone),
      "dd MMM yyyy",
      { timeZone: adminTimeZone },
    );

    const adminTime = format(
      toZonedTime(utcDate, adminTimeZone),
      "hh:mm a zzz",
      { timeZone: adminTimeZone },
    );

    const meetingLink = process.env.MEETING_LINK;

    const startISO = utcDate.toISOString();
    const endISO = endDate.toISOString();

    const icsContent = generateICS(
      startISO,
      endISO,
      "Demo Meeting",
      `Demo scheduled with ${name}`,
      meetingLink,
    );

    const adminMail = {
      from: `"Schedule Demo" <${process.env.SMTP_USER}>`,
      to: process.env.ADMIN_EMAIL,
      subject: "New Demo Scheduled",
      html: `
<div style="font-family: Arial, sans-serif; background-color: #f4f6f8; padding: 20px;">
  <div style="max-width: 600px; margin: auto; background: #ffffff; border-radius: 8px;">
    
    <div style="background: #1a73e8; color: #ffffff; padding: 16px;">
      <h2>New Demo Scheduled</h2>
    </div>

    <div style="padding: 20px;">
      <table style="width: 100%;">
        <tr><td><b>Name:</b></td><td>${name}</td></tr>
        <tr><td><b>Email:</b></td><td>${email}</td></tr>
        <tr><td><b>Email:</b></td><td>${purpose}</td></tr>
        <tr><td><b>Date:</b></td><td>${adminDate}</td></tr>
        <tr><td><b>Time (IST):</b></td><td>${adminTime}</td></tr>
        <tr>
          <td><b>Meeting:</b></td>
          <td><a href="${meetingLink}" target="_blank">Join Google Meet</a></td>
        </tr>
      </table>
    </div>
  </div>
</div>
`,
      attachments: [
        {
          filename: "demo-meeting.ics",
          content: icsContent,
        },
      ],
    };

    // ================= USER MAIL =================
    const userMail = {
      from: `"MIRAi" <${process.env.SMTP_USER}>`,
      to: email,
      subject: "Your Demo is Confirmed",
      html: `
<div style="font-family: Arial, sans-serif; background-color: #f4f6f8; padding: 20px;">
  <div style="max-width: 600px; margin: auto; background: #ffffff; border-radius: 8px;">
    
    <div style="background: #1a73e8; color: #ffffff; padding: 16px;">
      <h2>Demo Confirmed</h2>
    </div>

    <div style="padding: 20px;">
      <p>Hi <b>${name}</b>,</p>

      <table style="width: 100%;">
        <tr><td><b>Date:</b></td><td>${formattedDate}</td></tr>
        <tr><td><b>Time:</b></td><td>${userTime}</td></tr>
        <tr>
          <td><b>Meeting:</b></td>
          <td><a href="${meetingLink}" target="_blank">Join Google Meet</a></td>
        </tr>
      </table>

      <p style="margin-top: 20px;">
        Please open the attached calendar invite and click "Add to Calendar".
      </p>
    </div>
  </div>
</div>
`,
      attachments: [
        {
          filename: "demo-meeting.ics",
          content: icsContent,
        },
      ],
    };

    await transporter.sendMail(adminMail);
    await transporter.sendMail(userMail);

    res.json({ success: true });
  } catch (error) {
    console.error("Schedule Demo Error:", error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
});

app.listen(process.env.PORT, () => {
  console.log(`Server is running on port ${process.env.PORT}`);
});

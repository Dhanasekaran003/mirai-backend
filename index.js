import dotenv from 'dotenv';
dotenv.config(); // ✅ MUST BE FIRST

import express from 'express';
import cors from 'cors';
import bodyParser from 'body-parser';
import { createTransporter } from './emailConfig.js';

const transporter = createTransporter();

const app = express();

app.use(cors());
app.use(express.json());

app.post('/api/contact', async (req, res) => {
  try {
    const {
      fullName,
      email,
      company,
      phone,
      industry,
      message,
      captchaToken
    } = req.body;

    if (!captchaToken) {
      return res.status(400).json({
        success: false,
        message: "Captcha is required"
      });
    }

    const isValidCaptcha = await verifyCaptcha(captchaToken);

    if (!isValidCaptcha) {
      return res.status(400).json({
        success: false,
        message: "Captcha verification failed"
      });
    }

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
          <td style="padding: 8px;">${company || '-'}</td>
        </tr>
        <tr style="background: #f9f9f9;">
          <td style="padding: 8px; font-weight: bold;">Phone:</td>
          <td style="padding: 8px;">${phone || '-'}</td>
        </tr>
        <tr>
          <td style="padding: 8px; font-weight: bold;">Industry:</td>
          <td style="padding: 8px;">${industry || '-'}</td>
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
</div> `
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
`
    };

    await transporter.sendMail(adminMail);
    await transporter.sendMail(userMail);

    return res.status(200).json({
      success: true,
      message: "Inquiry submitted successfully"
    });

  } catch (error) {
    console.error(error);
    return res.status(500).json({
      success: false,
      message: "Failed to send inquiry"
    });
  }
});

app.listen(process.env.PORT, () => {
  console.log(`Server is running on port ${process.env.PORT}`);

});
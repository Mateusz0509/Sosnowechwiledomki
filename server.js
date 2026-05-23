const express = require("express");
const cors = require("cors");
const nodemailer = require("nodemailer");
require("dotenv").config();
const app = express();
app.use(cors({ origin: true }));
app.use(express.json());
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: Number(process.env.SMTP_PORT || 587),
  secure: String(process.env.SMTP_SECURE || "false") === "true",
  auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS }
});
app.get("/health", (_, res) => res.json({ ok: true }));
app.post("/contact", async (req, res) => {
  const { imie, email, telefon, wiadomosc } = req.body || {};
  if (!imie || !email || !wiadomosc) return res.status(400).json({ success: false, message: "Uzupełnij wymagane pola." });
  try {
    await transporter.sendMail({
      from: process.env.MAIL_FROM,
      to: process.env.MAIL_TO,
      replyTo: email,
      subject: `Nowa wiadomość od ${imie}`,
      text: `Imię: ${imie}
E-mail: ${email}
Telefon: ${telefon || '-'}

Wiadomość:
${wiadomosc}`
    });
    res.json({ success: true, message: "Wiadomość została wysłana." });
  } catch (err) {
    res.status(500).json({ success: false, message: "Błąd wysyłki wiadomości." });
  }
});
const port = process.env.PORT || 3000;
app.listen(port, () => console.log(`Listening on ${port}`));

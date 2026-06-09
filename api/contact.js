// Vercel Serverless Function: nimmt das Kontaktformular entgegen und
// verschickt die Nachricht per Resend an bienenmonaz@gmail.com.
// Der API-Key liegt ausschliesslich in der Umgebungsvariable RESEND_API_KEY
// (Vercel -> Settings -> Environment Variables) und niemals im Code/Git.

const RECIPIENT = "bienenmonaz@gmail.com";
const SENDER = "Bienenmonaz <onboarding@resend.dev>";

const escapeHtml = (value) =>
  String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");

module.exports = async (req, res) => {
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    return res.status(405).json({ ok: false, error: "Method not allowed" });
  }

  if (!process.env.RESEND_API_KEY) {
    return res
      .status(500)
      .json({ ok: false, error: "Server nicht konfiguriert (RESEND_API_KEY fehlt)." });
  }

  // Vercel parst JSON-Bodies automatisch; Fallback falls String geliefert wird.
  let body = req.body;
  if (typeof body === "string") {
    try {
      body = JSON.parse(body);
    } catch {
      body = {};
    }
  }
  body = body || {};

  const name = String(body.name || "").trim();
  const email = String(body.email || "").trim();
  const phone = String(body.phone || "").trim();
  const subject = String(body.subject || "").trim();
  const message = String(body.message || "").trim();
  const honey = String(body._honey || "").trim(); // Honeypot

  // Bot? Honeypot war ausgefuellt -> still "ok" zurueckgeben, nichts senden.
  if (honey) {
    return res.status(200).json({ ok: true });
  }

  if (!name || !email || !subject || !message) {
    return res
      .status(400)
      .json({ ok: false, error: "Bitte alle Pflichtfelder ausfüllen." });
  }
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return res
      .status(400)
      .json({ ok: false, error: "Bitte eine gültige E-Mail-Adresse angeben." });
  }

  const lines = [
    ["Name", name],
    ["E-Mail", email],
    ["Telefon", phone || "-"],
    ["Betreff", subject],
  ];

  const html = `
    <div style="font-family:Arial,Helvetica,sans-serif;color:#1c1813;line-height:1.6">
      <h2 style="margin:0 0 16px">Neue Nachricht über bienenmonaz.de</h2>
      <table style="border-collapse:collapse">
        ${lines
          .map(
            ([k, v]) =>
              `<tr><td style="padding:4px 12px 4px 0;color:#6b645a"><strong>${k}:</strong></td><td style="padding:4px 0">${escapeHtml(
                v
              )}</td></tr>`
          )
          .join("")}
      </table>
      <p style="margin:16px 0 4px;color:#6b645a"><strong>Nachricht:</strong></p>
      <p style="white-space:pre-wrap;margin:0">${escapeHtml(message)}</p>
    </div>`;

  const text =
    lines.map(([k, v]) => `${k}: ${v}`).join("\n") + `\n\nNachricht:\n${message}`;

  try {
    const response = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${process.env.RESEND_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: SENDER,
        to: [RECIPIENT],
        reply_to: email,
        subject: `[Website] ${subject}`,
        html,
        text,
      }),
    });

    if (!response.ok) {
      const detail = await response.text();
      console.error("Resend error:", response.status, detail);
      return res
        .status(502)
        .json({ ok: false, error: "E-Mail konnte nicht gesendet werden." });
    }

    return res.status(200).json({ ok: true });
  } catch (err) {
    console.error("Contact handler error:", err);
    return res
      .status(500)
      .json({ ok: false, error: "Unerwarteter Serverfehler." });
  }
};

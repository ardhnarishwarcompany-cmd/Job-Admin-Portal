import nodemailer from "nodemailer";

// Lazily build the transporter so the app can still boot if GMAIL_USER/GMAIL_PASS
// aren't set yet (email features just fall back to mock mode in that case).
let transporter = null;
export const isEmailConfigured = () => Boolean(process.env.GMAIL_USER && process.env.GMAIL_PASS);

const getTransporter = () => {
  if (!isEmailConfigured()) return null;
  if (!transporter) {
    transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST || "smtp.gmail.com",
      port: Number(process.env.SMTP_PORT || 587),
      secure: Number(process.env.SMTP_PORT || 587) === 465,
      auth: {
        user: process.env.GMAIL_USER,
        pass: process.env.GMAIL_PASS,
      },
      tls: {
        rejectUnauthorized: String(process.env.SMTP_TLS_REJECT_UNAUTHORIZED || "true").toLowerCase() !== "false",
      },
    });
  }
  return transporter;
};

const brandFooter = `
  <p style="margin-top:24px;color:#94a3b8;font-size:12px;">
    ArdhnariShwar Job Portal · This is an automated message, please do not reply.
  </p>`;

export const sendOtpEmail = async (toEmail, otp) => {
  const t = getTransporter();
  if (!t) return { sent: false, mocked: true };

  await t.sendMail({
    from: `"${process.env.FROM_NAME || "ArdhnariShwar Job Portal"}" <${process.env.GMAIL_USER}>`,
    to: toEmail,
    subject: "Your verification code",
    html: `
      <div style="font-family:'Plus Jakarta Sans',Arial,sans-serif;max-width:420px;margin:0 auto;padding:24px;border-radius:16px;border:1px solid #e2e8f0;">
        <h2 style="color:#1d4ed8;margin:0 0 8px;">Verify your email</h2>
        <p style="color:#334155;font-size:14px;">Use the code below to verify your email address. It expires in 10 minutes.</p>
        <div style="font-size:32px;font-weight:800;letter-spacing:8px;color:#0f172a;background:#eff6ff;border-radius:12px;padding:16px;text-align:center;margin:16px 0;">
          ${otp}
        </div>
        <p style="color:#94a3b8;font-size:12px;">If you didn't request this, you can safely ignore this email.</p>
        ${brandFooter}
      </div>
    `,
  });
  return { sent: true, mocked: false };
};

export const sendWelcomeEmail = async (toEmail, name, role) => {
  const t = getTransporter();
  if (!t) return { sent: false, mocked: true };

  await t.sendMail({
    from: `"${process.env.FROM_NAME || "ArdhnariShwar Job Portal"}" <${process.env.GMAIL_USER}>`,
    to: toEmail,
    subject: "Welcome to ArdhnariShwar Job Portal",
    html: `
      <div style="font-family:'Plus Jakarta Sans',Arial,sans-serif;max-width:480px;margin:0 auto;padding:24px;border-radius:16px;border:1px solid #e2e8f0;">
        <h2 style="color:#1d4ed8;margin:0 0 8px;">Welcome, ${name || "there"} 👋</h2>
        <p style="color:#334155;font-size:14px;">
          Your ${role === "Recruiter" ? "employer" : "candidate"} account has been created successfully.
          ${role === "Recruiter" ? "Your company profile is pending verification — we'll notify you once it's approved." : "You can now build your profile and start applying to jobs."}
        </p>
        ${brandFooter}
      </div>
    `,
  });
  return { sent: true, mocked: false };
};

export const sendPasswordResetEmail = async (toEmail, resetLink) => {
  const t = getTransporter();
  if (!t) {
    throw new Error("SMTP is not configured. Cannot send password reset email.");
  }

  await t.sendMail({
    from: `"${process.env.FROM_NAME || "ArdhnariShwar Job Portal"}" <${process.env.GMAIL_USER}>`,
    to: toEmail,
    subject: "Reset your password",
    html: `
      <div style="font-family:'Plus Jakarta Sans',Arial,sans-serif;max-width:480px;margin:0 auto;padding:24px;border-radius:16px;border:1px solid #e2e8f0;">
        <h2 style="color:#1d4ed8;margin:0 0 8px;">Reset your password 🔑</h2>
        <p style="color:#334155;font-size:14px;">
          You requested to reset your password. Click the button below to choose a new password. This link is valid for 1 hour.
        </p>
        <div style="text-align:center;margin:24px 0;">
          <a href="${resetLink}" style="background-color:#1d4ed8;color:#ffffff;padding:12px 24px;border-radius:8px;text-decoration:none;font-weight:bold;font-size:14px;display:inline-block;">Reset Password</a>
        </div>
        <p style="color:#64748b;font-size:12px;">
          If the button doesn't work, copy and paste this URL into your browser: <br/>
          <a href="${resetLink}" style="color:#1d4ed8;">${resetLink}</a>
        </p>
        <p style="color:#94a3b8;font-size:12px;margin-top:16px;">If you didn't request a password reset, you can safely ignore this email.</p>
        ${brandFooter}
      </div>
    `,
  });
  return { sent: true, mocked: false };
};

export const sendInterviewDecisionEmail = async (toEmail, name, jobTitle, decision, score = null) => {
  const t = getTransporter();
  if (!t) return { sent: false, mocked: true };

  const hired = String(decision || "").toUpperCase() === "HIRE";
  const subject = hired
    ? `🎉 Congratulations ${name || ""} — You are hired for ${jobTitle || "the position"}`
    : `Interview result — ${jobTitle || "the position"}`;

  await t.sendMail({
    from: `"${process.env.FROM_NAME || "ArdhnariShwar Job Portal"}" <${process.env.GMAIL_USER}>`,
    to: toEmail,
    subject,
    html: hired ? `
      <div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;padding:28px;border-radius:18px;border:1px solid #bbf7d0;background:#ffffff;">
        <h2 style="color:#047857;margin:0 0 12px;">🎉 Congratulations, ${name || "Candidate"}!</h2>
        <p style="color:#334155;font-size:15px;line-height:1.7;">We are delighted to inform you that you have been <strong>selected for ${jobTitle || "the position"}</strong>.</p>
        <p style="color:#334155;font-size:15px;line-height:1.7;">Your NOVA AI interview has been reviewed and the final hiring decision is <strong>HIRE</strong>.</p>
        <p style="color:#334155;font-size:14px;line-height:1.7;">Please check your ArdhnariShwar notifications for the next steps from the hiring team.</p>
        <p style="font-size:18px;font-weight:800;color:#047857;">Welcome aboard! 🚀</p>
        ${brandFooter}
      </div>
    ` : `
      <div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;padding:28px;border-radius:18px;border:1px solid #fecdd3;background:#ffffff;">
        <h2 style="color:#334155;margin:0 0 12px;">Interview result</h2>
        <p style="color:#334155;font-size:15px;line-height:1.7;">Thank you ${name || "Candidate"} for completing your NOVA AI interview for <strong>${jobTitle || "the position"}</strong>.</p>
        <p style="color:#334155;font-size:15px;line-height:1.7;">After careful review, we regret to inform you that you were <strong>not selected</strong> for this position.</p>
        <p style="color:#64748b;font-size:14px;line-height:1.7;">We appreciate your time and wish you success in your future opportunities.</p>
        ${brandFooter}
      </div>
    `,
  });
  return { sent: true, mocked: false };
};


export const sendPaymentConfirmationEmail = async (toEmail, name, planName, billingCycle, amountInr) => {
  const t = getTransporter();
  if (!t) return { sent: false, mocked: true };
  await t.sendMail({
    from: `"${process.env.FROM_NAME || "ArdhnariShwar Job Portal"}" <${process.env.GMAIL_USER}>`,
    to: toEmail,
    subject: `Payment successful — ${planName} plan`,
    html: `
      <div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;padding:28px;border:1px solid #dbeafe;border-radius:18px;background:#fff;">
        <h2 style="color:#047857;margin:0 0 12px;">Payment successful 🎉</h2>
        <p style="color:#334155;font-size:15px;line-height:1.7;">Hi ${name || "there"}, your <strong>${planName}</strong> plan has been activated for the ${billingCycle} billing cycle.</p>
        <p style="color:#334155;font-size:14px;"><strong>Amount:</strong> ₹${Number(amountInr || 0).toFixed(2)}</p>
        <p style="color:#64748b;font-size:14px;">Thank you for choosing ArdhnariShwar Job Portal.</p>
        ${brandFooter}
      </div>`
  });
  return { sent:true, mocked:false };
};

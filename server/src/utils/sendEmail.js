const nodemailer = require('nodemailer');

const createTransporter = () => {
  const {
    EMAIL_HOST,
    EMAIL_PORT,
    EMAIL_USER,
    EMAIL_PASSWORD,
  } = process.env;

  if (
    !EMAIL_HOST ||
    !EMAIL_PORT ||
    !EMAIL_USER ||
    !EMAIL_PASSWORD
  ) {
    throw new Error(
      'Email configuration is missing'
    );
  }

  const port = Number(EMAIL_PORT);

  if (Number.isNaN(port)) {
    throw new Error(
      'EMAIL_PORT must be a valid number'
    );
  }

  return nodemailer.createTransport({
    host: EMAIL_HOST,
    port,
    secure: port === 465,
    auth: {
      user: EMAIL_USER,
      pass: EMAIL_PASSWORD,
    },
  });
};

const sendLoginEmail = async ({
  name,
  email,
  loginAt,
  ipAddress,
  browser,
  operatingSystem,
  device,
}) => {
  if (!email) {
    throw new Error(
      'Recipient email is required'
    );
  }

  const transporter = createTransporter();

  const formattedDate = new Date(
    loginAt || Date.now()
  ).toLocaleString('en-US', {
    dateStyle: 'full',
    timeStyle: 'short',
  });

  const safeName = name || 'Traveler';
  const safeDevice = device || 'Unknown';
  const safeBrowser = browser || 'Unknown';
  const safeOperatingSystem =
    operatingSystem || 'Unknown';
  const safeIpAddress =
    ipAddress || 'Unavailable';

  const mailOptions = {
    from: `"Wanderlust" <${process.env.EMAIL_USER}>`,
    to: email,
    subject:
      'New Login to Your Wanderlust Account',

    text: `Hello ${safeName},

A successful login was detected on your Wanderlust account.

Login Details:
Date & Time: ${formattedDate}
Device: ${safeDevice}
Browser: ${safeBrowser}
Operating System: ${safeOperatingSystem}
IP Address: ${safeIpAddress}

If this was you, no action is required.

If you do not recognize this login, please secure your account immediately.

Wanderlust Team`,

    html: `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="UTF-8" />
          <meta
            name="viewport"
            content="width=device-width, initial-scale=1.0"
          />
          <title>New Login Detected</title>
        </head>

        <body
          style="
            margin:0;
            padding:0;
            background:#f4f4f5;
            font-family:Arial,Helvetica,sans-serif;
          "
        >
          <div
            style="
              max-width:620px;
              margin:40px auto;
              padding:0 16px;
            "
          >
            <div
              style="
                background:#111827;
                border-radius:24px 24px 0 0;
                padding:32px;
                text-align:center;
              "
            >
              <div
                style="
                  display:inline-block;
                  background:#ffffff18;
                  border:1px solid #ffffff25;
                  border-radius:16px;
                  padding:12px 18px;
                "
              >
                <span
                  style="
                    color:#ffffff;
                    font-size:22px;
                    font-weight:800;
                  "
                >
                  Wanderlust
                </span>
              </div>

              <h1
                style="
                  color:#ffffff;
                  font-size:28px;
                  margin:24px 0 8px;
                "
              >
                New Login Detected
              </h1>

              <p
                style="
                  color:#d1d5db;
                  font-size:15px;
                  margin:0;
                "
              >
                Your Wanderlust account was
                successfully accessed.
              </p>
            </div>

            <div
              style="
                background:#ffffff;
                padding:36px 32px;
                border-radius:0 0 24px 24px;
              "
            >
              <p
                style="
                  font-size:16px;
                  color:#111827;
                  margin-top:0;
                "
              >
                Hello
                <strong>${safeName}</strong>,
              </p>

              <p
                style="
                  font-size:15px;
                  line-height:1.7;
                  color:#4b5563;
                "
              >
                We detected a successful login
                to your Wanderlust account.
                Here are the details of this
                activity:
              </p>

              <div
                style="
                  background:#f9fafb;
                  border:1px solid #e5e7eb;
                  border-radius:18px;
                  padding:20px;
                  margin:24px 0;
                "
              >
                <div
                  style="
                    padding:10px 0;
                    border-bottom:1px solid #e5e7eb;
                  "
                >
                  <span
                    style="
                      color:#6b7280;
                      font-size:13px;
                    "
                  >
                    Date & Time
                  </span>

                  <div
                    style="
                      color:#111827;
                      font-weight:600;
                      margin-top:4px;
                    "
                  >
                    ${formattedDate}
                  </div>
                </div>

                <div
                  style="
                    padding:10px 0;
                    border-bottom:1px solid #e5e7eb;
                  "
                >
                  <span
                    style="
                      color:#6b7280;
                      font-size:13px;
                    "
                  >
                    Device
                  </span>

                  <div
                    style="
                      color:#111827;
                      font-weight:600;
                      margin-top:4px;
                    "
                  >
                    ${safeDevice}
                  </div>
                </div>

                <div
                  style="
                    padding:10px 0;
                    border-bottom:1px solid #e5e7eb;
                  "
                >
                  <span
                    style="
                      color:#6b7280;
                      font-size:13px;
                    "
                  >
                    Browser
                  </span>

                  <div
                    style="
                      color:#111827;
                      font-weight:600;
                      margin-top:4px;
                    "
                  >
                    ${safeBrowser}
                  </div>
                </div>

                <div
                  style="
                    padding:10px 0;
                    border-bottom:1px solid #e5e7eb;
                  "
                >
                  <span
                    style="
                      color:#6b7280;
                      font-size:13px;
                    "
                  >
                    Operating System
                  </span>

                  <div
                    style="
                      color:#111827;
                      font-weight:600;
                      margin-top:4px;
                    "
                  >
                    ${safeOperatingSystem}
                  </div>
                </div>

                <div
                  style="
                    padding:10px 0;
                  "
                >
                  <span
                    style="
                      color:#6b7280;
                      font-size:13px;
                    "
                  >
                    IP Address
                  </span>

                  <div
                    style="
                      color:#111827;
                      font-weight:600;
                      margin-top:4px;
                    "
                  >
                    ${safeIpAddress}
                  </div>
                </div>
              </div>

              <div
                style="
                  background:#fff7ed;
                  border:1px solid #fed7aa;
                  border-radius:16px;
                  padding:16px;
                  margin-top:24px;
                "
              >
                <p
                  style="
                    color:#9a3412;
                    font-size:14px;
                    line-height:1.6;
                    margin:0;
                  "
                >
                  If you don't recognize this
                  login, please change your
                  password and review your
                  account activity.
                </p>
              </div>

              <p
                style="
                  font-size:14px;
                  line-height:1.6;
                  color:#6b7280;
                  margin:28px 0 0;
                "
              >
                Stay safe and keep exploring.
              </p>

              <p
                style="
                  font-size:14px;
                  font-weight:700;
                  color:#111827;
                  margin-bottom:0;
                "
              >
                Wanderlust Team
              </p>
            </div>

            <p
              style="
                text-align:center;
                color:#9ca3af;
                font-size:12px;
                margin:20px 0;
              "
            >
              This is an automated security
              notification from Wanderlust.
            </p>
          </div>
        </body>
      </html>
    `,
  };

  return transporter.sendMail(mailOptions);
};

module.exports = {
  createTransporter,
  sendLoginEmail,
};
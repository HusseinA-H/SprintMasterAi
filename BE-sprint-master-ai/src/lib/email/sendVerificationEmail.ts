import { Resend } from 'resend'

type SendVerificationEmailArgs = {
  to: string
  name?: string | null
  verifyUrl: string
}

type VerificationEmailContentArgs = {
  name?: string | null
  verifyUrl: string
}

const getResend = () => {
  const apiKey = process.env.RESEND_API_KEY?.trim()

  if (!apiKey) {
    throw new Error('RESEND_API_KEY is not configured.')
  }

  return new Resend(apiKey)
}

export const getVerificationEmailSubject = () =>
  'Verify your email and activate SprintMaster'

export const getVerificationEmailText = ({
  name,
  verifyUrl,
}: VerificationEmailContentArgs) => `
Welcome to SprintMaster${name ? `, ${name}` : ''}!

Plan one day of focused work in seconds.

Your account is almost ready. Verify your email address using the link below:
${verifyUrl}

This verification link expires in 24 hours.

If you did not create this account, you can safely ignore this email.

— SprintMaster AI
`.trim()

export const getVerificationEmailHtml = ({
  name,
  verifyUrl,
}: VerificationEmailContentArgs) => {
  const safeName = name?.trim() || 'there'
  const currentYear = new Date().getFullYear()

  return `
<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Verify your email and activate SprintMaster</title>
  </head>
  <body style="margin:0;padding:0;background-color:#020817;">
    <div style="display:none;max-height:0;overflow:hidden;opacity:0;color:transparent;">
      Verify your email and activate SprintMaster in seconds.
    </div>

    <table
      role="presentation"
      cellpadding="0"
      cellspacing="0"
      border="0"
      width="100%"
      style="width:100%;border-collapse:collapse;background-color:#020817;margin:0;padding:0;"
    >
      <tr>
        <td align="center" style="padding:32px 14px;">
          <table
            role="presentation"
            cellpadding="0"
            cellspacing="0"
            border="0"
            width="100%"
            style="max-width:680px;border-collapse:collapse;"
          >
            <tr>
              <td
                style="
                  background:
                    radial-gradient(circle at 20% 0%, rgba(59,130,246,0.18) 0%, rgba(2,8,23,0) 34%),
                    radial-gradient(circle at 80% 10%, rgba(14,165,233,0.12) 0%, rgba(2,8,23,0) 22%),
                    linear-gradient(180deg, #071224 0%, #020817 100%);
                  background-color:#071224;
                  border:1px solid #13233d;
                  border-radius:30px;
                  overflow:hidden;
                  box-shadow:0 24px 60px rgba(0,0,0,0.45);
                "
              >
                <table
                  role="presentation"
                  cellpadding="0"
                  cellspacing="0"
                  border="0"
                  width="100%"
                  style="border-collapse:collapse;"
                >
                  <tr>
                    <td align="center" style="padding:18px 24px 0 24px;">
                      <div
                        style="
                          height:1px;
                          background:linear-gradient(90deg, rgba(125,211,252,0) 0%, rgba(125,211,252,0.18) 50%, rgba(125,211,252,0) 100%);
                        "
                      ></div>
                    </td>
                  </tr>

                  <tr>
                    <td align="center" style="padding:26px 32px 10px 32px;">
                      <table
                        role="presentation"
                        cellpadding="0"
                        cellspacing="0"
                        border="0"
                        style="border-collapse:separate;"
                      >
                        <tr>
                          <td
                            style="
                              background-color:#0a1830;
                              border:1px solid #173456;
                              border-radius:999px;
                              padding:10px 16px;
                              font-family:Arial,sans-serif;
                              font-size:13px;
                              line-height:13px;
                              color:#7dd3fc;
                            "
                          >
                            ✦ AI-Powered Sprint Planning
                          </td>
                        </tr>
                      </table>
                    </td>
                  </tr>

                  <tr>
                    <td align="center" style="padding:2px 32px 0 32px;">
                      <div
                        style="
                          font-family:Arial,sans-serif;
                          font-size:22px;
                          line-height:30px;
                          font-weight:800;
                          color:#ffffff;
                          letter-spacing:-0.4px;
                        "
                      >
                        SprintMaster AI
                      </div>
                    </td>
                  </tr>

                  <tr>
                    <td align="center" style="padding:10px 32px 0 32px;">
                      <div
                        style="
                          font-family:Arial,sans-serif;
                          font-size:54px;
                          line-height:62px;
                          font-weight:800;
                          color:#f8fafc;
                          letter-spacing:-1.8px;
                          text-align:center;
                        "
                      >
                        Activate Your Account
                        <span style="color:#38bdf8;">In Seconds</span>
                      </div>
                    </td>
                  </tr>

                  <tr>
                    <td align="center" style="padding:18px 32px 0 32px;">
                      <div
                        style="
                          max-width:540px;
                          margin:0 auto;
                          font-family:Arial,sans-serif;
                          font-size:18px;
                          line-height:31px;
                          color:#94a3b8;
                          text-align:center;
                        "
                      >
                        Welcome,
                        <span style="color:#ffffff;font-weight:700;">${safeName}</span>.
                        Your account is almost ready. Verify your email to unlock faster,
                        smarter sprint planning for your workflow.
                      </div>
                    </td>
                  </tr>

                  <tr>
                    <td align="center" style="padding:30px 32px 36px 32px;">
                      <table
                        role="presentation"
                        cellpadding="0"
                        cellspacing="0"
                        border="0"
                        style="border-collapse:separate;"
                      >
                        <tr>
                          <td
                            align="center"
                            bgcolor="#38bdf8"
                            style="
                              background-color:#38bdf8;
                              border-radius:16px;
                              box-shadow:0 14px 34px rgba(56,189,248,0.34);
                            "
                          >
                            <a
                              href="${verifyUrl}"
                              target="_blank"
                              rel="noopener noreferrer"
                              style="
                                display:inline-block;
                                font-family:Arial,sans-serif;
                                font-size:18px;
                                line-height:18px;
                                font-weight:800;
                                color:#ffffff;
                                text-decoration:none;
                                padding:18px 34px;
                                border-radius:16px;
                                background:linear-gradient(180deg, #59caff 0%, #38bdf8 100%);
                                background-color:#38bdf8;
                              "
                            >
                              Verify Email Address →
                            </a>
                          </td>
                        </tr>
                      </table>
                    </td>
                  </tr>

                  <tr>
                    <td style="padding:0 32px 18px 32px;">
                      <table
                        role="presentation"
                        cellpadding="0"
                        cellspacing="0"
                        border="0"
                        width="100%"
                        style="
                          width:100%;
                          border-collapse:collapse;
                          background-color:#091427;
                          border:1px solid #182946;
                          border-radius:20px;
                        "
                      >
                        <tr>
                          <td style="padding:20px 22px;">
                            <div
                              style="
                                font-family:Arial,sans-serif;
                                font-size:18px;
                                line-height:25px;
                                font-weight:700;
                                color:#ffffff;
                                margin-bottom:10px;
                              "
                            >
                              Why verify your email?
                            </div>

                            <div
                              style="
                                font-family:Arial,sans-serif;
                                font-size:14px;
                                line-height:25px;
                                color:#a8b3c7;
                              "
                            >
                              Verifying your email secures your account and activates your full SprintMaster workspace experience.
                            </div>
                          </td>
                        </tr>
                      </table>
                    </td>
                  </tr>

                  <tr>
                    <td style="padding:0 32px 18px 32px;">
                      <table
                        role="presentation"
                        cellpadding="0"
                        cellspacing="0"
                        border="0"
                        width="100%"
                        style="
                          width:100%;
                          border-collapse:collapse;
                          background-color:#0a1325;
                          border:1px solid #182946;
                          border-radius:20px;
                        "
                      >
                        <tr>
                          <td style="padding:20px 22px;">
                            <div
                              style="
                                font-family:Arial,sans-serif;
                                font-size:18px;
                                line-height:24px;
                                font-weight:700;
                                color:#ffffff;
                                margin-bottom:10px;
                              "
                            >
                              Button not working?
                            </div>

                            <div
                              style="
                                font-family:Arial,sans-serif;
                                font-size:14px;
                                line-height:24px;
                                color:#94a3b8;
                                margin-bottom:10px;
                              "
                            >
                              Copy and paste this link into your browser:
                            </div>

                            <div
                              style="
                                font-family:Consolas,Menlo,Monaco,monospace;
                                font-size:12px;
                                line-height:22px;
                                color:#7dd3fc;
                                word-break:break-all;
                              "
                            >
                              ${verifyUrl}
                            </div>
                          </td>
                        </tr>
                      </table>
                    </td>
                  </tr>

                  <tr>
                    <td style="padding:0 32px 20px 32px;">
                      <table
                        role="presentation"
                        cellpadding="0"
                        cellspacing="0"
                        border="0"
                        width="100%"
                        style="
                          width:100%;
                          border-collapse:collapse;
                          background-color:#07192a;
                          border:1px solid #123a62;
                          border-radius:20px;
                        "
                      >
                        <tr>
                          <td
                            style="
                              padding:18px 22px;
                              font-family:Arial,sans-serif;
                              font-size:14px;
                              line-height:25px;
                              color:#dbeafe;
                            "
                          >
                            This verification link expires in
                            <strong style="color:#ffffff;">24 hours</strong>.
                            If you did not create this account, you can safely ignore this email.
                          </td>
                        </tr>
                      </table>
                    </td>
                  </tr>

                  <tr>
                    <td align="center" style="padding:6px 32px 30px 32px;">
                      <div
                        style="
                          font-family:Arial,sans-serif;
                          font-size:12px;
                          line-height:20px;
                          color:#64748b;
                        "
                      >
                        © ${currentYear} SprintMaster AI · Plan one day of focused work in seconds
                      </div>
                    </td>
                  </tr>
                </table>
              </td>
            </tr>

            <tr>
              <td align="center" style="padding-top:16px;">
                <div
                  style="
                    font-family:Arial,sans-serif;
                    font-size:11px;
                    line-height:18px;
                    color:#475569;
                  "
                >
                  You are receiving this email because a SprintMaster account was created with this email address.
                </div>
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
  </body>
</html>
`
}

export async function sendVerificationEmail({
  to,
  name,
  verifyUrl,
}: SendVerificationEmailArgs) {
  const from = process.env.EMAIL_FROM?.trim()

  if (!from) {
    throw new Error('EMAIL_FROM is not configured.')
  }

  return getResend().emails.send({
    from,
    to,
    subject: getVerificationEmailSubject(),
    html: getVerificationEmailHtml({ name, verifyUrl }),
    text: getVerificationEmailText({ name, verifyUrl }),
  })
}
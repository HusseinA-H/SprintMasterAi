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

export const getVerificationEmailSubject = () => 'Verify your SprintMaster account'

export const getVerificationEmailText = ({
  name,
  verifyUrl,
}: VerificationEmailContentArgs) => `
Welcome to SprintMaster${name ? `, ${name}` : ''}!

Thanks for signing up for SprintMaster AI.

Please verify your email address by opening the link below:
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
    <title>Verify your SprintMaster account</title>
  </head>
  <body style="margin:0;padding:0;background-color:#0b1020;">
    <div style="display:none;max-height:0;overflow:hidden;opacity:0;color:transparent;">
      Verify your SprintMaster account and start planning your next sprint.
    </div>

    <table
      role="presentation"
      cellpadding="0"
      cellspacing="0"
      border="0"
      width="100%"
      style="width:100%;border-collapse:collapse;background:
        radial-gradient(circle at top left, #7c3aed 0%, #0b1020 38%),
        radial-gradient(circle at top right, #06b6d4 0%, transparent 25%),
        linear-gradient(180deg, #11162a 0%, #090d18 100%);
        background-color:#0b1020;
      "
    >
      <tr>
        <td align="center" style="padding:40px 16px;">
          <table
            role="presentation"
            cellpadding="0"
            cellspacing="0"
            border="0"
            width="100%"
            style="max-width:600px;border-collapse:separate;border-spacing:0;"
          >
            <tr>
              <td
                style="
                  background:
                    linear-gradient(180deg, rgba(255,255,255,0.08) 0%, rgba(255,255,255,0.03) 100%),
                    linear-gradient(180deg, #151b31 0%, #0f1426 100%);
                  border:1px solid rgba(255,255,255,0.08);
                  border-radius:24px;
                  padding:0;
                  box-shadow:
                    0 20px 60px rgba(0,0,0,0.45),
                    inset 0 1px 0 rgba(255,255,255,0.06);
                  overflow:hidden;
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
                    <td style="padding:32px 32px 20px 32px;text-align:center;">
                      <div
                        style="
                          margin:0 auto 18px auto;
                          width:68px;
                          height:68px;
                          border-radius:20px;
                          background:
                            radial-gradient(circle at 30% 30%, #a78bfa 0%, #7c3aed 45%, #4c1d95 100%);
                          box-shadow:
                            inset 0 2px 8px rgba(255,255,255,0.25),
                            0 10px 30px rgba(124,58,237,0.45);
                          line-height:68px;
                          text-align:center;
                          font-size:30px;
                          color:#ffffff;
                          font-weight:700;
                          font-family:Arial,sans-serif;
                        "
                      >
                        S
                      </div>

                      <div
                        style="
                          font-family:Arial,sans-serif;
                          font-size:24px;
                          line-height:32px;
                          font-weight:800;
                          color:#ffffff;
                          letter-spacing:-0.4px;
                          margin-bottom:6px;
                        "
                      >
                        SprintMaster AI
                      </div>

                      <div
                        style="
                          font-family:Arial,sans-serif;
                          font-size:13px;
                          line-height:20px;
                          color:#98a2b3;
                          letter-spacing:0.2px;
                        "
                      >
                        Smarter sprint planning. Cleaner execution.
                      </div>
                    </td>
                  </tr>

                  <tr>
                    <td style="padding:8px 32px 0 32px;text-align:center;">
                      <div
                        style="
                          display:inline-block;
                          font-family:Arial,sans-serif;
                          font-size:12px;
                          line-height:18px;
                          color:#c4b5fd;
                          background:rgba(124,58,237,0.12);
                          border:1px solid rgba(167,139,250,0.22);
                          border-radius:999px;
                          padding:8px 14px;
                        "
                      >
                        Account verification required
                      </div>
                    </td>
                  </tr>

                  <tr>
                    <td style="padding:24px 32px 0 32px;text-align:center;">
                      <div
                        style="
                          font-family:Arial,sans-serif;
                          font-size:30px;
                          line-height:38px;
                          font-weight:800;
                          color:#ffffff;
                          letter-spacing:-0.6px;
                          margin-bottom:14px;
                        "
                      >
                        Welcome, ${safeName}
                      </div>

                      <div
                        style="
                          font-family:Arial,sans-serif;
                          font-size:16px;
                          line-height:26px;
                          color:#cbd5e1;
                          max-width:460px;
                          margin:0 auto;
                        "
                      >
                        Your account is almost ready. Confirm your email address to activate
                        SprintMaster and start generating smarter, faster sprint workflows.
                      </div>
                    </td>
                  </tr>

                  <tr>
                    <td style="padding:28px 32px 0 32px;" align="center">
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
                            style="
                              border-radius:14px;
                              background:
                                linear-gradient(180deg, #8b5cf6 0%, #7c3aed 100%);
                              box-shadow:
                                0 10px 24px rgba(124,58,237,0.38),
                                inset 0 1px 0 rgba(255,255,255,0.18);
                            "
                          >
                            <a
                              href="${verifyUrl}"
                              target="_blank"
                              rel="noopener noreferrer"
                              style="
                                display:inline-block;
                                font-family:Arial,sans-serif;
                                font-size:15px;
                                line-height:15px;
                                font-weight:700;
                                color:#ffffff;
                                text-decoration:none;
                                padding:16px 28px;
                                border-radius:14px;
                              "
                            >
                              Verify Email Address
                            </a>
                          </td>
                        </tr>
                      </table>
                    </td>
                  </tr>

                  <tr>
                    <td style="padding:24px 32px 0 32px;">
                      <table
                        role="presentation"
                        cellpadding="0"
                        cellspacing="0"
                        border="0"
                        width="100%"
                        style="
                          width:100%;
                          border-collapse:collapse;
                          background:rgba(255,255,255,0.04);
                          border:1px solid rgba(255,255,255,0.07);
                          border-radius:16px;
                        "
                      >
                        <tr>
                          <td style="padding:18px 18px 10px 18px;">
                            <div
                              style="
                                font-family:Arial,sans-serif;
                                font-size:13px;
                                line-height:20px;
                                font-weight:700;
                                color:#ffffff;
                                margin-bottom:8px;
                              "
                            >
                              Button not working?
                            </div>
                            <div
                              style="
                                font-family:Arial,sans-serif;
                                font-size:13px;
                                line-height:22px;
                                color:#a5b4c7;
                                margin-bottom:8px;
                              "
                            >
                              Copy and paste this link into your browser:
                            </div>
                            <div
                              style="
                                font-family:Consolas,Menlo,Monaco,monospace;
                                font-size:12px;
                                line-height:20px;
                                color:#c4b5fd;
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
                    <td style="padding:24px 32px 0 32px;">
                      <table
                        role="presentation"
                        cellpadding="0"
                        cellspacing="0"
                        border="0"
                        width="100%"
                        style="width:100%;border-collapse:collapse;"
                      >
                        <tr>
                          <td
                            style="
                              padding:16px 18px;
                              background:rgba(6,182,212,0.07);
                              border:1px solid rgba(34,211,238,0.14);
                              border-radius:16px;
                              font-family:Arial,sans-serif;
                              font-size:13px;
                              line-height:22px;
                              color:#cbd5e1;
                            "
                          >
                            This verification link expires in <strong style="color:#ffffff;">24 hours</strong>.
                            If you did not create this account, you can safely ignore this email.
                          </td>
                        </tr>
                      </table>
                    </td>
                  </tr>

                  <tr>
                    <td style="padding:28px 32px 32px 32px;text-align:center;">
                      <div
                        style="
                          height:1px;
                          background:linear-gradient(90deg, rgba(255,255,255,0) 0%, rgba(255,255,255,0.12) 50%, rgba(255,255,255,0) 100%);
                          margin-bottom:18px;
                        "
                      ></div>

                      <div
                        style="
                          font-family:Arial,sans-serif;
                          font-size:12px;
                          line-height:20px;
                          color:#7f8ea3;
                        "
                      >
                        © ${currentYear} SprintMaster AI · Built for modern product teams
                      </div>
                    </td>
                  </tr>
                </table>
              </td>
            </tr>

            <tr>
              <td style="padding:16px 12px 0 12px;text-align:center;">
                <div
                  style="
                    font-family:Arial,sans-serif;
                    font-size:11px;
                    line-height:18px;
                    color:#667085;
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
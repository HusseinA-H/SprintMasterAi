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

Your account is almost ready.

Verify your email address by opening this link:
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
  <body style="margin:0;padding:0;background-color:#030b17;">
    <div style="display:none;max-height:0;overflow:hidden;opacity:0;color:transparent;">
      Verify your SprintMaster account and activate your workspace.
    </div>

    <table
      role="presentation"
      cellpadding="0"
      cellspacing="0"
      border="0"
      width="100%"
      style="width:100%;border-collapse:collapse;background-color:#030b17;"
    >
      <tr>
        <td align="center" style="padding:32px 16px;">
          <table
            role="presentation"
            cellpadding="0"
            cellspacing="0"
            border="0"
            width="100%"
            style="max-width:620px;border-collapse:collapse;"
          >
            <tr>
              <td
                style="
                  background:
                    radial-gradient(circle at top center, rgba(37,99,235,0.22) 0%, rgba(3,11,23,0) 42%),
                    linear-gradient(180deg, #071224 0%, #030b17 100%);
                  background-color:#071224;
                  border:1px solid #13243f;
                  border-radius:24px;
                  padding:44px 32px;
                  box-shadow:0 20px 50px rgba(0,0,0,0.35);
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
                    <td align="center" style="padding-bottom:10px;">
                      <div
                        style="
                          font-family:Arial,sans-serif;
                          font-size:16px;
                          line-height:16px;
                          font-weight:700;
                          color:#ffffff;
                          letter-spacing:0.2px;
                        "
                      >
                        SprintMaster AI
                      </div>
                    </td>
                  </tr>

                  <tr>
                    <td align="center" style="padding-bottom:22px;">
                      <div
                        style="
                          font-family:Arial,sans-serif;
                          font-size:14px;
                          line-height:22px;
                          color:#94a3b8;
                        "
                      >
                        Smarter sprint planning. Cleaner execution.
                      </div>
                    </td>
                  </tr>

                  <tr>
                    <td align="center" style="padding-bottom:28px;">
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
                              background-color:#0c1830;
                              border:1px solid #1d3b6b;
                              border-radius:999px;
                              padding:10px 18px;
                              font-family:Arial,sans-serif;
                              font-size:13px;
                              line-height:13px;
                              color:#7dd3fc;
                            "
                          >
                            Account verification required
                          </td>
                        </tr>
                      </table>
                    </td>
                  </tr>

                  <tr>
                    <td align="center" style="padding-bottom:14px;">
                      <div
                        style="
                          font-family:Arial,sans-serif;
                          font-size:42px;
                          line-height:48px;
                          font-weight:800;
                          color:#ffffff;
                          letter-spacing:-1px;
                        "
                      >
                        Welcome, ${safeName}
                      </div>
                    </td>
                  </tr>

                  <tr>
                    <td align="center" style="padding-bottom:30px;">
                      <div
                        style="
                          max-width:500px;
                          margin:0 auto;
                          font-family:Arial,sans-serif;
                          font-size:16px;
                          line-height:28px;
                          color:#cbd5e1;
                        "
                      >
                        Your account is almost ready. Confirm your email address to
                        activate SprintMaster and start generating focused sprint workflows
                        in seconds.
                      </div>
                    </td>
                  </tr>

                  <tr>
                    <td align="center" style="padding-bottom:34px;">
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
                            bgcolor="#2ea8ff"
                            style="
                              background:linear-gradient(180deg, #49b7ff 0%, #2ea8ff 100%);
                              background-color:#2ea8ff;
                              border-radius:14px;
                              box-shadow:0 12px 30px rgba(46,168,255,0.30);
                            "
                          >
                            <a
                              href="${verifyUrl}"
                              target="_blank"
                              rel="noopener noreferrer"
                              style="
                                display:inline-block;
                                padding:17px 34px;
                                font-family:Arial,sans-serif;
                                font-size:18px;
                                line-height:18px;
                                font-weight:700;
                                color:#ffffff;
                                text-decoration:none;
                                border-radius:14px;
                                background-color:#2ea8ff;
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
                    <td style="padding-bottom:22px;">
                      <table
                        role="presentation"
                        cellpadding="0"
                        cellspacing="0"
                        border="0"
                        width="100%"
                        style="
                          width:100%;
                          border-collapse:collapse;
                          background-color:#0b1426;
                          border:1px solid #1a2c49;
                          border-radius:16px;
                        "
                      >
                        <tr>
                          <td style="padding:20px;">
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
                                color:#a5b4c7;
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
                    <td style="padding-bottom:24px;">
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
                          border:1px solid #113b63;
                          border-radius:16px;
                        "
                      >
                        <tr>
                          <td
                            style="
                              padding:18px 20px;
                              font-family:Arial,sans-serif;
                              font-size:14px;
                              line-height:26px;
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
                    <td align="center" style="padding-top:6px;">
                      <div
                        style="
                          font-family:Arial,sans-serif;
                          font-size:12px;
                          line-height:20px;
                          color:#6b7a90;
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
                    color:#5b6b82;
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
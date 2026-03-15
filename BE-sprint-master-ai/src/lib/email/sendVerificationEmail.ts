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

export const getVerificationEmailHtml = ({
  name,
  verifyUrl,
}: VerificationEmailContentArgs) => `
  <div style="font-family:sans-serif;max-width:520px;margin:0 auto;">
    <h2 style="color:#7c3aed;">Welcome to SprintMaster, ${name || 'there'}!</h2>
    <p>Please verify your email to activate your account.</p>
    <a
      href="${verifyUrl}"
      style="display:inline-block;background:#7c3aed;color:#fff;padding:12px 28px;border-radius:8px;text-decoration:none;font-weight:600;margin:16px 0;"
    >
      Verify Email Address
    </a>
    <p style="color:#666;font-size:13px;">
      Or copy this link into your browser:<br />
      <code style="word-break:break-all;">${verifyUrl}</code>
    </p>
    <p style="color:#999;font-size:12px;">If you did not create an account, you can safely ignore this email.</p>
  </div>
`

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
  })
}

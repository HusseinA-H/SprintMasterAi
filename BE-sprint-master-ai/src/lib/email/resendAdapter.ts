import type { EmailAdapter, SendEmailOptions } from 'payload'
import { Resend } from 'resend'

const parseDefaultFrom = (value?: string | null) => {
  const fallback = {
    address: 'noreply@sprintmaster.app',
    name: 'SprintMaster AI',
  }

  const trimmed = value?.trim()
  if (!trimmed) return fallback

  const match = trimmed.match(/^(?:"?([^"]+)"?\s*)?<([^>]+)>$/)
  if (match) {
    return {
      name: match[1]?.trim() || fallback.name,
      address: match[2].trim(),
    }
  }

  return {
    address: trimmed,
    name: fallback.name,
  }
}

const normalizeRecipients = (value: SendEmailOptions['to']) => {
  if (!value) return []
  if (Array.isArray(value)) return value.map(String)
  return [String(value)]
}

export const resendAdapter =
  (): EmailAdapter =>
  () => {
    const apiKey = process.env.RESEND_API_KEY?.trim()

    if (!apiKey) {
      throw new Error('RESEND_API_KEY is not configured.')
    }

    const resend = new Resend(apiKey)
    const defaults = parseDefaultFrom(process.env.EMAIL_FROM)

    return {
      name: 'resend',
      defaultFromAddress: defaults.address,
      defaultFromName: defaults.name,
      sendEmail: async (message) => {
        const recipients = normalizeRecipients(message.to)

        if (recipients.length === 0) {
          throw new Error('Email requires at least one recipient.')
        }

        return resend.emails.send({
          from: typeof message.from === 'string' ? message.from : `${defaults.name} <${defaults.address}>`,
          to: recipients,
          subject: message.subject ?? '',
          html: typeof message.html === 'string' ? message.html : undefined,
          text: typeof message.text === 'string' ? message.text : undefined,
          cc: normalizeRecipients(message.cc),
          bcc: normalizeRecipients(message.bcc),
          replyTo: normalizeRecipients(message.replyTo),
        })
      },
    }
  }

import { FormEvent, useMemo, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Loader2, Settings, ShieldAlert } from 'lucide-react'

import { useAuth } from '@/auth/AuthContext'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { api } from '@/lib/api'

const ProfileSettings = () => {
  const navigate = useNavigate()
  const { user, refreshUser, logout } = useAuth()

  const [firstName, setFirstName] = useState(user?.firstName || '')
  const [lastName, setLastName] = useState(user?.lastName || '')
  const [profileMessage, setProfileMessage] = useState<string | null>(null)
  const [profileError, setProfileError] = useState<string | null>(null)
  const [savingProfile, setSavingProfile] = useState(false)

  const [resetMessage, setResetMessage] = useState<string | null>(null)
  const [resetError, setResetError] = useState<string | null>(null)
  const [sendingReset, setSendingReset] = useState(false)
  const [applyingReset, setApplyingReset] = useState(false)
  const [resetToken, setResetToken] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')

  const [deleteConfirm, setDeleteConfirm] = useState('')
  const [deleting, setDeleting] = useState(false)
  const [deleteError, setDeleteError] = useState<string | null>(null)

  const canSaveProfile = useMemo(() => {
    const cleanFirst = firstName.trim()
    const cleanLast = lastName.trim()
    return Boolean(cleanFirst && cleanLast && user && (cleanFirst !== user.firstName || cleanLast !== user.lastName))
  }, [firstName, lastName, user])

  const onSaveProfile = async (event: FormEvent) => {
    event.preventDefault()
    if (!user) return

    setSavingProfile(true)
    setProfileError(null)
    setProfileMessage(null)

    try {
      await api.updateProfile(user.id, {
        firstName: firstName.trim(),
        lastName: lastName.trim(),
      })
      await refreshUser()
      setProfileMessage('Profile updated successfully.')
    } catch (error) {
      setProfileError((error as Error).message || 'Could not update profile.')
    } finally {
      setSavingProfile(false)
    }
  }

  const onSendReset = async () => {
    if (!user?.email) return

    setSendingReset(true)
    setResetError(null)
    setResetMessage(null)

    try {
      await api.requestPasswordReset(user.email)
      setResetMessage('Password reset email sent. Paste the token from that email below.')
    } catch (error) {
      setResetError((error as Error).message || 'Failed to send reset email.')
    } finally {
      setSendingReset(false)
    }
  }

  const onApplyReset = async (event: FormEvent) => {
    event.preventDefault()

    if (!resetToken.trim()) {
      setResetError('Reset token is required.')
      return
    }

    if (!newPassword || newPassword.length < 6) {
      setResetError('New password must be at least 6 characters.')
      return
    }

    if (newPassword !== confirmPassword) {
      setResetError('Passwords do not match.')
      return
    }

    setApplyingReset(true)
    setResetError(null)
    setResetMessage(null)

    try {
      await api.resetPassword(resetToken.trim(), newPassword)
      setResetToken('')
      setNewPassword('')
      setConfirmPassword('')
      setResetMessage('Password updated. You can continue using your account normally.')
    } catch (error) {
      setResetError((error as Error).message || 'Failed to reset password.')
    } finally {
      setApplyingReset(false)
    }
  }

  const onDeleteAccount = async () => {
    if (!user) return
    if (deleteConfirm !== 'DELETE') {
      setDeleteError('Type DELETE to confirm account deletion.')
      return
    }

    setDeleting(true)
    setDeleteError(null)

    try {
      await api.deleteAccount(user.id)
      await logout()
      navigate('/', { replace: true })
    } catch (error) {
      setDeleteError((error as Error).message || 'Failed to delete account.')
      setDeleting(false)
    }
  }

  if (!user) {
    return null
  }

  return (
    <div className="min-h-screen bg-transparent">
      <header className="border-b border-border/50 bento-card rounded-none border-x-0 border-t-0">
        <div className="container mx-auto flex items-center justify-between h-16 px-6">
          <div className="flex items-center gap-2">
            <Settings className="w-4 h-4 text-primary" />
            <h1 className="font-semibold">Profile Settings</h1>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" className="h-9" asChild>
              <Link to="/dashboard">Back to Dashboard</Link>
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={async () => {
                await logout()
                navigate('/', { replace: true })
              }}
              className="text-xs text-muted-foreground hover:text-foreground"
            >
              Logout
            </Button>
          </div>
        </div>
      </header>

      <main className="container mx-auto max-w-3xl px-6 py-8 space-y-6">
        <section className="bento-card p-6">
          <h2 className="text-lg font-semibold mb-4">Basic Profile</h2>
          <form onSubmit={onSaveProfile} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm text-muted-foreground" htmlFor="firstName">
                  First name
                </label>
                <Input id="firstName" value={firstName} onChange={(e) => setFirstName(e.target.value)} />
              </div>
              <div className="space-y-2">
                <label className="text-sm text-muted-foreground" htmlFor="lastName">
                  Last name
                </label>
                <Input id="lastName" value={lastName} onChange={(e) => setLastName(e.target.value)} />
              </div>
            </div>
            {profileMessage ? <p className="text-sm text-green-500">{profileMessage}</p> : null}
            {profileError ? <p className="text-sm text-destructive">{profileError}</p> : null}
            <Button type="submit" disabled={!canSaveProfile || savingProfile} className="gradient-button border-0">
              {savingProfile ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
              Save Profile
            </Button>
          </form>
        </section>

        <section className="bento-card p-6">
          <h2 className="text-lg font-semibold mb-2">Change Password</h2>
          <p className="text-sm text-muted-foreground mb-4">
            This uses Payload&apos;s reset-password flow. First send a reset email, then enter the token here.
          </p>

          <Button variant="outline" onClick={onSendReset} disabled={sendingReset} className="mb-4">
            {sendingReset ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
            Send Reset Email
          </Button>

          <form onSubmit={onApplyReset} className="space-y-3">
            <Input
              placeholder="Reset token"
              value={resetToken}
              onChange={(e) => setResetToken(e.target.value)}
            />
            <Input
              type="password"
              placeholder="New password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
            />
            <Input
              type="password"
              placeholder="Confirm new password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
            />
            {resetMessage ? <p className="text-sm text-green-500">{resetMessage}</p> : null}
            {resetError ? <p className="text-sm text-destructive">{resetError}</p> : null}
            <Button type="submit" disabled={applyingReset}>
              {applyingReset ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
              Apply New Password
            </Button>
          </form>
        </section>

        <section className="bento-card p-6 border border-red-500/30">
          <div className="flex items-center gap-2 mb-2">
            <ShieldAlert className="w-4 h-4 text-red-400" />
            <h2 className="text-lg font-semibold">Delete Account</h2>
          </div>
          <p className="text-sm text-muted-foreground mb-4">
            This action is permanent. Type <code>DELETE</code> below and confirm.
          </p>
          <Input
            placeholder="Type DELETE to confirm"
            value={deleteConfirm}
            onChange={(e) => setDeleteConfirm(e.target.value)}
            className="mb-3"
          />
          {deleteError ? <p className="text-sm text-destructive mb-3">{deleteError}</p> : null}
          <Button variant="destructive" onClick={onDeleteAccount} disabled={deleting}>
            {deleting ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
            Permanently Delete Account
          </Button>
        </section>
      </main>
    </div>
  )
}

export default ProfileSettings

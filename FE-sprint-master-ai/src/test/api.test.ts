import { afterAll, beforeEach, describe, expect, it, vi } from 'vitest'
import { api } from '@/lib/api'

const originalFetch = global.fetch

function mockJsonResponse(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json' },
  })
}

describe('api auth behavior', () => {
  beforeEach(() => {
    vi.restoreAllMocks()
    window.localStorage.clear()
    global.fetch = vi.fn()
  })

  it('sends Authorization header for protected me endpoint', async () => {
    window.localStorage.setItem('sprint_master_auth_token', 'token-123')
    vi.mocked(global.fetch).mockResolvedValue(mockJsonResponse({ user: { id: 'u1', email: 'u@example.com' } }))

    await api.me()

    expect(global.fetch).toHaveBeenCalledTimes(1)
    expect(global.fetch).toHaveBeenCalledWith(
      expect.stringContaining('/api/users/me'),
      expect.objectContaining({
        method: 'GET',
        credentials: 'include',
        headers: expect.objectContaining({
          Authorization: 'JWT token-123',
        }),
      }),
    )
  })

  it('sends Authorization header for sprint generation endpoint', async () => {
    window.localStorage.setItem('sprint_master_auth_token', 'token-xyz')
    vi.mocked(global.fetch).mockResolvedValue(
      mockJsonResponse({
        id: 's1',
        title: 'Sprint',
        description: '',
        goal: 'goal',
        status: 'generated',
        estimatedHours: 3,
        createdAt: new Date().toISOString(),
        acceptanceCriteria: [],
        risks: [],
        subtasks: [],
      }),
    )

    await api.generateSprint('Test goal')

    expect(global.fetch).toHaveBeenCalledTimes(1)
    expect(global.fetch).toHaveBeenCalledWith(
      expect.stringContaining('/api/generate-sprint'),
      expect.objectContaining({
        method: 'POST',
        credentials: 'include',
        headers: expect.objectContaining({
          Authorization: 'JWT token-xyz',
        }),
      }),
    )
  })

  it('sends Authorization header for account deletion endpoint', async () => {
    window.localStorage.setItem('sprint_master_auth_token', 'token-delete')
    vi.mocked(global.fetch).mockResolvedValue(new Response(null, { status: 204 }))

    await api.deleteAccount('user-1')

    expect(global.fetch).toHaveBeenCalledTimes(1)
    expect(global.fetch).toHaveBeenCalledWith(
      expect.stringContaining('/api/users/user-1'),
      expect.objectContaining({
        method: 'DELETE',
        credentials: 'include',
        headers: expect.objectContaining({
          Authorization: 'JWT token-delete',
        }),
      }),
    )
  })
})

afterAll(() => {
  global.fetch = originalFetch
})

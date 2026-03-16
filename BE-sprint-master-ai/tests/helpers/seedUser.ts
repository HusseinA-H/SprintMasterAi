import { getPayload } from 'payload'
import config from '../../src/payload.config.js'

export const testUser = {
  email: 'dev@payloadcms.com',
  password: 'test',
  firstName: 'Dev',
  lastName: 'User',
  subscription: 'free' as const,
}

export async function seedTestUser(): Promise<void> {
  const payload = await getPayload({ config })

  await payload.delete({
    collection: 'users',
    where: {
      email: {
        equals: testUser.email,
      },
    },
  })

  const createdUser = await payload.create({
    collection: 'users',
    data: testUser,
  })

  await payload.update({
    collection: 'users',
    id: createdUser.id,
    data: {
      _verified: true,
    },
  })
}

export async function cleanupTestUser(): Promise<void> {
  const payload = await getPayload({ config })

  await payload.delete({
    collection: 'users',
    where: {
      email: {
        equals: testUser.email,
      },
    },
  })
}
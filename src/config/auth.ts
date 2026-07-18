import { betterAuth } from 'better-auth';
import { mongodbAdapter } from 'better-auth/adapters/mongodb';
import mongoose from 'mongoose';

// Lazy getter — called after mongoose.connect() has been established
export const getAuth = () => {
  const client = mongoose.connection.getClient();
  const db = client.db();

  return betterAuth({
    database: mongodbAdapter(db),
    secret: process.env.BETTER_AUTH_SECRET || 'jobnest-better-auth-secret-key-2026-production',
    baseURL: process.env.BETTER_AUTH_URL || 'http://localhost:5000',
    basePath: '/api/auth/better',
    trustedOrigins: [
      process.env.CLIENT_URL || 'http://localhost:3001',
    ],
    emailAndPassword: {
      enabled: true,
      autoSignIn: true,
    },
    socialProviders: {
      google: {
        clientId: process.env.GOOGLE_CLIENT_ID!,
        clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
      },
    },
    session: {
      expiresIn: 60 * 60 * 24 * 7,
      updateAge: 60 * 60 * 24,
      cookieCache: {
        enabled: true,
        maxAge: 60 * 5,
      },
    },
    user: {
      additionalFields: {
        role: {
          type: 'string',
          defaultValue: 'user',
          required: false,
        },
      },
    },
    advanced: {
      crossSubDomainCookies: {
        enabled: false,
      },
    },
  });
};

export type BetterAuthInstance = ReturnType<typeof getAuth>;

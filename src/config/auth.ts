import { betterAuth } from 'better-auth';
import { mongodbAdapter } from 'better-auth/adapters/mongodb';
import mongoose from 'mongoose';

let cachedAuth: any = null;

// Lazy getter — called after mongoose.connect() has been established
export const getAuth = () => {
  if (cachedAuth) return cachedAuth;

  const client = mongoose.connection.getClient();
  if (!client) {
    throw new Error('Database client not initialized. Ensure connectDB() runs before getAuth().');
  }
  const db = client.db();

  cachedAuth = betterAuth({
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
        clientId: process.env.GOOGLE_CLIENT_ID || 'dummy_client_id',
        clientSecret: process.env.GOOGLE_CLIENT_SECRET || 'dummy_client_secret',
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

  return cachedAuth;
};

export type BetterAuthInstance = any;

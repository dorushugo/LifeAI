import { betterAuth } from "better-auth";
import { Pool } from "pg";

export const auth = betterAuth({
  database: new Pool({
    connectionString: process.env.POSTGRES_URL,
  }),
  emailAndPassword: {
    enabled: true,
    signUp: {
      enabled: true,
    },
    signIn: {
      enabled: true,
    },
    forgotPassword: {
      enabled: true,
    },
    resetPassword: {
      enabled: true,
    },
    updatePassword: {
      enabled: true,
    },
  },
});

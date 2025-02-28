import { NextAuthConfig } from "next-auth";
import Google from "next-auth/providers/google";
import Resend from "next-auth/providers/resend";

import { env } from "@/env.mjs";

export default {
  providers: [
    Google({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
      authorization: {
        params: {
          scope: "openid email profile https://www.googleapis.com/auth/calendar https://www.googleapis.com/auth/calendar.events",
          access_type: "offline",
          prompt: "consent",
        },
      },
    }),
    Resend({
      apiKey: env.RESEND_API_KEY,
      from: env.EMAIL_FROM
    }),
  ],
} satisfies NextAuthConfig;

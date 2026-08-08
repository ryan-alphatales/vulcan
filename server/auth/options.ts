import type { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";

import { AccountService } from "@/server/accounts/service";
import { PrismaAccountStore } from "@/server/accounts/prisma-store";
import { ResendVerificationEmailSender } from "@/server/email/resend";

const accountService = new AccountService(new PrismaAccountStore(), new ResendVerificationEmailSender());

export const authOptions: NextAuthOptions = {
  session: { strategy: "jwt" },
  callbacks: {
    session({ session, token }) {
      // Credentials sessions identify the account in JWT `sub`. Copy it to
      // the server session so ownership checks on protected routes can run.
      if (session.user && typeof token.sub === "string") session.user.id = token.sub;
      return session;
    },
  },
  providers: [
    CredentialsProvider({
      name: "Email and password",
      credentials: { email: { label: "Email", type: "email" }, password: { label: "Password", type: "password" } },
      async authorize(credentials) {
        if (!credentials?.email || !credentials.password) return null;
        try {
          const account = await accountService.authenticate(credentials.email, credentials.password);
          return { id: account.id, email: account.email, name: account.displayName ?? account.email };
        } catch {
          // A generic credential response prevents account enumeration at the Auth.js boundary.
          return null;
        }
      },
    }),
  ],
  pages: { signIn: "/login" },
};

export { accountService };

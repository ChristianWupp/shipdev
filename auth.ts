import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import { SiweMessage } from "siwe";

export const { handlers: { GET, POST }, auth, signIn, signOut } = NextAuth({
  providers: [
    Credentials({
      id: "siwe",
      name: "SIWE",
      credentials: {
        message: { type: "text" },
        signature: { type: "text" },
      },
      async authorize(credentials) {
        if (!credentials?.message || !credentials?.signature) {
          return null;
        }

        try {
          const siweMessage = new SiweMessage(credentials.message as string);
          const result = await siweMessage.verify({
            signature: credentials.signature as string,
          });

          if (result.success) {
            return {
              id: siweMessage.address,
              name: siweMessage.address,
            };
          }

          return null;
        } catch {
          return null;
        }
      },
    }),
  ],
  session: {
    strategy: "jwt",
  },
  callbacks: {
    async session({ session, token }) {
      if (token.sub) {
        session.user.name = token.sub;
      }
      return session;
    },
  },
});

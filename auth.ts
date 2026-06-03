import NextAuth from "next-auth"
import Google from "next-auth/providers/google"
import { prisma } from "./lib/prisma"

export const { handlers, signIn, signOut, auth } = NextAuth({
  providers: [
    Google({
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    })
  ],
  callbacks: {
    async signIn({ user, account }) {
      if (account?.provider === "google") {
        try {
          if (!user.email) return false;
          
          let coach = await prisma.coach.findFirst({
            where: {
              OR: [
                { google_id: account.providerAccountId },
                { email: user.email }
              ]
            }
          });

          if (!coach) {
            // Opprett ny trener hvis de ikke finnes
            coach = await prisma.coach.create({
              data: {
                email: user.email,
                google_id: account.providerAccountId,
                full_name: user.name || "Ukjent",
              }
            });
          } else if (!coach.google_id) {
            // Knytt eksisterende trener til Google
            coach = await prisma.coach.update({
              where: { id: coach.id },
              data: { google_id: account.providerAccountId }
            });
          }

          // Sett NextAuth user ID til vår Coach ID
          user.id = coach.id;
          return true;
        } catch (error) {
          console.error("Feil ved innlogging:", error);
          return false;
        }
      }
      return true;
    },
    async session({ session, token }) {
      if (token?.sub) {
        session.user.id = token.sub;
      }
      return session;
    },
    async jwt({ token, user }) {
      if (user) {
        token.sub = user.id;
      }
      return token;
    }
  },
  session: { strategy: "jwt" }
})

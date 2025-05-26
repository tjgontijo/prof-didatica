import NextAuth, { NextAuthOptions } from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: 'Credentials',
      credentials: {
        username: { label: "Username", type: "text" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials) {
        // Ensure environment variables are set
        const adminUsername = process.env.ADMIN_USERNAME;
        const adminPassword = process.env.ADMIN_PASSWORD;

        if (!adminUsername || !adminPassword) {
          console.error('Admin credentials are not set in environment variables.');
          return null;
        }

        // Check if the provided credentials match the admin credentials
        if (credentials && credentials.username === adminUsername && credentials.password === adminPassword) {
          // If they match, return a user object
          return { id: "1", name: "Admin", email: "admin@example.com" }; // email is a required field for the default user type
        } else {
          // If they don't match, return null (authentication failed)
          console.log('Invalid credentials provided.');
          return null;
        }
      }
    })
  ],
  session: {
    strategy: 'jwt', // Using JWT for session management
  },
  secret: process.env.NEXTAUTH_SECRET, // Secret for signing JWTs
  pages: {
    signIn: '/auth/signin', // A generic sign-in page, not in scope for this task but good practice
  },
  callbacks: {
    async jwt({ token, user }) {
      // Persist the user id to the token right after signin
      if (user) {
        token.id = user.id;
      }
      return token;
    },
    async session({ session, token }) {
      // Add user id to the session
      if (session.user && token.id) {
        (session.user as any).id = token.id;
      }
      return session;
    }
  }
};

const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };

import type { DefaultSession, DefaultUser } from 'next-auth';
import type { JWT, DefaultJWT } from 'next-auth/jwt';

declare module 'next-auth' {
  interface Session {
    user: {
      id: string;
      username: string;
      isPublic: boolean;
    } & DefaultSession['user'];
  }

  interface User extends DefaultUser {
    username?: string;
    isPublic?: boolean;
  }
}

declare module 'next-auth/jwt' {
  interface JWT extends DefaultJWT {
    userId?: string;
    username?: string;
    isPublic?: boolean;
  }
}
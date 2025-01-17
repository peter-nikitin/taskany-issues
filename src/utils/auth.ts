import { PrismaAdapter } from '@next-auth/prisma-adapter';
import GitHubProvider from 'next-auth/providers/github';
import CredentialsProvider from 'next-auth/providers/credentials';
import type { NextAuthOptions } from 'next-auth';
import { Role } from '@prisma/client';

import { prisma } from './prisma';

// https://next-auth.js.org/configuration/options
export const authOptions: NextAuthOptions = {
    secret: process.env.NEXTAUTH_SECRET,
    adapter: PrismaAdapter(prisma),
    session: {
        strategy: 'jwt', // required for CredentialsProvider
    },
    providers: [
        CredentialsProvider({
            name: 'Credentials',
            credentials: {
                email: { label: 'email', type: 'text', placeholder: 'admin@taskany.org' },
                password: { label: 'password', type: 'password' },
            },
            async authorize(creds) {
                const user = await prisma.user.findUnique({
                    where: {
                        email: creds?.email,
                    },
                    include: {
                        accounts: true,
                    },
                });

                if (!user) return null;
                // FIXME: add salt
                if (user?.accounts[0].password !== creds?.password) return null;

                return {
                    id: user.id,
                    name: user.name,
                    email: user.email,
                    image: user.image,
                    role: user.role,
                    activityId: user.activityId,
                };
            },
        }),
        // https://next-auth.js.org/configuration/providers/oauth
        GitHubProvider({
            clientId: process.env.GITHUB_CLIENT_ID,
            clientSecret: process.env.GITHUB_CLIENT_SECRET,
        }),
    ],
    callbacks: {
        // @ts-ignore — black magic of adding user data to session
        async session({ session, token, user }) {
            const id = (session.user.id || token?.id || user.id) as string;
            const dbUser = await prisma.user.findUnique({
                where: {
                    id,
                },
            });

            return {
                ...session,
                user: {
                    ...session.user,
                    id,
                    role: token?.role || user.role,
                    activityId: dbUser?.activityId,
                },
            };
        },
        async jwt({ token, user, account, profile, isNewUser }) {
            if (user && isNewUser) {
                await prisma.user.update({
                    where: {
                        id: user.id,
                    },
                    data: {
                        activity: {
                            create: {},
                        },
                    },
                });
            }

            return user
                ? {
                      ...token,
                      id: user.id,
                      role: user.role,
                      activityId: user.activityId,
                  }
                : token;
        },
    },
};

declare module 'next-auth' {
    interface Session {
        user: {
            id: string;
            name: string;
            email: string;
            image?: string | null;
            role: Role;
            activityId: string;
        };
    }

    interface User {
        role: Role;
    }
}

import NextAuth from "next-auth";
import { UserType, UserWithToken } from "@/types/user";
import axiosInstance from "./lib/axios-interceptor";
import Credentials from "next-auth/providers/credentials"

export const { handlers, signIn, signOut, auth } = NextAuth({
    providers: [
        Credentials({
            // You can specify which fields should be submitted, by adding keys to the `credentials` object.
            // e.g. domain, username, password, 2FA token, etc.
            credentials: {
                email: {},
                password: {},
            },
            authorize: async (credentials) => {
                try {
                    const baseURL = ((process.env.NODE_ENV === "development" ? process.env.NEXT_PUBLIC_API_URL : process.env.NEXT_PUBLIC_API_URL_DOCKER) || "http://locahost:8000") + '/api/v1'
                    const response = await axiosInstance.post(`${baseURL}/auth/login`, {
                        email: credentials.email,
                        password: credentials.password,
                    });

                    const userData = response.data;
                    // Type assertion for modifying user
                    const typedUser = userData as UserWithToken;

                    // Update user with data from your backend
                    typedUser.id = userData.user.id;
                    typedUser.email = userData.user.email;
                    typedUser.first_name = userData.user.first_name;
                    typedUser.last_name = userData.user.last_name;
                    typedUser.phone = userData.user.phone;
                    typedUser.is_active = userData.user.is_active;
                    typedUser.is_verified = userData.user.is_verified;
                    typedUser.user_type = userData.user.user_type;
                    typedUser.full_name = userData.user.full_name;
                    typedUser.is_patient = userData.user.is_patient;
                    typedUser.is_doctor = userData.user.is_doctor;
                    typedUser.is_admin = userData.user.is_admin;
                    typedUser.created_at = userData.user.created_at;
                    typedUser.updated_at = userData.user.updated_at;
                    typedUser.access_token = userData.access_token;

                    return typedUser;
                } catch {
                    return null;
                }
            },
        }),

    ],
    session: {
        strategy: "jwt",
        maxAge: 30 * 24 * 60 * 60, // 30 days
    },
    callbacks: {
        async jwt({ token, user }) {
            const typedUser = user as UserWithToken | undefined;

            if (typedUser) {
                token.id = typedUser.id;
                token.email = typedUser.email;
                token.first_name = typedUser.first_name;
                token.last_name = typedUser.last_name;
                token.phone = typedUser.phone;
                token.is_active = typedUser.is_active;
                token.is_verified = typedUser.is_verified;
                token.user_type = typedUser.user_type;
                token.full_name = typedUser.full_name;
                token.is_patient = typedUser.is_patient;
                token.is_doctor = typedUser.is_doctor;
                token.is_admin = typedUser.is_admin;
                token.created_at = typedUser.created_at;
                token.updated_at = typedUser.updated_at;
                token.token = typedUser.access_token;
            }
            return token;
        },
        async session({ session, token }) {
            if (token) {
                session.user.id = token.id as string;
                session.user.email = token.email as string;
                session.user.first_name = token.first_name as string;
                session.user.last_name = token.last_name as string;
                session.user.phone = token.phone as string;
                session.user.is_active = token.is_active as boolean;
                session.user.is_verified = token.is_verified as boolean;
                session.user.user_type = token.user_type as UserType;
                session.user.full_name = token.full_name as string;
                session.user.is_patient = token.is_patient as boolean;
                session.user.is_doctor = token.is_doctor as boolean;
                session.user.is_admin = token.is_admin as boolean;
                session.user.created_at = token.created_at as string;
                session.user.updated_at = token.updated_at as string;
                session.token = token.token as string;
            }
            return session;
        },
    },
    pages: {
        signIn: "/auth/login",
        error: "/auth/error",
    },
    events: {
    },
    debug: process.env.NODE_ENV === "development",
    secret: process.env.NEXTAUTH_SECRET,
    trustHost: true,
})
import { DefaultSession } from 'next-auth';
import { UserType } from './user';

// Extend NextAuth types
declare module "next-auth" {
    interface User {
        id: string;
        email: string;
        first_name: string;
        last_name: string;
        phone?: string;
        is_active: boolean;
        is_verified: boolean;
        user_type: UserType;
        full_name: string;
        is_patient: boolean;
        is_doctor: boolean;
        is_admin: boolean;
        created_at: string;
        updated_at: string;
        token?: string;
    }

    interface Session {
        user: {
            id: string;
            email: string;
            first_name: string;
            last_name: string;
            phone?: string;
            is_active: boolean;
            is_verified: boolean;
            user_type: UserType;
            full_name: string;
            is_patient: boolean;
            is_doctor: boolean;
            is_admin: boolean;
            created_at: string;
            updated_at: string;
        } & DefaultSession["user"];
        token?: string;
    }
}

// JWT type extension
declare module "next-auth/jwt" {
    interface JWT {
        id: string;
        email: string;
        first_name: string;
        last_name: string;
        phone?: string;
        is_active: boolean;
        is_verified: boolean;
        user_type: UserType;
        full_name: string;
        is_patient: boolean;
        is_doctor: boolean;
        is_admin: boolean;
        created_at: string;
        updated_at: string;
        token?: string;
        googleId?: string;
        name?: string;
        picture?: string;
        sub?: string;
    }
} 
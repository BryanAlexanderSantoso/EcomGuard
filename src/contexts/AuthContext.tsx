'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { User } from '@supabase/supabase-js';

type Role = 'seller' | 'admin' | 'buyer';

interface AuthContextType {
    user: User | null;
    role: Role | null;
    isLoading: boolean;
    signIn: (email: string, password: string) => Promise<{ error: any }>;
    signUp: (email: string, password: string, fullName: string, role: Role) => Promise<{ error: any }>;
    signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
    const [user, setUser] = useState<User | null>(null);
    const [role, setRole] = useState<Role | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    const fetchRole = async (userId: string) => {
        const { data: profile } = await supabase
            .from('profiles')
            .select('role')
            .eq('id', userId)
            .single();
        return (profile?.role as Role) || 'seller';
    };

    useEffect(() => {
        const initAuth = async () => {
            try {
                const { data: { session }, error } = await supabase.auth.getSession();
                if (error) {
                    // Handle invalid refresh token or session errors gracefully
                    const isRefreshTokenError = error.message.includes("Refresh Token Not Found") ||
                        error.message.includes("Invalid Refresh Token");

                    if (isRefreshTokenError) {
                        // Silently clear session if token is missing/invalid
                        await supabase.auth.signOut();
                        setUser(null);
                        setRole(null);
                    } else {
                        console.error('Session init error:', error.message);
                    }
                } else if (session?.user) {
                    setUser(session.user);
                    const r = await fetchRole(session.user.id);
                    setRole(r);
                }
            } catch (err) {
                console.error('Unexpected auth init error:', err);
                await supabase.auth.signOut();
            }
            setIsLoading(false);
        };

        initAuth();

        const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
            setUser(session?.user ?? null);
            if (session?.user) {
                const r = await fetchRole(session.user.id);
                setRole(r);
            } else {
                setRole(null);
            }
            setIsLoading(false);
        });

        return () => subscription.unsubscribe();
    }, []);

    const signIn = async (email: string, password: string) => {
        try {
            const { data, error } = await supabase.auth.signInWithPassword({
                email,
                password,
            });
            if (error) {
                // Kembalikan pesan error asli dari Supabase agar lebih jelas
                return { error: { message: error.message } };
            }
            return { error: null };
        } catch (err) {
            return { error: { message: 'Koneksi gagal. Periksa jaringan Anda.' } };
        }
    };

    const signUp = async (email: string, password: string, fullName: string, roleToSet: Role) => {
        if (roleToSet === 'admin') {
            return { error: { message: 'Registrasi admin tidak diizinkan melalui jalur ini.' } };
        }

        try {
            const { data, error: signUpError } = await supabase.auth.signUp({
                email,
                password,
                options: {
                    data: {
                        full_name: fullName,
                        role: roleToSet
                    }
                }
            });

            if (signUpError) return { error: signUpError };

            // Profile creation is now handled by the 'on_auth_user_created' database trigger
            // This prevents RLS (Row Level Security) errors on the client side

            return { error: null };
        } catch (err) {
            return { error: { message: 'Pendaftaran gagal karena masalah koneksi.' } };
        }
    };

    const signOut = async () => {
        await supabase.auth.signOut();
        setUser(null);
        setRole(null);
    };

    return (
        <AuthContext.Provider value={{ user, role, isLoading, signIn, signUp, signOut }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};

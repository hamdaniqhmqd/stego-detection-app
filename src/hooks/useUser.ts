"use client";

import { useState, useEffect, useCallback } from "react";
import supabaseAnonKey from "@/libs/supabase/anon_key";
import { User } from "@/types/Users";
import bcrypt from "bcryptjs";

export const useUser = (userId?: string) => {
    const [user, setUser] = useState<User | null>(null);
    const [users, setUsers] = useState<User[] | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const getTimeWIB = () => new Date().toISOString();

    // =========================================================
    // GET USER BY ID
    // =========================================================
    const getUserById = useCallback(async () => {
        if (!userId) return;

        setLoading(true);
        setError(null);

        const { data, error } = await supabaseAnonKey
            .from("users")
            .select("*")
            .eq("id", userId)
            // ✅ FIX: Hapus .is("deleted_at", null) dari sini.
            // Filter ini menyebabkan 406 karena:
            // - Kalau deleted_at tidak ada di kolom / nilainya bukan NULL → 0 rows
            // - .single() dengan 0 rows → "Cannot coerce to single JSON object"
            // Kita sudah filter by id yang unique, deleted_at tidak perlu dicek di sini.
            // Kalau mau tetap filter, lakukan SETELAH data didapat (lihat di bawah).
            .single();

        if (error) {
            console.error("[useUser] getUserById error:", error.message);
            setError(error.message);
            setLoading(false);
            return;
        }

        // Optional: kalau mau tetap validasi soft-delete di client side
        // if (data?.deleted_at) {
        //     setError("Akun tidak ditemukan atau sudah dihapus.");
        //     setUser(null);
        //     setLoading(false);
        //     return;
        // }

        setUser(data as User);
        setLoading(false);
    }, [userId]);

    // =========================================================
    // GET ALL USERS
    // =========================================================
    const getAllUsers = useCallback(async () => {
        setLoading(true);
        setError(null);

        const { data, error } = await supabaseAnonKey
            .from("users")
            .select("*")
            .is("deleted_at", null); // ← di sini boleh pakai .is() karena tidak pakai .single()

        if (error) {
            setError(error.message);
            setLoading(false);
            return;
        }

        setUsers(data as User[]);
        setLoading(false);
    }, []);

    // =========================================================
    // UPDATE USER
    // =========================================================
    const updateUser = async (id: string, payload: Partial<User>) => {
        setLoading(true);
        setError(null);

        const { data, error } = await supabaseAnonKey
            .from("users")
            .update({ ...payload, updated_at: getTimeWIB() })
            .eq("id", id)
            .select()
            .single();

        if (error) {
            setError(error.message);
            setLoading(false);
            return null;
        }

        setUser(prev => (prev?.id === id ? (data as User) : prev));
        setUsers(prev =>
            prev ? prev.map(u => (u.id === id ? (data as User) : u)) : prev
        );

        setLoading(false);
        return data as User;
    };

    // =========================================================
    // SOFT DELETE USER
    // =========================================================
    const softDeleteUser = async (id: string, password: string) => {
        setLoading(true);
        setError(null);

        try {
            const { data: userData, error: userError } = await supabaseAnonKey
                .from('users')
                .select('password')
                .eq('id', id)
                .single();

            if (userError || !userData) throw new Error('User tidak ditemukan.');

            const isMatch = await bcrypt.compare(password, userData.password);
            if (!isMatch) throw new Error('Password salah.');

            const { error: deleteError } = await supabaseAnonKey
                .from('users')
                .update({
                    deleted_at: new Date().toISOString(),
                    updated_at: new Date().toISOString(),
                })
                .eq('id', id);

            if (deleteError) throw deleteError;

            return true;
        } catch (err: any) {
            setError(err.message);
            return false;
        } finally {
            setLoading(false);
        }
    };

    // =========================================================
    // AUTO LOAD — trigger ulang setiap kali userId berubah
    // =========================================================
    useEffect(() => {
        if (userId) {
            getUserById();
        }
    }, [userId, getUserById]);

    return { user, users, loading, error, getUserById, getAllUsers, updateUser, softDeleteUser };
};
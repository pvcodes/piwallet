'use client'
import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
import { useWallet } from '@solana/wallet-adapter-react';
import axios from 'axios';
import { User } from '@prisma/client';

interface UserContextType {
    user: User | null;
    loading: boolean;
    publicKey: string | null;
    wallet: any;
    updateUser: Function
}

const UserContext = createContext<UserContextType | undefined>(undefined);

export const UserProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const { publicKey, wallet } = useWallet();
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState<boolean>(false);
    const isFetching = useRef(false); // Ref to track fetch status

    useEffect(() => {
        const findOrAddUser = async () => {
            if (publicKey && !isFetching.current) {
                isFetching.current = true; // Set fetching status
                setLoading(true);
                try {
                    const walletAddress = publicKey.toString();
                    const response = await axios.post("/api/user", { walletAddress });
                    if (response.data) {
                        setUser(response.data.data);
                    } else {
                        console.warn("API response does not contain data.");
                    }
                } catch (error) {
                    console.error("Failed to upsert user:", error);
                } finally {
                    setLoading(false);
                    isFetching.current = false; // Reset fetching status
                }
            } else {
                setUser(null);
            }
        };

        findOrAddUser();
    }, [publicKey]);


    const updateUser = async (userData: Partial<User>) => {
        if (!user) return;
        setLoading(true);
        try {
            const response = await axios.put(`/api/user`, {
                walletAddress: user.walletAddress,
                ...userData
            });
            if (response.data) {
                setUser(response.data.data);
                alert(`This is your master key, keep it save if lost you will not be able to recover again.${response?.data?.data?.key}`)
            } else {
                console.warn("API response does not contain data.");
            }
        } catch (error) {
            console.error("Failed to update user:", error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <UserContext.Provider value={{ user, loading, publicKey: publicKey?.toString() || null, wallet, updateUser }}>
            {children}
        </UserContext.Provider>
    );
};

export const useUserContext = () => {
    const context = useContext(UserContext);
    if (context === undefined) {
        throw new Error('useUserContext must be used within a UserProvider');
    }
    return context;
};
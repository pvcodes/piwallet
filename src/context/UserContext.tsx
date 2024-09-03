'use client'
import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
import { useWallet } from '@solana/wallet-adapter-react';
import axios from 'axios';
import { User } from '@prisma/client';
import { toast } from 'react-toastify';

interface UserContextType {
    user: User | null;
    loading: boolean;
    publicKey: string | null;
    wallet: any;
    updateUser: Function;
    persistedMasterKey: string | null
    setPersistedMasterKey: (key: string) => void;

}

function downloadMasterKey(masterKey: string) {
    const element = document.createElement('a');
    const file = new Blob([masterKey], { type: 'text/plain' });
    element.href = URL.createObjectURL(file);
    element.download = 'masterkey.txt';
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
}

const UserContext = createContext<UserContextType | undefined>(undefined);

export const UserProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const { publicKey, wallet } = useWallet();
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState<boolean>(false);
    const isFetching = useRef(false); // Ref to track fetch status
    const [persistedMasterKey, setPersistedMasterKeyState] = useState<string | null>(null); // Add state for masterKey


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
                setPersistedMasterKeyState(null)
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
                // alert(`This is your master key, keep it save if lost you will not be able to recover again.\n${response?.data?.data?.masterkey}`)
                if (response?.data?.data?.masterkey) {
                    await navigator.clipboard.writeText(response?.data?.data?.masterkey);
                    toast.success('Master key copied to clipboard and downloaded');
                    downloadMasterKey(response?.data?.data?.masterkey);
                }
            } else {
                console.warn("API response does not contain data.");
            }
        } catch (error) {
            console.error("Failed to update user:", error);
        } finally {
            setLoading(false);
        }
    };

    const setPersistedMasterKey = (key: string) => {
        setPersistedMasterKeyState(key);
    };
    return (
        <UserContext.Provider value={{ user, loading, publicKey: publicKey?.toString() || null, wallet, updateUser, persistedMasterKey, setPersistedMasterKey }}>
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
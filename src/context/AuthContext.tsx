'use client'
import React, { createContext, useContext, useState, useEffect, useRef, useMemo } from 'react';
import { useWallet } from '@solana/wallet-adapter-react';
import axios, { AxiosError } from 'axios';
import { toast } from 'react-toastify';
import { setupAxiosInterceptors } from '@/interseptor';

interface AuthContextType {
    loading: boolean;
    walletAddress: string | null;
    wallet: any;
    generateMasterKey: Function;
    persistedMasterKey: string | null;
    setPersistedMasterKey: (key: string) => void;
    hasMasterKey: boolean;
}

function downloadMasterKey(masterKey: string, walletAddress: string) {
    const element = document.createElement('a');
    const file = new Blob([masterKey], { type: 'text/plain' });
    element.href = URL.createObjectURL(file);
    element.download = `${walletAddress}-masterkey.txt`;
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const { publicKey: publicKeyFromWallet, wallet } = useWallet();
    const [loading, setLoading] = useState<boolean>(false);
    const isFetching = useRef(false);
    const [persistedMasterKey, setPersistedMasterKeyState] = useState<string | null>(null);
    const [hasMasterKey, setHasMasterKeyState] = useState<boolean>(false);

    const findOrAddUser = async (walletAddress: string) => {
        try {
            const response = await axios.post("/api/user", { walletAddress });
            if (response.data) {
                setHasMasterKeyState(response.data.data.hasMasterKey);
                setupAxiosInterceptors(response.data.data.token);
            }
        } catch (error) {
            console.error("Failed to upsert user:", error);
            toast.error((error as AxiosError).response?.data?.error)
        }
    };

    useEffect(() => {
        const walletAddress = publicKeyFromWallet?.toString();
        if (walletAddress && !isFetching.current) {
            isFetching.current = true;
            setLoading(true);
            findOrAddUser(walletAddress).finally(() => {
                setLoading(false);
                isFetching.current = false;
            });
        } else {
            setPersistedMasterKeyState(null);
        }
    }, [publicKeyFromWallet]);

    const generateMasterKey = async (passphrase: string) => {
        setLoading(true);
        try {
            const response = await axios.put(`/api/user`, {
                walletAddress: publicKeyFromWallet?.toString(),
                passphrase
            });
            if (response.data?.data?.masterkey) {
                await navigator.clipboard.writeText(response.data.data.masterkey);
                toast.success('Master key copied to clipboard and downloaded');
                downloadMasterKey(response.data.data.masterkey, publicKeyFromWallet?.toString());
                setHasMasterKeyState(true);
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

    const contextValue = useMemo(() => ({
        loading,
        walletAddress: publicKeyFromWallet?.toString() || null,
        wallet,
        generateMasterKey,
        persistedMasterKey,
        setPersistedMasterKey,
        hasMasterKey
    }), [loading, publicKeyFromWallet, wallet, persistedMasterKey, hasMasterKey]);

    return (
        <AuthContext.Provider value={contextValue}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuthContext = () => {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuthContext must be used within an AuthProvider');
    }
    return context;
};
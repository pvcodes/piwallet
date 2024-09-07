'use client'
import React, { use, useEffect, useState } from "react";
import Bars from "../components/ui/Bars";
import { redirect } from 'next/navigation'
import { DASHBOARD_TAB } from "@/utils/enums";
import PasswordManager from '@/app/components/ui/PasswordManager'
import DocumentManager from '@/app/components/ui/DocumentManager'
import MediaManager from '@/app/components/ui/MediaManager'
import { useConnection, useWallet } from "@solana/wallet-adapter-react";
import WalletButton from "../components/ui/WalletButton";
import useUser from "@/hook/useUser";
import { FaSpinner } from 'react-icons/fa'; // Import the icon
import { useAuthContext } from "@/context/AuthContext";


export default function DashboardPage({
    params,
    searchParams,
}: {
    params: { slug: string };
    searchParams?: { [key: string]: string | string[] | undefined };
}) {
    const { walletAddress, loading } = useAuthContext();
    const tab = searchParams?.tab as (keyof typeof DASHBOARD_TAB) | undefined;
    if (!tab) return redirect(`?tab=${DASHBOARD_TAB.PASSWORD}`);

    let ActiveManager;

    // Determine which component to render based on the tab value
    switch (tab) {
        case DASHBOARD_TAB.PASSWORD:
            ActiveManager = PasswordManager;
            break;
        case DASHBOARD_TAB.DOCUMENT:
            ActiveManager = DocumentManager;
            break;
        case DASHBOARD_TAB.MEDIA:
            ActiveManager = MediaManager;
            break;
        default:
            ActiveManager = PasswordManager; // Fallback component
    }

    return (
        loading ?
            <div className="flex flex-col items-center justify-center h-screen">
                <p className="text-lg font-semibold mb-4 flex items-center">
                    <FaSpinner className="animate-spin mr-2" /> Loading...
                </p>
                {/* Add your loading skeleton component here if you have one */}
            </div>
            :
            walletAddress ?
                <div className="mt-5 h-full w-full">
                    <div className="flex lg:hidden items-center justify-center mb-4">
                        <Bars />
                    </div>
                    <div className="flex flex-col items-center shadow-lg rounded-lg p-6 h-full w-full">
                        <ActiveManager />
                    </div>
                </div>
                :
                <div className="flex flex-col items-center justify-center h-screen">
                    <p className="text-lg font-semibold mb-4">Connect your wallet first.</p>
                    <WalletButton />
                </div>
    );
}
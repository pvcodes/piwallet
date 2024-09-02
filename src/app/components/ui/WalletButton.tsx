'use client'
import { cn } from "@/utils/helper";
import { useConnection, useWallet } from "@solana/wallet-adapter-react";
import { WalletMultiButton } from "@solana/wallet-adapter-react-ui";


export default function WalletButton({ className }: { className?: string }) {
    return (
        <WalletMultiButton className={cn("p-1", className)} style={{ padding: 0, paddingLeft: 8, paddingRight: 8, fontSize: "small" }} />
    );
}
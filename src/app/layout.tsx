import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Navbar from '@/app/components/Navbar';
import AppWalletProvider from "./components/AppWalletProvider";
import { cn } from "@/utils/helper";
import { AuthProvider } from "@/context/AuthContext";
import 'react-toastify/dist/ReactToastify.css'
const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "PiWallet - A NextGen dApp",
  description: "Securely manage your passwords, documents, and media with PiWallet. Your ultimate solution for digital security, now and in the future.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={cn("h-full w-full m-auto md:w-3/4 lg:w-3/4", inter.className)} data-theme="cupcake">
      <body className="flex flex-col h-full">
        <AppWalletProvider>
          <AuthProvider>
            <Navbar />
            <main className="flex-1">
              {children}
            </main>
          </AuthProvider>
        </AppWalletProvider>
      </body>
    </html>
  );
}

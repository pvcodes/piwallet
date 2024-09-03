import React from 'react';
import WalletButton from './components/ui/WalletButton';

const Homepage = () => {
  return (
    <div className="flex flex-col items-center justify-between min-h-screen bg-gradient-to-r from-blue-500 to-purple-600 text-white">
      <header className="w-full py-4 bg-opacity-75 bg-black">
        <h1 className="text-3xl font-bold text-center">PiWallet</h1>
      </header>
      <main className="flex-1 flex flex-col items-center justify-center px-6 text-center">
        <h2 className="text-4xl md:text-5xl font-bold mb-6">Next Gen Vault</h2>
        <p className="text-md md:text-lg mb-8 max-w-xl">
          Securely manage your passwords, documents, and media with PiWallet.
          Your ultimate solution for digital security, now and in the future.
        </p>
        <WalletButton />
        <div className="mt-12">
          <h3 className="text-2xl font-semibold">Why PiWallet?</h3>
          <ul className="text-md md:text-lg mt-4 space-y-2">
            <li>🔒 End-to-end encrypted storage</li>
            <li>🗝️ Access your vault with your wallet</li>
            <li>📁 Securely store documents and media</li>
            <li>🌐 Access from anywhere</li>
          </ul>
        </div>
      </main>
      <footer className="w-full py-3 bg-opacity-75 bg-black text-center">
        <p>&copy; 2024 PiWallet. All rights reserved.</p>
      </footer>
    </div>
  );
};

export default Homepage;

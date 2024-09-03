import React from 'react';

const WhatsNext = () => {
    return (
        <div className="p-8 space-y-12">
            <h1 className="text-3xl font-extrabold tracking-tight">What's Next</h1>

            <section>
                <h2 className="text-2xl font-semibold mb-4 border-b pb-2">What is Live</h2>
                <ul className="list-disc pl-6 space-y-2">
                    <li>Wallet connection and authorization via wallet.</li>
                    <li>End-to-end encrypted password management mechanism.</li>
                    <li>Real-time synchronization of credentials across devices.</li>
                    <li>Secure key management and storage.</li>
                </ul>
            </section>

            <section>
                <h2 className="text-2xl font-semibold mb-4 border-b pb-2">What is Under Development</h2>
                <ul className="list-disc pl-6 space-y-2">
                    <li>UI/UX enhancements for a more intuitive user experience.</li>
                    <li>Wallet sign transaction for added security and authenticity.</li>
                    <li>Document vault for storing sensitive files.</li>
                    <li>Integration with third-party services for seamless data import/export.</li>
                    <li>JWT authorization</li>
                </ul>
            </section>

            <section>
                <h2 className="text-2xl font-semibold mb-4 border-b pb-2">What is to be Developed</h2>
                <ul className="list-disc pl-6 space-y-2">
                    <li>IPFS integration and a Solana program to replace the existing database with blockchain-based storage.</li>
                    <li>Support for multimedia files within the vault.</li>
                    <li>Advanced analytics and reporting for usage insights.</li>
                    <li>Cross-platform compatibility to support more devices and operating systems.</li>
                </ul>
            </section>
        </div>
    );
};

export default WhatsNext;

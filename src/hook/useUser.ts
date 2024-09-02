"use client";
import { useEffect, useState } from "react";
import { useWallet } from "@solana/wallet-adapter-react";
import { User } from "@prisma/client";
import axios from "axios";

const useUser = () => {
	const { publicKey : userPublicKey, wallet } = useWallet();
	const [user, setUser] = useState<User | null>(null);
	const [loading, setLoading] = useState<boolean>(false);

	useEffect(() => {
		const findOrAddUser = async () => {
			console.log(userPublicKey, "userPublicKey");
			if (userPublicKey) {
				setLoading(true);
				try {
					const walletAddress = userPublicKey.toString();
					console.log(
						"Sending request to API with wallet address:",
						walletAddress
					);
					const response = await axios.post("/api/user", {
						walletAddress,
					});
					console.log("API response:", response.data.data);

					if (response.data) {
						setUser(response.data.data); // Make sure this matches the actual structure of your API response
					} else {
						console.warn("API response does not contain data.");
					}
				} catch (error) {
					console.error("Failed to upsert user:", error);
				} finally {
					setLoading(false);
				}
			} else {
				setUser(null);
			}
		};

		findOrAddUser();
	}, [userPublicKey]); // Ensure only necessary dependencies are included
	return { user, loading, userPublicKey, wallet };
};

export default useUser;

/** @type {import('next').NextConfig} */
const nextConfig = {
	reactStrictMode: false,
	// for hackathon submission
	eslint: {
		ignoreDuringBuilds: true,
	},
	typescript: {
		ignoreBuildErrors: true,
	},
};

export default nextConfig;

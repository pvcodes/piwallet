// components/BlurredContainer.js

import { FaRegEyeSlash } from 'react-icons/fa'; // Import an icon of your choice

const BlurredContainer = ({ children }) => {
    return (
        <div className="relative w-full h-screen overflow-hidden">
            {/* Background with blur effect */}
            <div className="absolute inset-0 blur-background opacity-20 backdrop-blur-md"></div>

            {/* Centered icon */}
            <div className="absolute inset-0 flex flex-col items-center justify-center">
                {children}
                <FaRegEyeSlash className="text-white text-6xl" /> {/* Adjust text color based on your theme */}
            </div>
        </div>
    );
};

export default BlurredContainer;

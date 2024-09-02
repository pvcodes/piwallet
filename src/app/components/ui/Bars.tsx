import { useRouter } from 'next/navigation';
import React, { useState, useEffect } from 'react'
import { useSearchParams } from 'next/navigation'
import { DASHBOARD_TAB } from '@/utils/enums';


const Bars = () => {
    const router = useRouter()
    const searchParams = useSearchParams()
    const [activeTab, setActiveTab] = useState(DASHBOARD_TAB.PASSWORD); // Default value

    useEffect(() => {
        const tab = searchParams.get('tab');
        if (tab) {
            setActiveTab(tab);
        }
    }, [searchParams]);

    return (
        <div role="tablist" className="tabs tabs-boxed flex items-center lg:flex-row sm:w-auto">
            {Object.values(DASHBOARD_TAB).map(tab => (
                <button
                    key={tab}
                    role="tab"
                    className={`tab ${activeTab === tab ? 'tab-active transition-all duration-300' : ''} ease-in-out`}
                    onClick={() => {
                        setActiveTab(tab)
                        router.push(`/dashboard?tab=${tab}`)
                    }}
                >
                    {tab.charAt(0).toUpperCase() + tab.slice(1)}
                </button>
            ))}
        </div>
    )
}

export default Bars
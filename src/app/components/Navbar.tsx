'use client'
import Link from 'next/link'
import React, { useEffect } from 'react'
import WalletButton from './ui/WalletButton'
import { useConnection, useWallet } from '@solana/wallet-adapter-react'
import { RxHamburgerMenu } from "react-icons/rx";
import Bars from './ui/Bars'
import next from 'next'
import { useRouter } from 'next/navigation'



const Navbar = () => {

    const { connection } = useConnection();
    const { publicKey } = useWallet();
    const router = useRouter()


    useEffect(() => {
        if (publicKey) router.push('/dashboard')
    }, [publicKey, router])

    return (
        <>
            <div className="navbar bg-base-1 flex items-center">
                <div className="dropdown sm:hidden">
                    <button tabIndex={0} role="button" className="btn btn-ghost"><RxHamburgerMenu className='w-max' /></button>
                    <ul tabIndex={0} className="dropdown-content menu bg-base-100 rounded-box z-[1] w-52 p-2 shadow">
                        <li><Link href={'/'}>About</Link></li>
                        <li><Link href={'https://github.com/pvcodes/piwallet'} target='_blank'>Contribute</Link></li>
                    </ul>
                </div>

                <div className="navbar-start flex">
                    <Link className="btn btn-ghost text-xl" href={'/'}>PiWallet</Link>
                </div>
                {
                    (connection && publicKey) ?
                        <div className="navbar-center hidden lg:flex">
                            <Bars />
                        </div>
                        :
                        <div className="navbar-center hidden lg:flex">
                            <ul className="menu menu-horizontal px-1">
                                <li><Link href={'/'}>About</Link></li>
                                <li><Link href={'https://github.com/pvcodes/piwallet'} target='_blank'>Contribute</Link></li>
                            </ul>
                        </div>



                }
                <div className="navbar-end">
                    <WalletButton />
                </div>
            </div>
            <div className="divider mt-0"></div>
        </>)
}

export default Navbar



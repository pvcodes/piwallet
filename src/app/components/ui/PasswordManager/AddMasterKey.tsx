import { useUserContext } from '@/context/UserContext'
import useUser from '@/hook/useUser'
import axios from 'axios'
import { useRouter } from 'next/navigation'
import React, { useState } from 'react'

const AddMasterKey = () => {
    const { publicKey, updateUser } = useUserContext()
    const router = useRouter()
    const [passphrase, setPassphrase] = useState('')

    const handleAddPassphrase = (e) => {
        e.preventDefault()
        const addPassphrase = async () => {
            try {
                await updateUser({ passphrase })
            } catch (error) {
                console.log(error, 'add master key')
            }


        }
        addPassphrase()
    }

    return (
        <div className="mt-5 w-full flex flex-col items-center justify-center">
            <form className="rounded-lg w-full max-w-sm ">
                <label className="block mb-4 w-full">
                    <p className="mt-2 font-bold text-center w-full">Create your master key to add your secrets.</p>
                    <input
                        type="password"
                        name="masterKey"
                        placeholder='Enter passphrase'
                        className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        onChange={(e) => {
                            setPassphrase(e.target.value)
                        }}
                    />
                </label>
                <button
                    type="submit"
                    className="btn btn-outline w-full py-2 px-4"
                    onClick={handleAddPassphrase}
                >
                    Add
                </button>
                <p className="text-sm text-gray-500 text-center mt-1">We do not store your passphrase</p>
            </form>
        </div>
    )
}

export default AddMasterKey
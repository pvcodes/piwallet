'use client'
import React, { useState, useEffect, useCallback, useMemo } from 'react'
import { FaEdit, FaTrash } from 'react-icons/fa'
import AddMasterKey from './AddMasterKey';
import { useUserContext } from '@/context/UserContext';
import axios from 'axios';
import { decrypt, encrypt } from '@/utils/encryption';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const PasswordManager = () => {
  const { user, publicKey } = useUserContext();
  const [credentials, setCredentials] = useState([]);
  const [selectedCredential, setSelectedCredential] = useState(null);
  const [masterKey, setMasterKey] = useState('');
  const [isUnlocked, setIsUnlocked] = useState(false);
  const [credential, setCredential] = useState({ url: '', username: '', password: '' });

  const handleViewPasswords = useCallback(async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post('/api/user/verify', {
        masterKey,
        walletAddress: user?.walletAddress
      });
      const decryptedCredentials = response.data.data.map(({ id, url, username, password }) => ({
        id,
        url: decrypt(url, masterKey),
        username: decrypt(username, masterKey),
        password: decrypt(password, masterKey)
      }));
      setCredentials(decryptedCredentials);
      setIsUnlocked(true);
      toast.success('Passwords unlocked successfully!');
    } catch (error) {
      console.error('Error verifying master key:', error);
      toast.error('Failed to verify master key.');
    }
  }, [masterKey, user?.walletAddress]);

  const handleAddCredential = useCallback(async (e) => {
    e.preventDefault();
    const encryptedCredential = {
      url: encrypt(credential.url, masterKey),
      username: encrypt(credential.username, masterKey),
      password: encrypt(credential.password, masterKey)
    };
    try {
      const response = await axios.post('/api/credential', {
        walletAddress: publicKey,
        credential: encryptedCredential
      });
      setCredentials((prev) => [...prev, { id: response.data.data.id, ...credential }]);
      setCredential({ url: '', username: '', password: '' });
      toast.success('Credential added successfully!');
    } catch (error) {
      console.error('Error saving credential:', error);
      toast.error('Failed to add credential.');
    }
  }, [credential, masterKey, publicKey]);

  const handleUpdateCredential = useCallback(async (e) => {
    e.preventDefault();
    const { url, username, password } = e.target;
    const newCredential = {
      url: url.value,
      username: username.value,
      password: password.value
    };

    const encryptedCredential = {
      url: encrypt(newCredential.url, masterKey),
      username: encrypt(newCredential.username, masterKey),
      password: encrypt(newCredential.password, masterKey)
    };

    try {
      await axios.put('/api/credential', {
        walletAddress: publicKey,
        id: selectedCredential.id,
        credential: encryptedCredential
      });
      setCredentials((prev) => prev.map(cred => cred.id === selectedCredential.id ? { ...cred, ...newCredential } : cred));
      setSelectedCredential(null);
      toast.success('Credential updated successfully!');
    } catch (error) {
      console.error('Error updating credential:', error);
      toast.error('Failed to update credential.');
    }
  }, [selectedCredential, masterKey, publicKey]);

  const handleDeleteCredential = useCallback(async (id) => {
    try {
      await axios.delete('/api/credential', { params: { id, walletAddress: publicKey } });
      setCredentials((prev) => prev.filter(cred => cred.id !== id));
      toast.success('Credential deleted successfully!');
    } catch (error) {
      console.error('Error deleting credential:', error);
      toast.error('Failed to delete credential.');
    }
  }, [publicKey]);

  return (
    <div className="p-4 w-full rounded-xl space-y-4">
      <ToastContainer position="bottom-left" />
      {!user?.salt && <AddMasterKey />}
      {user?.salt && !isUnlocked && (
        <form className="space-y-4" onSubmit={handleViewPasswords}>
          <input
            name="masterKey"
            type="password"
            placeholder="Enter Master Key"
            className="w-full p-3 border border-gray-300 rounded-md"
            onChange={(e) => setMasterKey(e.target.value)}
          />
          <button type="submit" className="btn btn-outline w-full p-3 rounded-md">
            View all passwords
          </button>
        </form>
      )}
      {isUnlocked && (
        <>
          <form className="space-y-4" onSubmit={handleAddCredential}>
            <input
              name="url"
              placeholder="URL"
              className="w-full p-3 border border-gray-300 rounded-md"
              value={credential.url}
              onChange={(e) => setCredential({ ...credential, url: e.target.value })}
            />
            <input
              name="username"
              placeholder="Username or Email"
              className="w-full p-3 border border-gray-300 rounded-md"
              value={credential.username}
              onChange={(e) => setCredential({ ...credential, username: e.target.value })}
            />
            <input
              name="password"
              type="password"
              placeholder="Password"
              className="w-full p-3 border border-gray-300 rounded-md"
              value={credential.password}
              onChange={(e) => setCredential({ ...credential, password: e.target.value })}
            />
            <button type="submit" className="btn btn-outline  w-full p-3 rounded-md">Add Credential</button>
          </form>
          <div className="space-y-4">
            {credentials.map(credential => (
              <div key={credential.id} className="flex flex-col sm:flex-row justify-between items-start sm:items-center p-4 border border-gray-300 rounded-md">
                <div className="flex-1 space-y-1">
                  <span className="block font-bold">{credential.url}</span>
                  <span className="block">{credential.username}</span>
                  <span className="block">{credential.password}</span>
                </div>
                <div className="flex space-x-2 mt-2 sm:mt-0">
                  <button
                    onClick={() => setSelectedCredential(credential)}
                    className="p-2 rounded-md"
                  >
                    <FaEdit />
                  </button>
                  <button
                    onClick={() => handleDeleteCredential(credential.id)}
                    className="p-2 rounded-md"
                  >
                    <FaTrash />
                  </button>
                </div>
              </div>
            ))}
          </div>
          {selectedCredential && (
            <form className="space-y-4" onSubmit={handleUpdateCredential}>
              <input
                name="url"
                defaultValue={selectedCredential.url}
                className="w-full p-3 border border-gray-300 rounded-md"
              />
              <input
                name="username"
                defaultValue={selectedCredential.username}
                className="w-full p-3 border border-gray-300 rounded-md"
              />
              <input
                name="password"
                type="password"
                defaultValue={selectedCredential.password}
                className="w-full p-3 border border-gray-300 rounded-md"
              />
              <button type="submit" className="btn btn-outline w-full p-3 rounded-md">Save</button>
            </form>
          )}
        </>
      )}
    </div>
  );
};

export default PasswordManager;
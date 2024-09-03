'use client'
import React, { useState, useEffect, useCallback, useMemo, useReducer, FormEvent } from 'react'
import { FaEdit, FaTrash } from 'react-icons/fa'
import AddMasterKey from './AddMasterKey';
import { useUserContext } from '@/context/UserContext';
import axios from 'axios';
import { decrypt, encrypt } from '@/utils/encryption';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

interface Credential {
  id?: string;
  url: string;
  username: string;
  password: string;
}

interface State {
  credentials: Credential[];
  selectedCredential: Credential | null;
  masterKey: string | null;
  isUnlocked: boolean;
  isLoading: boolean;
  credential: Credential;
  hasMasterKeyToPersist: boolean;
}

type Action =
  | { type: 'SET_CREDENTIALS'; payload: Credential[] }
  | { type: 'SET_SELECTED_CREDENTIAL'; payload: Credential | null }
  | { type: 'SET_MASTER_KEY'; payload: string }
  | { type: 'SET_IS_UNLOCKED'; payload: boolean }
  | { type: 'SET_IS_LOADING'; payload: boolean }
  | { type: 'SET_CREDENTIAL'; payload: Credential }
  | { type: 'TOGGLE_HAS_MASTER_KEY_TO_PERSIST' };

const initialState: State = {
  credentials: [],
  selectedCredential: null,
  masterKey: null,
  isUnlocked: false,
  isLoading: false,
  credential: { url: '', username: '', password: '' },
  hasMasterKeyToPersist: true,
};

const reducer = (state: State, action: Action): State => {
  switch (action.type) {
    case 'SET_CREDENTIALS':
      return { ...state, credentials: action.payload };
    case 'SET_SELECTED_CREDENTIAL':
      return { ...state, selectedCredential: action.payload };
    case 'SET_MASTER_KEY':
      return { ...state, masterKey: action.payload };
    case 'SET_IS_UNLOCKED':
      return { ...state, isUnlocked: action.payload };
    case 'SET_IS_LOADING':
      return { ...state, isLoading: action.payload };
    case 'SET_CREDENTIAL':
      return { ...state, credential: action.payload };
    case 'TOGGLE_HAS_MASTER_KEY_TO_PERSIST':
      return { ...state, hasMasterKeyToPersist: !state.hasMasterKeyToPersist };
    default:
      return state;
  }
};

const PasswordManager: React.FC = () => {
  const { user, publicKey, persistedMasterKey, setPersistedMasterKey } = useUserContext();
  const [state, dispatch] = useReducer(reducer, initialState);

  useEffect(() => {
    if (persistedMasterKey && !state.isUnlocked) {
      dispatch({ type: 'SET_MASTER_KEY', payload: persistedMasterKey });
      handleViewPasswords();
    }
  }, [persistedMasterKey]);

  const handleViewPasswords = useCallback(async (e: FormEvent | null = null, masterKey: string | null = persistedMasterKey) => {
    console.log('hvk')
    if (e) e.preventDefault();
    dispatch({ type: 'SET_IS_LOADING', payload: true });
    try {
      console.log(masterKey, 'masterKet')
      if (!masterKey) throw 'Master key is not defined'

      const response = await axios.post('/api/user/verify', {
        masterKey: persistedMasterKey ?? masterKey,
        walletAddress: user?.walletAddress
      });
      const decryptedCredentials = response.data.data.map(({ id, url, username, password }: Credential) => ({
        id,
        url: decrypt(url, masterKey),
        username: decrypt(username, masterKey),
        password: decrypt(password, masterKey)
      }));
      dispatch({ type: 'SET_CREDENTIALS', payload: decryptedCredentials });
      dispatch({ type: 'SET_IS_UNLOCKED', payload: true });
      if (state.hasMasterKeyToPersist) {
        setPersistedMasterKey(masterKey);
      }
      toast.success('Passwords unlocked successfully!');
    } catch (error) {
      console.error('Error verifying master key:', error);
      toast.error('Failed to verify master key.');
    } finally {
      dispatch({ type: 'SET_IS_LOADING', payload: false });
    }
  }, [persistedMasterKey, user?.walletAddress, state.hasMasterKeyToPersist, setPersistedMasterKey]);

  const handleAddCredential = useCallback(async (e: FormEvent) => {
    e.preventDefault();
    const encryptedCredential = {
      url: encrypt(state.credential.url, state.masterKey),
      username: encrypt(state.credential.username, state.masterKey),
      password: encrypt(state.credential.password, state.masterKey)
    };
    try {
      const response = await axios.post('/api/credential', {
        walletAddress: publicKey,
        credential: encryptedCredential
      });
      dispatch({ type: 'SET_CREDENTIALS', payload: [...state.credentials, { id: response.data.data.id, ...state.credential }] });
      dispatch({ type: 'SET_CREDENTIAL', payload: { url: '', username: '', password: '' } });
      toast.success('Credential added successfully!');
    } catch (error) {
      console.error('Error saving credential:', error);
      toast.error('Failed to add credential.');
    }
  }, [state.credential, state.masterKey, publicKey, state.credentials]);

  const handleUpdateCredential = useCallback(async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const { url, username, password } = e.target as typeof e.target & {
      url: { value: string };
      username: { value: string };
      password: { value: string };
    };
    const newCredential = {
      url: url.value,
      username: username.value,
      password: password.value
    };

    const encryptedCredential = {
      url: encrypt(newCredential.url, state.masterKey),
      username: encrypt(newCredential.username, state.masterKey),
      password: encrypt(newCredential.password, state.masterKey)
    };

    try {
      await axios.put('/api/credential', {
        walletAddress: publicKey,
        id: state.selectedCredential?.id,
        credential: encryptedCredential
      });
      dispatch({ type: 'SET_CREDENTIALS', payload: state.credentials.map(cred => cred.id === state.selectedCredential?.id ? { ...cred, ...newCredential } : cred) });
      dispatch({ type: 'SET_SELECTED_CREDENTIAL', payload: null });
      toast.success('Credential updated successfully!');
    } catch (error) {
      console.error('Error updating credential:', error);
      toast.error('Failed to update credential.');
    }
  }, [state.selectedCredential, state.masterKey, publicKey]);

  const handleDeleteCredential = useCallback(async (id: string) => {
    try {
      await axios.delete('/api/credential', { params: { id, walletAddress: publicKey } });
      dispatch({ type: 'SET_CREDENTIALS', payload: state.credentials.filter(cred => cred.id !== id) });
      toast.success('Credential deleted successfully!');
    } catch (error) {
      console.error('Error deleting credential:', error);
      toast.error('Failed to delete credential.');
    }
  }, [publicKey, state.credentials]);

  const memoizedCredentials = useMemo(() => state.credentials.map(credential => (
    <div key={credential.id} className="flex flex-col sm:flex-row justify-between items-start sm:items-center p-4 border border-gray-300 rounded-md">
      <div className="flex-1 space-y-1">
        <span className="block font-bold">{credential.url}</span>
        <span className="block">{credential.username}</span>
        <span className="block">{credential.password}</span>
      </div>
      <div className="flex space-x-2 mt-2 sm:mt-0">
        <button
          onClick={() => dispatch({ type: 'SET_SELECTED_CREDENTIAL', payload: credential })}
          className="p-2 rounded-md"
        >
          <FaEdit />
        </button>
        <button
          onClick={() => handleDeleteCredential(credential.id!)}
          className="p-2 rounded-md"
        >
          <FaTrash />
        </button>
      </div>
    </div>
  )), [state.credentials, handleDeleteCredential]);

  return (
    <div className="p-4 w-full rounded-xl space-y-4 lg:w-4/5">
      <ToastContainer position="bottom-left" />

      {!user?.salt && <AddMasterKey />}
      {user?.salt && !state.isUnlocked && !state.isLoading && (
        <>
          <div className='flex justify-end items-end'>
            <h4 className='pr-2 text-sm'>Persist the master key for this session</h4>
            <input
              type="checkbox"
              className="toggle"
              defaultChecked={state.hasMasterKeyToPersist}
              onClick={() => dispatch({ type: 'TOGGLE_HAS_MASTER_KEY_TO_PERSIST' })} />
          </div>
          <form className="space-y-4" onSubmit={(e) => handleViewPasswords(e, state.masterKey)}>
            <input
              name="masterKey"
              type="password"
              placeholder="Enter Master Key"
              className="w-full p-3 border border-gray-300 rounded-md"
              onChange={(e) => dispatch({ type: 'SET_MASTER_KEY', payload: e.target.value })}
            />
            <button type="submit" className="btn btn-outline w-full p-3 rounded-md">
              View all passwords
            </button>
          </form>
        </>
      )}
      {state.isLoading && <div>Loading...</div>}
      {state.isUnlocked && !state.isLoading && (
        <>
          <form className="space-y-4" onSubmit={handleAddCredential}>
            <input
              name="url"
              placeholder="URL"
              className="w-full p-3 border border-gray-300 rounded-md"
              value={state.credential.url}
              onChange={(e) => dispatch({ type: 'SET_CREDENTIAL', payload: { ...state.credential, url: e.target.value } })}
            />
            <input
              name="username"
              placeholder="Username or Email"
              className="w-full p-3 border border-gray-300 rounded-md"
              value={state.credential.username}
              onChange={(e) => dispatch({ type: 'SET_CREDENTIAL', payload: { ...state.credential, username: e.target.value } })}
            />
            <input
              name="password"
              type="password"
              placeholder="Password"
              className="w-full p-3 border border-gray-300 rounded-md"
              value={state.credential.password}
              onChange={(e) => dispatch({ type: 'SET_CREDENTIAL', payload: { ...state.credential, password: e.target.value } })}
            />
            <button type="submit" className="btn btn-outline  w-full p-3 rounded-md">Add Credential</button>
          </form>
          <div className="space-y-4">
            {memoizedCredentials}
          </div>
          {state.selectedCredential && (
            <form className="space-y-4" onSubmit={handleUpdateCredential}>
              <input
                name="url"
                defaultValue={state.selectedCredential.url}
                className="w-full p-3 border border-gray-300 rounded-md"
              />
              <input
                name="username"
                defaultValue={state.selectedCredential.username}
                className="w-full p-3 border border-gray-300 rounded-md"
              />
              <input
                name="password"
                type="password"
                defaultValue={state.selectedCredential.password}
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
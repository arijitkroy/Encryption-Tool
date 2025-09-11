'use client';
import { useEffect, useState } from "react";
import Image from "next/image";
import { encryptData, decryptData, encryptFile, decryptFile, generateKeyString } from "../utilities/encryption.js";

export default function Home() {
  const [encryptTextInput, setEncryptTextInput] = useState("");
  const [decryptTextInput, setDecryptTextInput] = useState("");
  const [encryptFileState, setEncryptFileState] = useState(null);
  const [encryptionKey, setEncryptionKey] = useState("");
  const [encryptedOutput, setEncryptedOutput] = useState("");
  const [encryptedTextUrl, setEncryptedTextUrl] = useState(null);
  const [decryptedOutput, setDecryptedOutput] = useState("");
  const [decryptedFileUrl, setDecryptedFileUrl] = useState(null);
  const [decryptedFileMeta, setDecryptedFileMeta] = useState({ name: "decrypted-file", type: "" });
  const [copied, setCopied] = useState(false);
  const [copiedEncrypted, setCopiedEncrypted] = useState(false);
  const [copiedDecrypted, setCopiedDecrypted] = useState(false);

  useEffect(() => {
    // Auto-generate a key on first load
    const key = generateKeyString();
    setEncryptionKey(key);
  }, []);

  useEffect(() => {
    // Maintain a blob URL for downloading encrypted text
    let url;
    if (encryptedOutput && encryptedOutput.length > 0) {
      const blob = new Blob([encryptedOutput], { type: 'text/plain' });
      url = URL.createObjectURL(blob);
      setEncryptedTextUrl(url);
    } else {
      setEncryptedTextUrl(null);
    }
    // Cleanup previous URL on change/unmount
    return () => {
      if (url) URL.revokeObjectURL(url);
    };
  }, [encryptedOutput]);

  const handleGenerateKey = () => {
    const key = generateKeyString();
    setEncryptionKey(key);
    setCopied(false);
  };

  const handleCopyKey = async () => {
    try {
      await navigator.clipboard.writeText(encryptionKey);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch (e) {
      console.error('Copy failed', e);
    }
  };

  const handleCopyEncrypted = async () => {
    try {
      if (!encryptedOutput) return;
      await navigator.clipboard.writeText(encryptedOutput);
      setCopiedEncrypted(true);
      setTimeout(() => setCopiedEncrypted(false), 1500);
    } catch (e) {
      console.error('Copy encrypted output failed', e);
    }
  };

  const handleCopyDecrypted = async () => {
    try {
      if (!decryptedOutput) return;
      await navigator.clipboard.writeText(decryptedOutput);
      setCopiedDecrypted(true);
      setTimeout(() => setCopiedDecrypted(false), 1500);
    } catch (e) {
      console.error('Copy decrypted output failed', e);
    }
  };

  const handleEncrypt = async () => {
    if (!encryptionKey) return;
    try {
      if (encryptFileState) {
        const { iv, encryptedData, name, type } = await encryptFile(encryptFileState, encryptionKey);
        setEncryptedOutput(JSON.stringify({ iv, encryptedData, name, type }));
        return;
      }
      if (encryptTextInput.trim().length > 0) {
        const { iv, encryptedData } = await encryptData(encryptTextInput, encryptionKey);
        setEncryptedOutput(JSON.stringify({ iv, encryptedData }));
        return;
      }
      setEncryptedOutput("Nothing to encrypt. Provide text or choose a file.");
    } catch (error) {
      console.error("Encryption failed:", error);
      setEncryptedOutput("Encryption failed.");
    }
  };

  const handleDecrypt = async () => {
    if (!encryptionKey) return;
    try {
      if (decryptFileState) {
        const { iv, encryptedData, name, type } = JSON.parse(await decryptFileState.text());
        const decryptedBlob = await decryptFile(encryptedData, iv, encryptionKey, type);
        const url = URL.createObjectURL(decryptedBlob);
        setDecryptedFileUrl(url);
        setDecryptedFileMeta({ name: name || 'decrypted-file', type: type || '' });
        setDecryptedOutput("File decrypted. Preview or download below.");
        return;
      }
      if (decryptTextInput.trim().length > 0) {
        const { iv, encryptedData, name, type } = JSON.parse(decryptTextInput);
        if (Array.isArray(encryptedData) && Array.isArray(iv)) {
          const decryptedBlob = await decryptFile(encryptedData, iv, encryptionKey, type);
          const url = URL.createObjectURL(decryptedBlob);
          setDecryptedFileUrl(url);
          setDecryptedFileMeta({ name: name || 'decrypted-file', type: type || '' });
          setDecryptedOutput("File decrypted. Preview or download below.");
        } else {
          const decryptedText = await decryptData(encryptedData, iv, encryptionKey);
          setDecryptedOutput(decryptedText);
          setDecryptedFileUrl(null);
          setDecryptedFileMeta({ name: 'decrypted-file', type: '' });
        }
        return;
      }
      setDecryptedOutput("Nothing to decrypt. Paste JSON or choose a file.");
    } catch (error) {
      console.error("Decryption failed:", error);
      setDecryptedOutput("Decryption failed.");
      setDecryptedFileUrl(null);
    }
  };

  const handleUploadEncryptedTxt = async (file) => {
    if (!file) return;
    try {
      const content = await file.text();
      setDecryptTextInput(content);
    } catch (e) {
      console.error('Failed to read encrypted .txt', e);
    }
  };

  return (
    <main className="flex min-h-screen flex-col items-center justify-between p-24">
      <h1 className="text-5xl font-bold text-center mb-10">Encryption Tool</h1>

      <div className="z-10 w-full max-w-5xl items-center justify-between font-mono text-sm lg:flex">
        <div className="w-full px-4">
          <p className="w-full text-center border border-gray-300 rounded-xl bg-gray-200 dark:border-neutral-800 dark:bg-zinc-800/30 py-3">
            Get started by encrypting your data.
          </p>
        </div>
      </div>

      <div className="w-full max-w-5xl text-center text-red-500 mb-8">
        <p>
          <strong>Security Warning:</strong> For demonstration purposes, the encryption key is entered directly.
          In a real application, keys should be managed securely (e.g., via a secure backend or robust key management system).
          Client-side storage of keys (e.g., in localStorage) provides limited security.
        </p>
      </div>

      <div className="mb-6 w-full max-w-5xl">
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-200">Encryption Key</label>
        <div className="mt-2 flex gap-2">
          <input
            type="text"
            className="flex-1 h-10 p-2 border border-gray-300 rounded-md dark:bg-neutral-900 dark:text-white"
            placeholder="Encryption key"
            value={encryptionKey}
            onChange={(e) => setEncryptionKey(e.target.value)}
          />
          <button
            className="px-3 py-2 rounded-md bg-slate-600 text-white hover:bg-slate-700"
            onClick={handleGenerateKey}
          >
            Generate
          </button>
          <button
            className="px-3 py-2 rounded-md bg-slate-600 text-white hover:bg-slate-700"
            onClick={handleCopyKey}
          >
            {copied ? 'Copied' : 'Copy'}
          </button>
        </div>
      </div>

      <div className="mb-32 grid text-center lg:mb-0 lg:w-full lg:max-w-5xl lg:grid-cols-2 lg:text-left">
        {/* Encryption Section */}
        <div className="group rounded-lg border border-transparent px-5 py-4 transition-colors hover:border-gray-300 hover:bg-gray-100 hover:dark:border-neutral-700 hover:dark:bg-neutral-800/30">
          <h2 className="mb-3 text-2xl font-semibold">
            Encrypt <span className="inline-block transition-transform group-hover:translate-x-1 motion-reduce:transform-none">-&gt;</span>
          </h2>
          <p className="m-0 max-w-[30ch] text-sm opacity-50 text-left">
            Encrypt your text or files into a secure code.
          </p>
          {/* Encryption Input and Button will go here */}
          <textarea
            className="mt-4 w-full h-32 p-2 border border-gray-300 rounded-md dark:bg-neutral-900 dark:text-white"
            placeholder="Enter text to encrypt..."
            value={encryptTextInput}
            onChange={(e) => setEncryptTextInput(e.target.value)}
          ></textarea>
          <input
            type="file"
            className="mt-4 w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 dark:file:bg-blue-900 dark:file:text-blue-50"
            onChange={(e) => setEncryptFileState(e.target.files ? e.target.files[0] : null)}
          />
          <button 
            className="mt-4 w-full bg-blue-500 text-white py-2 rounded-md hover:bg-blue-600"
            onClick={handleEncrypt}
          >
            Encrypt
          </button>
          {encryptedOutput && (
            <div className="mt-4 p-2 border border-gray-300 rounded-md dark:bg-neutral-800 dark:text-white break-all h-32 overflow-y-auto">
              <div className="flex items-center justify-between gap-2 mb-2">
                <strong>Encrypted Output:</strong>
                <div className="flex items-center gap-2">
                  <button
                    className="px-2 py-1 rounded-md bg-slate-600 text-white hover:bg-slate-700 text-xs"
                    onClick={handleCopyEncrypted}
                  >
                    {copiedEncrypted ? 'Copied' : 'Copy'}
                  </button>
                  {encryptedTextUrl && (
                    <a
                      href={encryptedTextUrl}
                      download={`encrypted-${Date.now()}.txt`}
                      className="px-2 py-1 rounded-md bg-slate-600 text-white hover:bg-slate-700 text-xs"
                    >
                      Download .txt
                    </a>
                  )}
                </div>
              </div>
              {encryptedOutput}
            </div>
          )}
        </div>

        {/* Decryption Section */}
        <div className="group rounded-lg border border-transparent px-5 py-4 transition-colors hover:border-gray-300 hover:bg-gray-100 hover:dark:border-neutral-700 hover:dark:bg-neutral-800/30">
          <h2 className="mb-3 text-2xl font-semibold">
            Decrypt <span className="inline-block transition-transform group-hover:translate-x-1 motion-reduce:transform-none">-&gt;</span>
          </h2>
          <p className="m-0 max-w-[30ch] text-sm opacity-50 text-left">
            Decrypt your secure code to retrieve the original content.
          </p>
          {/* Decryption Input and Button will go here */}
          <textarea
            className="mt-4 w-full h-32 p-2 border border-gray-300 rounded-md dark:bg-neutral-900 dark:text-white"
            placeholder="Enter code to decrypt..."
            value={decryptTextInput}
            onChange={(e) => setDecryptTextInput(e.target.value)}
          ></textarea>
          <div className="mt-2 text-xs opacity-70">Or upload a .txt that contains the encrypted JSON</div>
          <input
            type="file"
            accept=".txt,text/plain"
            className="mt-2 w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-green-50 file:text-green-700 hover:file:bg-green-100 dark:file:bg-green-900 dark:file:text-green-50"
            onChange={(e) => handleUploadEncryptedTxt(e.target.files ? e.target.files[0] : null)}
          />
          <button 
            className="mt-4 w-full bg-green-500 text-white py-2 rounded-md hover:bg-green-600"
            onClick={handleDecrypt}
          >
            Decrypt
          </button>
          {decryptedOutput && (
            <div className="mt-4 p-2 border border-gray-300 rounded-md dark:bg-neutral-800 dark:text-white break-all h-32 overflow-y-auto">
              <div className="flex items-center justify-between gap-2 mb-2">
                <strong>Decrypted Output:</strong>
                <button
                  className="px-2 py-1 rounded-md bg-slate-600 text-white hover:bg-slate-700 text-xs"
                  onClick={handleCopyDecrypted}
                >
                  {copiedDecrypted ? 'Copied' : 'Copy'}
                </button>
              </div>
              {decryptedOutput}
            </div>
          )}
          {decryptedFileUrl && (
            <div className="mt-4 p-2 border border-gray-300 rounded-md dark:bg-neutral-800 text-white">
              <div className="mb-2 text-sm opacity-80">{decryptedFileMeta.name} ({decryptedFileMeta.type || 'unknown type'})</div>
              {decryptedFileMeta.type?.startsWith('image/') && (
                <Image
                  src={decryptedFileUrl}
                  alt="Decrypted preview"
                  width={800}
                  height={600}
                  unoptimized
                  className="max-h-80 rounded object-contain"
                />
              )}
              {decryptedFileMeta.type === 'application/pdf' && (
                <iframe src={decryptedFileUrl} className="w-full h-96 rounded" />
              )}
              {decryptedFileMeta.type?.startsWith('audio/') && (
                <audio controls src={decryptedFileUrl} className="w-full" />
              )}
              {decryptedFileMeta.type?.startsWith('video/') && (
                <video controls src={decryptedFileUrl} className="w-full max-h-96 rounded" />
              )}
              <a
                href={decryptedFileUrl}
                download={decryptedFileMeta.name || 'decrypted-file'}
                className="mt-3 inline-block bg-purple-500 text-white py-2 px-3 rounded-md hover:bg-purple-600"
              >
                Download
              </a>
            </div>
          )}
        </div>
      </div>
    </main>
  );
}

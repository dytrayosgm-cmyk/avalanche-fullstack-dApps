'use client'

import { useState, useEffect } from 'react'

// Agar TypeScript tidak error saat memanggil window.ethereum
declare global {
  interface Window {
    ethereum?: any
  }
}

export default function Home() {
  // --- STATE ---
  const [walletAddress, setWalletAddress] = useState('')
  const [chainId, setChainId] = useState('')
  const [balance, setBalance] = useState('0')
  const [isConnected, setIsConnected] = useState(false)

  // ID Chain Avalanche Fuji Testnet (Hex: 0xa869)
  const FUJI_CHAIN_ID = '0xa869'

  // --- LOGIC: Connect Wallet ---
  const connectWallet = async () => {
    if (typeof window.ethereum !== 'undefined') {
      try {
        // Request akses akun
        const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' })
        const account = accounts[0]
        
        setWalletAddress(account)
        setIsConnected(true)
        
        // Cek Network & Saldo setelah connect
        await checkNetwork()
        await getBalance(account)

      } catch (error) {
        console.error("Gagal connect:", error)
      }
    } else {
      alert("MetaMask belum terinstall!")
    }
  }

  // --- LOGIC: Cek Network ---
  const checkNetwork = async () => {
    if (window.ethereum) {
      const currentChainId = await window.ethereum.request({ method: 'eth_chainId' })
      setChainId(currentChainId)
    }
  }

  // --- LOGIC: Ambil Saldo ---
  const getBalance = async (address: string) => {
    try {
      const balanceHex = await window.ethereum.request({
        method: 'eth_getBalance',
        params: [address, 'latest'],
      })
      
      // Konversi manual dari Wei (Hex) ke AVAX (Decimal)
      // 1 AVAX = 10^18 Wei
      const balanceInWei = parseInt(balanceHex, 16)
      const balanceInAvax = balanceInWei / 10 ** 18
      setBalance(balanceInAvax.toFixed(4)) // Ambil 4 desimal
    } catch (error) {
      console.error("Gagal ambil saldo:", error)
    }
  }

  // --- LOGIC: Listener (Auto-detect perubahan) ---
  useEffect(() => {
    if (typeof window.ethereum !== 'undefined') {
      // Jika user ganti akun di MetaMask
      window.ethereum.on('accountsChanged', (accounts: string[]) => {
        if (accounts.length > 0) {
          setWalletAddress(accounts[0])
          getBalance(accounts[0])
        } else {
          setIsConnected(false)
          setWalletAddress('')
        }
      })

      // Jika user ganti network di MetaMask
      window.ethereum.on('chainChanged', (newChainId: string) => {
        setChainId(newChainId)
        window.location.reload()
      })
    }
  }, [])

  // Validasi apakah network sudah benar (Fuji)
  const isWrongNetwork = isConnected && chainId !== FUJI_CHAIN_ID

  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-24 bg-gray-900 text-white">
      <div className="z-10 w-full max-w-xl p-8 border border-gray-700 rounded-xl bg-gray-800 shadow-xl">
        
        <h1 className="text-2xl font-bold mb-6 text-center text-blue-400">
          Tugas Blockchain 
        </h1>

        {/* --- TOMBOL CONNECT --- */}
        {!isConnected ? (
          <div className="flex justify-center">
            <button
              onClick={connectWallet}
              className="bg-orange-600 hover:bg-orange-700 text-white font-bold py-3 px-8 rounded-full transition duration-300 shadow-lg"
            >
              🦊 Connect MetaMask
            </button>
          </div>
        ) : (
          <div className="space-y-5">
            
            {/* --- VALIDASI NETWORK --- */}
            <div className={`p-4 rounded-lg text-center font-bold border ${isWrongNetwork ? 'bg-red-900/50 border-red-500 text-red-200' : 'bg-green-900/50 border-green-500 text-green-200'}`}>
              {isWrongNetwork ? (
                <span>❌ Wrong Network! <br/><span className="text-sm font-normal">Silakan pindah ke Avalanche Fuji</span></span>
              ) : (
                <span>✅ Terhubung ke Avalanche Fuji</span>
              )}
            </div>

            {/* --- DATA WALLET --- */}
            <div className="space-y-3">
              {/* Wallet Address */}
              <div className="bg-gray-700 p-4 rounded-lg">
                <p className="text-gray-400 text-xs uppercase tracking-wider mb-1">Wallet Address</p>
                <p className="font-mono text-sm break-all text-yellow-300">{walletAddress}</p>
              </div>

              {/* WAJIB: NAMA & NIM */}
              <div className="bg-blue-900/40 border border-blue-500/50 p-4 rounded-lg text-center">
                <p className="font-bold text-blue-300 mb-2 border-b border-blue-500/30 pb-2">DATA PESERTA</p>
                <p className="text-white">Nama: <span className="font-semibold">Muhammad Dytra Pradana</span></p>
                <p className="text-white">NIM: <span className="font-mono">241011401709</span></p>
              </div>

              {/* Grid Info */}
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-gray-700 p-3 rounded-lg">
                  <p className="text-gray-400 text-xs">Balance</p>
                  <p className="font-bold text-xl">{balance} <span className="text-sm font-normal">AVAX</span></p>
                </div>
                <div className="bg-gray-700 p-3 rounded-lg">
                  <p className="text-gray-400 text-xs">Chain ID</p>
                  <p className="font-mono">{chainId || '-'}</p>
                </div>
              </div>

            </div>
          </div>
        )}
      </div>
    </main>
  )
}
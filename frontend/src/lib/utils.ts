import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"
import { type WalletClient } from 'viem'
import { BrowserProvider, JsonRpcSigner } from 'ethers'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function walletClientToSigner(walletClient: WalletClient) {
  const { account, chain, transport } = walletClient
  if (!account || !chain) {
    throw new Error('WalletClient must have an account and a chain')
  }
  const network = {
    chainId: chain.id,
    name: chain.name,
    ensAddress: chain.contracts?.ensRegistry?.address,
  }
  const provider = new BrowserProvider(transport, network)
  const signer = new JsonRpcSigner(provider, account.address)
  return signer
}

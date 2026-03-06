export const COTI_TESTNET = {
  chainId: 7082400,
  chainIdHex: "0x6C11A0",
  name: "COTI Testnet",
  rpc: "https://testnet.coti.io/rpc",
  ws: "wss://testnet.coti.io/ws",
  explorer: "https://testnet.cotiscan.io",
  currency: {
    name: "COTI",
    symbol: "COTI",
    decimals: 18,
  },
};

export function getExplorerTxUrl(txHash: string): string {
  return `${COTI_TESTNET.explorer}/tx/${txHash}`;
}

export function getExplorerAddressUrl(address: string): string {
  return `${COTI_TESTNET.explorer}/address/${address}`;
}

export function shortenAddress(address: string): string {
  return `${address.slice(0, 6)}...${address.slice(-4)}`;
}

/**
 * Bitcoin price utilities
 */

export interface BitcoinPrice {
  usd: number;
}

export interface BitcoinConversion {
  btc: number;
  satoshis: number;
  formattedBtc: string;
  formattedSats: string;
}

export async function fetchBitcoinPrice(): Promise<BitcoinPrice> {
  try {
    const response = await fetch('https://api.coingecko.com/api/v3/simple/price?ids=bitcoin&vs_currencies=usd');
    const data = await response.json();
    return { usd: data.bitcoin.usd };
  } catch (error) {
    console.error('❌ Failed to fetch Bitcoin price:', error);
    return { usd: 50000 }; // Fallback
  }
}

export function convertToBitcoin(usdAmount: number, btcPriceUsd: number): BitcoinConversion {
  const btc = usdAmount / btcPriceUsd;
  const satoshis = btc * 100000000;
  
  return {
    btc,
    satoshis,
    formattedBtc: `₿${btc.toFixed(8)}`,
    formattedSats: `${satoshis.toFixed(0)} sats`
  };
}

export function extractPricesFromText(text: string): number[] {
  if (!text || text.trim().length < 2) return [];
  
  const prices: number[] = [];
  
  // Strict patterns for clear price formats
  const patterns = [
    /\$(\d{1,4}\.\d{2})/g,  // $99.00, $14.45
    /(\d{1,4}\.\d{2})/g,    // 99.00, 14.45
    /\$(\d{2,4})(?:\D|$)/g  // $99, $14
  ];
  
  for (const pattern of patterns) {
    let match;
    while ((match = pattern.exec(text)) !== null) {
      const price = parseFloat(match[1]);
      if (price >= 0.01 && price <= 9999) {
        prices.push(price);
      }
    }
  }
  
  // Remove duplicates and sort
  return [...new Set(prices)].sort((a, b) => b - a);
}

"use client";

export type CurrencyRate = {
  code: string;
  anchor: "EUR" | "USD";
  perAnchor: number; // 1 unit of this currency equals 'perAnchor' units of anchor
};

export type RatesSnapshot = {
  baseEurToDzd: number; // 1 EUR -> DZD
  baseUsdToDzd: number; // 1 USD -> DZD
  custom: CurrencyRate[];
};

const STORAGE_KEY = "dzd-converter-rates-v1";

const DEFAULT_SNAPSHOT: RatesSnapshot = {
  baseEurToDzd: 145, // sensible placeholder
  baseUsdToDzd: 135,
  custom: [
    { code: "GBP", anchor: "EUR", perAnchor: 1.15 },
    { code: "CAD", anchor: "USD", perAnchor: 0.74 },
    { code: "TRY", anchor: "USD", perAnchor: 0.03 },
  ],
};

export function getRates(): RatesSnapshot {
  if (typeof window === "undefined") return DEFAULT_SNAPSHOT;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return DEFAULT_SNAPSHOT;
    const parsed = JSON.parse(raw) as RatesSnapshot;
    if (!Number.isFinite(parsed.baseEurToDzd) || !Number.isFinite(parsed.baseUsdToDzd)) {
      return DEFAULT_SNAPSHOT;
    }
    return {
      baseEurToDzd: parsed.baseEurToDzd,
      baseUsdToDzd: parsed.baseUsdToDzd,
      custom: Array.isArray(parsed.custom) ? parsed.custom : [],
    };
  } catch {
    return DEFAULT_SNAPSHOT;
  }
}

export function saveRates(snapshot: RatesSnapshot) {
  if (typeof window === "undefined") return;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(snapshot));
}

export function computeRateToDzd(
  currency: { code: string; anchor: "EUR" | "USD"; perAnchor: number },
  eurToDzd: number,
  usdToDzd: number
): number {
  if (currency.code === "DZD") return 1;
  if (currency.code === "EUR") return eurToDzd;
  if (currency.code === "USD") return usdToDzd;
  if (currency.anchor === "EUR") return currency.perAnchor * eurToDzd;
  return currency.perAnchor * usdToDzd;
}

export function allCurrencies(custom: CurrencyRate[]) {
  const base = [
    { code: "DZD", anchor: "USD" as const, perAnchor: 0 },
    { code: "EUR", anchor: "USD" as const, perAnchor: 0 },
    { code: "USD", anchor: "EUR" as const, perAnchor: 0 },
  ];
  // ensure unique codes
  const seen = new Set<string>();
  const list = [...base, ...custom].filter((c) => {
    if (seen.has(c.code)) return false;
    seen.add(c.code);
    return true;
  });
  return list.sort((a, b) => (a.code < b.code ? -1 : 1));
}

export function convertAmount(
  amount: number,
  fromCode: string,
  toCode: string,
  eurToDzd: number,
  usdToDzd: number,
  custom: CurrencyRate[]
): number {
  if (fromCode === toCode) return amount;
  const dictionary: Record<string, CurrencyRate> = {};
  for (const c of allCurrencies(custom)) dictionary[c.code] = c;
  // augment base
  dictionary["DZD"] = { code: "DZD", anchor: "USD", perAnchor: 0 };
  dictionary["EUR"] = { code: "EUR", anchor: "USD", perAnchor: 0 };
  dictionary["USD"] = { code: "USD", anchor: "EUR", perAnchor: 0 };

  const from = dictionary[fromCode];
  const to = dictionary[toCode];
  if (!from || !to) return 0;

  const fromToDzd = computeRateToDzd(from, eurToDzd, usdToDzd);
  const toToDzd = computeRateToDzd(to, eurToDzd, usdToDzd);
  if (toToDzd === 0) return 0;
  // amount in DZD -> target
  return (amount * fromToDzd) / toToDzd;
}


import type { Currency } from "@prisma/client";

/** Every currency this app supports has 2 minor units. Revisit if JPY/KWD are added. */
const MINOR_UNITS: Record<Currency, number> = { INR: 100, EUR: 100, USD: 100 };

export function toMinor(amount: number, currency: Currency): number {
  return Math.round(amount * MINOR_UNITS[currency]);
}

export function fromMinor(minor: number, currency: Currency): number {
  return minor / MINOR_UNITS[currency];
}

export function formatMoney(minor: number, currency: Currency, locale: string): string {
  return new Intl.NumberFormat(locale, { style: "currency", currency }).format(
    fromMinor(minor, currency)
  );
}

/** Never trust a client-supplied price. This only detects tampering. */
export function assertPriceMatches(clientMinor: number, serverMinor: number): void {
  if (clientMinor !== serverMinor) {
    throw new Error(`PRICE_MISMATCH: client=${clientMinor} server=${serverMinor}`);
  }
}

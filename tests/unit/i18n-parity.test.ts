import { describe, expect, it } from "vitest";
import en from "../../messages/en.json";
import hi from "../../messages/hi.json";
import bn from "../../messages/bn.json";
import pl from "../../messages/pl.json";
import fr from "../../messages/fr.json";

type Messages = Record<string, unknown>;

/** All dotted leaf-key paths in a nested messages object, e.g. "Footer.brand". */
function leafPaths(obj: Messages, prefix = ""): string[] {
  return Object.entries(obj).flatMap(([key, value]) => {
    const path = prefix ? `${prefix}.${key}` : key;
    if (value !== null && typeof value === "object" && !Array.isArray(value)) {
      return leafPaths(value as Messages, path);
    }
    return [path];
  });
}

const locales: Record<string, Messages> = { hi, bn, pl, fr };
const enPaths = new Set(leafPaths(en as Messages));

describe("i18n key parity against en.json", () => {
  for (const [locale, messages] of Object.entries(locales)) {
    const localePaths = new Set(leafPaths(messages));

    it(`${locale}.json has every key en.json has`, () => {
      const missing = [...enPaths].filter((p) => !localePaths.has(p));
      expect(missing, `${locale}.json is missing: ${missing.join(", ")}`).toEqual([]);
    });

    it(`${locale}.json has no orphan keys beyond en.json`, () => {
      const orphans = [...localePaths].filter((p) => !enPaths.has(p));
      expect(orphans, `${locale}.json has orphan keys: ${orphans.join(", ")}`).toEqual([]);
    });
  }
});

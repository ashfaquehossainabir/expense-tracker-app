// Kept in sync with the `currency` enum on the backend User model.
export const SUPPORTED_CURRENCIES = [
  { code: "BDT", label: "Bangladeshi Taka" },
  { code: "USD", label: "US Dollar" },
  { code: "EUR", label: "Euro" },
  { code: "GBP", label: "British Pound" },
  { code: "INR", label: "Indian Rupee" },
  { code: "JPY", label: "Japanese Yen" },
  { code: "CAD", label: "Canadian Dollar" },
  { code: "AUD", label: "Australian Dollar" },
  { code: "CNY", label: "Chinese Yuan" },
  { code: "SGD", label: "Singapore Dollar" },
];

export const DEFAULT_CURRENCY = "BDT";

const formatterCache = new Map();

const getFormatter = (currency) => {
  const code = currency || DEFAULT_CURRENCY;
  if (!formatterCache.has(code)) {
    formatterCache.set(
      code,
      new Intl.NumberFormat("en-US", {
        style: "currency",
        currency: code,
        currencyDisplay: "narrowSymbol",
      })
    );
  }
  return formatterCache.get(code);
};

// Formats a plain number using the given currency code, e.g. formatAmount(12.5, "BDT") -> "৳12.50"
export const formatAmount = (amount, currency) => getFormatter(currency).format(Number(amount) || 0);

export const fields = [
  ["full_name", "Full name", 100],
  ["email", "Business email", 254],
  ["brand", "Brand name", 100],
  ["store_url", "Store or launch website", 2048],
  ["market", "Primary market", 100],
  [
    "platform",
    "Store platform",
    ["Shopify", "WooCommerce", "BigCommerce", "Other", "Not sure"],
  ],
  ["category", "Product category", 100],
  ["stage", "Business stage", ["Operating store", "Preparing to launch"]],
  [
    "bottleneck",
    "Primary obstacle",
    [
      "Conversion",
      "Acquisition",
      "Repeat sales",
      "Tracking",
      "Brand or offer",
      "Not sure",
    ],
  ],
  ["goal", "What would you like to achieve in the next 90 days?", 1000],
  [
    "revenue_band",
    "Monthly revenue (USD)",
    [
      "Pre-revenue",
      "Under $5k",
      "$5k–25k",
      "$25k–100k",
      "$100k+",
      "Prefer not to say",
    ],
  ],
  [
    "ad_spend_band",
    "Monthly ad spend (USD)",
    ["None", "Under $1k", "$1k–5k", "$5k–20k", "$20k+", "Prefer not to say"],
  ],
  [
    "traffic",
    "Monthly store visits",
    ["Under 1k", "1k–10k", "10k–50k", "50k+"],
  ],
  [
    "aov",
    "Average order value (USD)",
    ["Under $25", "$25–75", "$75–150", "$150+"],
  ],
  ["orders", "Monthly orders", ["Pre-launch", "Under 100", "100–500", "500+"]],
  ["margin", "Gross margin", ["Under 25%", "25–50%", "Over 50%"]],
  ["timezone", "Time zone", 80],
];
export function validate(input) {
  const data = {},
    errors = {};
  for (const [i, [key, label, limit]] of fields.entries()) {
    const value = typeof input[key] === "string" ? input[key].trim() : "";
    if (!value && i >= 10) continue;
    if (
      !value ||
      (Array.isArray(limit) ? !limit.includes(value) : value.length > limit)
    )
      errors[key] = "Enter a valid " + label.toLowerCase() + ".";
    data[key] = value;
  }
  if ((data.full_name || "").length < 2)
    errors.full_name = "Enter at least two characters.";
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email))
    errors.email = "Enter a valid business email.";
  data.email = data.email.toLowerCase();
  try {
    const url = new URL(data.store_url);
    if (
      !["http:", "https:"].includes(url.protocol) ||
      url.username ||
      url.password ||
      !url.hostname.includes(".")
    )
      throw Error();
  } catch {
    errors.store_url =
      "Enter a full website URL beginning with https:// or http://.";
  }
  if (data.goal.length < 20)
    errors.goal = "Describe your goal in at least 20 characters.";
  if (input.privacy_consent !== true)
    errors.privacy_consent =
      "Please confirm that you have read the privacy notice.";
  data.privacy_consent = true;
  data.marketing_opt_in = input.marketing_opt_in === true;
  return { data, errors };
}

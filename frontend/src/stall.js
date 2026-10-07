// Every shop gets a fixed accent color, so a stall looks the same on the home page, its menu and in the cart.
// Text colors are picked for readable contrast on each background.
const STALLS = [
  { bg: "#D13A26", fg: "#ffffff" },
  { bg: "#F2B705", fg: "#14233A" },
  { bg: "#237A4A", fg: "#ffffff" },
  { bg: "#2B7A9B", fg: "#ffffff" },
  { bg: "#8E3B8F", fg: "#ffffff" },
  { bg: "#0B7F88", fg: "#ffffff" },
];

export function stallStyle(shopId) {
  const n = Number(shopId);
  const index = Number.isFinite(n) ? Math.abs(Math.trunc(n)) : 0;
  const accent = STALLS[index % STALLS.length];
  return { "--accent": accent.bg, "--on-accent": accent.fg };
}

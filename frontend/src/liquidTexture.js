// The image the liquid background distorts: diagonal stripes in a softened food-court palette.
// Painted in code so the app doesn't depend on a hotlinked image.
const STRIPES = ["#9B6BBF", "#3E9FA8", "#E8705A", "#F2C14E", "#4FA37A"]; // purple, teal, coral, yellow, green
const GAP = "#FAF6EE";

export function paintStallTexture(size = 1024) {
  if (typeof document === "undefined") return "";
  const canvas = document.createElement("canvas");
  canvas.width = size;
  canvas.height = size;
  const g = canvas.getContext("2d");
  if (!g) return "";

  g.fillStyle = GAP;
  g.fillRect(0, 0, size, size);
  g.translate(size / 2, size / 2);
  g.rotate(-Math.PI / 6);

  const band = size / 9;
  for (let i = -8; i < 8; i++) {
    g.fillStyle = i % 2 === 0 ? STRIPES[(((i / 2) % STRIPES.length) + STRIPES.length) % STRIPES.length] : GAP;
    g.fillRect(i * band, -size, band, size * 2);
  }

  return canvas.toDataURL("image/jpeg", 0.9);
}

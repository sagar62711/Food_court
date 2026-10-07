// Placeholder illustration for a shop without a photo, picked from its cuisine and name.
// Drawn in the shop's accent color (currentColor).
const ART = [
  { match: /momo|dumpling|dim ?sum|gyoza|tibet|nepal/i, draw: Dumpling },
  { match: /pizza|italian|pasta/i, draw: Pizza },
  { match: /chinese|noodle|wok|ramen|asian|thai|japanese|korean/i, draw: Bowl },
];

export default function FoodArt({ shop }) {
  const text = `${shop.cuisine_type} ${shop.name}`;
  const Art = ART.find((a) => a.match.test(text))?.draw ?? Plate;
  return (
    <svg className="food-art" viewBox="0 0 120 120" aria-hidden="true">
      <Art />
    </svg>
  );
}

const line = { fill: "none", stroke: "currentColor", strokeWidth: 4, strokeLinecap: "round", strokeLinejoin: "round" };
const tint = { fill: "currentColor", fillOpacity: 0.16 };

function Bowl() {
  return (
    <>
      <path d="M58 22 L86 56 M72 16 L96 50" {...line} />
      <path d="M38 50 q5 -10 10 0 t10 0 t10 0 t10 0" {...line} />
      <path d="M16 60 h88 a44 40 0 0 1 -88 0 z" {...tint} {...line} fill="currentColor" />
      <path d="M44 100 h32" {...line} />
    </>
  );
}

function Dumpling() {
  return (
    <>
      <path d="M18 78 C18 42 102 42 102 78 Q60 92 18 78 Z" {...tint} {...line} fill="currentColor" />
      <path d="M42 56 l5 -12 M60 50 v-12 M78 56 l-5 -12" {...line} />
      <path d="M14 96 h92" {...line} />
    </>
  );
}

function Pizza() {
  return (
    <>
      <path d="M60 104 L22 32 Q60 14 98 32 Z" {...tint} {...line} fill="currentColor" />
      <path d="M22 32 Q60 14 98 32" {...line} strokeWidth={9} />
      <circle cx="52" cy="48" r="6" fill="currentColor" />
      <circle cx="72" cy="54" r="5" fill="currentColor" />
      <circle cx="60" cy="74" r="6" fill="currentColor" />
    </>
  );
}

function Plate() {
  return (
    <>
      <circle cx="60" cy="62" r="32" {...tint} {...line} fill="currentColor" />
      <circle cx="60" cy="62" r="18" {...line} />
      <path d="M16 36 v16 a6 6 0 0 0 12 0 v-16 M22 58 v40 M104 36 c-8 6 -8 24 0 28 v34" {...line} />
    </>
  );
}

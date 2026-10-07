import { useLayoutEffect, useRef } from "react";
import ProductCard from "./ProductCard.jsx";

// A stable, slightly random tilt per card, in [-max, max] degrees.
function tiltFor(i, max) {
  const u = (((i + 1) * 2654435761) >>> 0) / 4294967296;
  return (u * 2 - 1) * max;
}

const HOLD_MS = 350; // how long the deck sits stacked before dealing starts
const DEAL_MS = 550; // flight time of one card

// The menu opens as a stacked deck of dish cards, then deals them out one by one
// into the grid. Mount it with key={shopId} so the deal plays once per shop.
export default function DealtMenu({ products, onAddToCart, style }) {
  const gridRef = useRef(null);

  useLayoutEffect(() => {
    const grid = gridRef.current;
    if (!grid) return undefined;
    const cards = Array.from(grid.children);
    const n = cards.length;
    if (n < 2 || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return undefined;

    // Runs before the first paint, so the cards are never seen in their final spots first.
    const box = grid.getBoundingClientRect();
    const deckX = box.left + box.width / 2;
    const stagger = Math.min(80, 1100 / n);

    cards.forEach((card, i) => {
      const r = card.getBoundingClientRect();
      const depth = Math.min(i, 3);
      const dx = deckX - (r.left + r.width / 2);
      const dy = box.top - r.top - depth * 10;
      const rot = i === 0 ? 0 : tiltFor(i, 5);
      card.style.transition = "none";
      card.style.zIndex = String(n - i);
      card.style.opacity = i > 3 ? "0" : "1";
      card.style.transform = `translate(${dx}px, ${dy}px) scale(${1 - depth * 0.04}) rotate(${rot}deg)`;
    });

    function reset() {
      cards.forEach((card) => {
        card.style.transition = "";
        card.style.transform = "";
        card.style.opacity = "";
        card.style.zIndex = "";
      });
    }

    const deal = setTimeout(() => {
      cards.forEach((card, i) => {
        const delay = Math.round(i * stagger);
        card.style.transition =
          `transform ${DEAL_MS}ms cubic-bezier(.2,.8,.2,1) ${delay}ms, opacity 300ms ease ${delay}ms`;
        card.style.transform = "";
        card.style.opacity = "";
      });
    }, HOLD_MS);
    const done = setTimeout(reset, HOLD_MS + n * stagger + DEAL_MS + 50);

    return () => {
      clearTimeout(deal);
      clearTimeout(done);
      reset();
    };
  }, []);

  return (
    <ul className="dish-grid" ref={gridRef} style={style}>
      {products.map((product) => (
        <ProductCard key={product.id} product={product} onAddToCart={onAddToCart} />
      ))}
    </ul>
  );
}

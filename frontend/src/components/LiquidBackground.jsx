import { useEffect, useMemo, useRef, useState } from "react";
import { useLocation } from "react-router-dom";
import { paintStallTexture } from "../liquidTexture.js";

const LIQUID_URL = "https://cdn.jsdelivr.net/npm/threejs-components@0.0.22/build/backgrounds/liquid1.min.js";

// Staff screens get a calmer surface so it doesn't compete with order queues and forms.
const STAFF_PATHS = ["/dashboard", "/admin", "/login"];
const RIPPLE = { customer: 5, staff: 1.5 };

function prefersReducedMotion() {
  return typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

// One WebGL liquid layer fixed behind every page, mounted once in App.
// Falls back to a still, blurred copy of the same texture when motion is reduced or the script fails to load.
export default function LiquidBackground() {
  const canvasRef = useRef(null);
  const appRef = useRef(null);
  const [isStatic, setIsStatic] = useState(prefersReducedMotion);
  const texture = useMemo(() => paintStallTexture(), []);

  const { pathname } = useLocation();
  const ripple = STAFF_PATHS.some((p) => pathname.startsWith(p)) ? RIPPLE.staff : RIPPLE.customer;
  const rippleRef = useRef(ripple);

  useEffect(() => {
    if (isStatic) return undefined;
    let cancelled = false;

    import(/* @vite-ignore */ LIQUID_URL)
      .then(({ default: createLiquid }) => {
        if (cancelled || !canvasRef.current) return;
        const app = createLiquid(canvasRef.current);
        app.loadImage(texture);
        app.liquidPlane.material.metalness = 0.35;
        app.liquidPlane.material.roughness = 0.3;
        app.liquidPlane.uniforms.displacementScale.value = rippleRef.current;
        app.setRain(false);
        appRef.current = app;
      })
      .catch(() => {
        if (!cancelled) setIsStatic(true);
      });

    return () => {
      cancelled = true;
      appRef.current?.dispose?.();
      appRef.current = null;
    };
  }, [isStatic, texture]);

  useEffect(() => {
    rippleRef.current = ripple;
    const app = appRef.current;
    if (app) app.liquidPlane.uniforms.displacementScale.value = ripple;
  }, [ripple]);

  if (isStatic) {
    return <div className="liquid-bg is-static" style={{ backgroundImage: `url(${texture})` }} aria-hidden="true" />;
  }

  return (
    <div className="liquid-bg" aria-hidden="true">
      <canvas ref={canvasRef} />
    </div>
  );
}

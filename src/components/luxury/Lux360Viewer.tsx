import { useCallback, useEffect, useMemo, useRef, useState } from "react";

type Lux360ViewerProps = {
  frames: string[];
  alt: string;
  className?: string;
  draggable?: boolean;
};

function clampIndex(index: number, length: number) {
  if (length <= 0) return 0;
  const mod = index % length;
  return mod < 0 ? mod + length : mod;
}

export default function Lux360Viewer(props: Lux360ViewerProps) {
  const frames = useMemo(() => (props.frames.length > 0 ? props.frames : ["/images/lux-hero.svg"]), [props.frames]);
  const [index, setIndex] = useState(0);
  const draggingRef = useRef(false);
  const lastXRef = useRef<number | null>(null);

  useEffect(() => {
    setIndex((prev) => clampIndex(prev, frames.length));
  }, [frames.length]);

  const step = useCallback(
    (delta: number) => {
      setIndex((prev) => clampIndex(prev + delta, frames.length));
    },
    [frames.length]
  );

  const onPointerDown = (e: React.PointerEvent) => {
    if (props.draggable === false) return;
    draggingRef.current = true;
    lastXRef.current = e.clientX;
    (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
  };

  const onPointerMove = (e: React.PointerEvent) => {
    if (!draggingRef.current) return;
    const lastX = lastXRef.current;
    if (lastX == null) {
      lastXRef.current = e.clientX;
      return;
    }
    const dx = e.clientX - lastX;
    lastXRef.current = e.clientX;
    const threshold = 12;
    if (Math.abs(dx) >= threshold) step(dx > 0 ? -1 : 1);
  };

  const onPointerUp = () => {
    draggingRef.current = false;
    lastXRef.current = null;
  };

  return (
    <div
      className={props.className}
      role="group"
      aria-label={`${props.alt}. Drag or use arrow keys to rotate.`}
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === "ArrowLeft") step(-1);
        if (e.key === "ArrowRight") step(1);
      }}
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={onPointerUp}
      onPointerCancel={onPointerUp}
    >
      <img
        src={frames[index]}
        alt={props.alt}
        draggable={false}
        decoding="async"
        loading="lazy"
        className="w-full h-full object-cover select-none"
      />
    </div>
  );
}

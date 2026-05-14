import { CSSProperties, useRef } from "react";
import styles from "./LuxZoomImage.module.scss";

type LuxZoomImageProps = {
  src: string;
  srcSet?: string;
  sizes?: string;
  alt: string;
  className?: string;
  zoom?: number;
};

type CSSVarProperties = Record<`--${string}`, string | number>;

export default function LuxZoomImage(props: LuxZoomImageProps) {
  const ref = useRef<HTMLDivElement | null>(null);
  const style = { "--lux-zoom": String(props.zoom ?? 1.12) } as CSSProperties & CSSVarProperties;

  return (
    <div
      ref={ref}
      className={[styles.root, props.className].filter(Boolean).join(" ")}
      onPointerMove={(e) => {
        const el = ref.current;
        if (!el) return;
        const rect = el.getBoundingClientRect();
        const x = Math.min(Math.max((e.clientX - rect.left) / rect.width, 0), 1);
        const y = Math.min(Math.max((e.clientY - rect.top) / rect.height, 0), 1);
        el.style.setProperty("--lux-zoom-x", `${x * 100}%`);
        el.style.setProperty("--lux-zoom-y", `${y * 100}%`);
      }}
      style={style}
    >
      <img
        src={props.src}
        srcSet={props.srcSet}
        sizes={props.sizes}
        alt={props.alt}
        decoding="async"
        loading="lazy"
        draggable={false}
        className={styles.image}
      />
    </div>
  );
}

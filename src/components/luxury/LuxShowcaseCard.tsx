import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { ArrowRight, Rotate3D } from "lucide-react";
import { motion } from "framer-motion";
import Lux360Viewer from "./Lux360Viewer";
import LuxZoomImage from "./LuxZoomImage";
import styles from "./ShowcaseCard.module.scss";

type LuxShowcaseCardProps = {
  id: string;
  kicker?: string;
  title: string;
  detailsHref?: string;
  description: string;
  primaryCtaLabel: string;
  primaryCtaHref: string;
  secondaryCtaLabel?: string;
  secondaryCtaHref?: string;
  image: {
    src: string;
    alt: string;
    srcSet?: string;
    sizes?: string;
  };
  frames360?: string[];
};

export default function LuxShowcaseCard(props: LuxShowcaseCardProps) {
  const [mode, setMode] = useState<"zoom" | "360">("zoom");
  const frames = useMemo(() => props.frames360 ?? [], [props.frames360]);
  const has360 = frames.length > 1;

  return (
    <motion.article whileHover={{ y: -2 }} transition={{ duration: 0.32, ease: [0.22, 1, 0.36, 1] }} className={styles.card}>
      <div className={styles.media} style={{ aspectRatio: "16 / 11" }}>
        <motion.div layoutId={`showcase-media:${props.id}`} className="absolute inset-0">
          {mode === "360" && has360 ? (
            <Lux360Viewer frames={frames} alt={props.image.alt} className="absolute inset-0" />
          ) : (
            <LuxZoomImage
              src={props.image.src}
              srcSet={props.image.srcSet}
              sizes={props.image.sizes}
              alt={props.image.alt}
              className="absolute inset-0"
              zoom={1.12}
            />
          )}
        </motion.div>

        <div className="absolute inset-0 pointer-events-none bg-gradient-to-t from-black/25 via-transparent to-transparent" />

        <div className="absolute left-4 top-4 flex items-center gap-2">
          <span className={styles.badge}>Retina-ready</span>
          {has360 && (
            <button
              type="button"
              className={styles.badge}
              aria-pressed={mode === "360"}
              onClick={() => setMode((m) => (m === "360" ? "zoom" : "360"))}
              style={{ pointerEvents: "auto" }}
            >
              <Rotate3D className="h-4 w-4" />
              360°
            </button>
          )}
        </div>
      </div>

      <div className={styles.meta}>
        <div className={styles.kicker}>{props.kicker ?? "Collection"}</div>
        <motion.h3 layoutId={`showcase-title:${props.id}`} className={styles.title}>
          {props.detailsHref ? (
            <Link to={props.detailsHref} className="hover:underline">
              {props.title}
            </Link>
          ) : (
            props.title
          )}
        </motion.h3>
        <p className={styles.copy}>{props.description}</p>

        <div className={styles.ctaRow}>
          <div className={styles.ctaButtons}>
            <Link to={props.primaryCtaHref} className="lux-btn lux-btn--primary" aria-label={`${props.primaryCtaLabel}: ${props.title}`}>
              {props.primaryCtaLabel} <ArrowRight className="h-4 w-4" />
            </Link>
            {props.secondaryCtaHref && (
              <Link to={props.secondaryCtaHref} className={styles.cta} aria-label={`${props.secondaryCtaLabel ?? "See details"}: ${props.title}`}>
                {props.secondaryCtaLabel ?? "See details"} <ArrowRight className="h-4 w-4" />
              </Link>
            )}
          </div>
          <span className={styles.badge}>Cinematic</span>
        </div>
      </div>
    </motion.article>
  );
}

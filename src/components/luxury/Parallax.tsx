import { PropsWithChildren, useRef } from "react";
import { motion, useReducedMotion, useScroll, useTransform } from "framer-motion";

type ParallaxProps = PropsWithChildren<{
  offset?: readonly [number, number];
  className?: string;
}>;

export default function Parallax(props: ParallaxProps) {
  const reduceMotion = useReducedMotion();
  const ref = useRef<HTMLDivElement | null>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start end", "end start"] });
  const y = useTransform(scrollYProgress, [0, 1], reduceMotion ? [0, 0] : [props.offset?.[0] ?? -26, props.offset?.[1] ?? 26]);

  return (
    <motion.div ref={ref} style={{ y }} className={props.className}>
      {props.children}
    </motion.div>
  );
}

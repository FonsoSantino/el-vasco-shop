"use client";

import { useRef, useState } from "react";
import {
  motion,
  useAnimationFrame,
  useMotionValue,
  useTransform,
  wrap,
} from "framer-motion";

interface InfiniteMarqueeProps {
  children: React.ReactNode;
  baseVelocity?: number;
}

export function InfiniteMarquee({
  children,
  baseVelocity = -1,
}: InfiniteMarqueeProps) {
  const baseX = useMotionValue(0);
  const x = useTransform(baseX, (v) => `${wrap(-50, 0, v)}%`);

  const directionFactor = useRef<number>(1);
  const [isDragging, setIsDragging] = useState(false);

  useAnimationFrame((t, delta) => {
    const moveBy = directionFactor.current * baseVelocity * (delta / 1000);

    // Si arrastramos, no aplicamos la velocidad automática, el drag domina.
    if (!isDragging) {
      baseX.set(baseX.get() + moveBy);
    }
  });

  return (
    <div 
      className="overflow-hidden flex flex-nowrap whitespace-nowrap w-full"
      onMouseLeave={() => setIsDragging(false)}
    >
      <motion.div
        className="flex whitespace-nowrap flex-nowrap"
        style={{ x, willChange: 'transform' }}
        drag="x"
        dragConstraints={{ left: 0, right: 0 }}
        dragElastic={1}
        onDragStart={() => setIsDragging(true)}
        onDragEnd={() => setIsDragging(false)}
        onDrag={(e, info) => {
          // Ajustar baseX basado en el arrastre
          const currentX = baseX.get();
          // Scale down the drag delta so it's not too sensitive
          baseX.set(currentX + (info.delta.x / 10));
        }}
      >
        <div className="flex shrink-0">{children}</div>
        <div className="flex shrink-0">{children}</div>
        <div className="flex shrink-0">{children}</div>
        <div className="flex shrink-0">{children}</div>
      </motion.div>
    </div>
  );
}

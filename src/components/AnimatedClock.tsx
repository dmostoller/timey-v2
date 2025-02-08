"use client";

import { motion } from "framer-motion";
import { useEffect, useState } from "react";

interface AnimatedClockProps {
  size?: number;
}

export function AnimatedClock({ size = 200 }: AnimatedClockProps) {
  const [currentTime, setCurrentTime] = useState(new Date());

  const center = size / 2;
  const radius = size / 2 - 2;

  // Update real-time clock
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  // Calculate real-time clock angles
  const realSeconds = currentTime.getSeconds();
  const realMinutes = currentTime.getMinutes();
  const realHours = currentTime.getHours() % 12;

  const realSecondsAngle = (realSeconds / 60) * 360;
  const realMinutesAngle = ((realMinutes + realSeconds / 60) / 60) * 360;
  const realHoursAngle = ((realHours + realMinutes / 60) / 12) * 360;

  return (
    <div className="relative" style={{ width: size, height: size }}>
      {/* SVG Filters */}
      <svg width="0" height="0">
        <defs>
          <filter id="glow">
            <feGaussianBlur stdDeviation="3.5" result="coloredBlur" />
            <feMerge>
              <feMergeNode in="coloredBlur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>
      </svg>

      {/* Clock Face */}
      <svg
        width={size}
        height={size}
        viewBox={`0 0 ${size} ${size}`}
        className="absolute"
      >
        Hour Markers
        {[...Array(12)].map((_, i) => {
          const angle = (i * 30 * Math.PI) / 180;
          const x1 = center + (radius - 20) * Math.cos(angle);
          const y1 = center + (radius - 20) * Math.sin(angle);
          const x2 = center + radius * Math.cos(angle);
          const y2 = center + radius * Math.sin(angle);
          return (
            <line
              key={i}
              x1={x1}
              y1={y1}
              x2={x2}
              y2={y2}
              stroke="currentColor"
              strokeWidth={i % 3 === 0 ? "3" : "1"}
              className="text-muted-foreground/50"
            />
          );
        })}
        {/* Real-time Clock Hands */}
        <motion.line
          x1={center}
          y1={center}
          x2={
            center + (radius - 60) * Math.sin((realHoursAngle * Math.PI) / 180)
          }
          y2={
            center - (radius - 60) * Math.cos((realHoursAngle * Math.PI) / 180)
          }
          stroke="currentColor"
          strokeWidth="4"
          strokeLinecap="round"
          className="text-muted-foreground"
        />
        <motion.line
          x1={center}
          y1={center}
          x2={
            center +
            (radius - 40) * Math.sin((realMinutesAngle * Math.PI) / 180)
          }
          y2={
            center -
            (radius - 40) * Math.cos((realMinutesAngle * Math.PI) / 180)
          }
          stroke="currentColor"
          strokeWidth="3"
          strokeLinecap="round"
          className="text-muted-foreground"
        />
        <motion.line
          x1={center}
          y1={center}
          x2={
            center +
            (radius - 20) * Math.sin((realSecondsAngle * Math.PI) / 180)
          }
          y2={
            center -
            (radius - 20) * Math.cos((realSecondsAngle * Math.PI) / 180)
          }
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          className="text-muted-foreground"
        />
      </svg>

      {/* Digital Time Display */}
      {/* <div className="absolute inset-0 flex items-center justify-center">
        <div className="text-2xl font-bold bg-background/80 px-4 py-2 rounded-full backdrop-blur-sm">
          {formatTime(elapsedTime)}
        </div>
      </div> */}
    </div>
  );
}

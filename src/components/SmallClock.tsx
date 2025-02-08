"use client";

import { motion } from "framer-motion";
import { useEffect, useState } from "react";

interface SmallClockProps {
  size?: number;
}

export function SmallClock({ size = 100 }: SmallClockProps) {
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
      {/* Clock Face */}
      <svg
        width={size}
        height={size}
        viewBox={`0 0 ${size} ${size}`}
        className="absolute"
      >
        {/* Clock Hands */}
        <motion.line
          x1={center}
          y1={center}
          x2={
            center + (radius - 30) * Math.sin((realHoursAngle * Math.PI) / 180)
          }
          y2={
            center - (radius - 30) * Math.cos((realHoursAngle * Math.PI) / 180)
          }
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          className="text-muted-foreground"
        />
        <motion.line
          x1={center}
          y1={center}
          x2={
            center +
            (radius - 20) * Math.sin((realMinutesAngle * Math.PI) / 180)
          }
          y2={
            center -
            (radius - 20) * Math.cos((realMinutesAngle * Math.PI) / 180)
          }
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
          className="text-muted-foreground"
        />
        <motion.line
          x1={center}
          y1={center}
          x2={
            center +
            (radius - 10) * Math.sin((realSecondsAngle * Math.PI) / 180)
          }
          y2={
            center -
            (radius - 10) * Math.cos((realSecondsAngle * Math.PI) / 180)
          }
          stroke="currentColor"
          strokeWidth="1"
          strokeLinecap="round"
          className="text-muted-foreground"
        />
      </svg>
    </div>
  );
}

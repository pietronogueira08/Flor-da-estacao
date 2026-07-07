import Image from "next/image";

interface ZayaWordmarkProps {
  width?: number;
  height?: number;
  className?: string;
}

export function ZayaWordmark({ width = 120, height = 40, className = "" }: ZayaWordmarkProps) {
  return (
    <Image
      src="/logo.svg"
      alt="Zaya"
      width={width}
      height={height}
      className={className}
      priority
      unoptimized
    />
  );
}

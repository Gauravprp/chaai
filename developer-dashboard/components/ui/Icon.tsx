import React from "react";
import { Icon as IconifyIcon } from "@iconify/react";

interface IconProps {
  icon: string;
  className?: string;
  width?: number | string;
  rotate?: number;
  hFlip?: boolean;
  vFlip?: boolean;
}

const Icon: React.FC<IconProps> = ({ icon, className, width, rotate, hFlip, vFlip }) => {
  return (
    <IconifyIcon
      width={width}
      rotate={rotate}
      hFlip={hFlip}
      icon={icon}
      className={className}
      vFlip={vFlip}
    />
  );
};

export default Icon;

import type { SVGProps } from "react";

type IconProps = SVGProps<SVGSVGElement> & { size?: number };

function BaseIcon({ size = 20, children, ...props }: IconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.25"
      strokeLinecap="round"
      strokeLinejoin="round"
      {...props}
    >
      {children}
    </svg>
  );
}

export function ThinBoltIcon(props: IconProps) {
  return (
    <BaseIcon {...props}>
      <path d="M13.5 2.5 6.5 13h4l-1 8.5L17.5 11h-4l.5-8.5Z" />
    </BaseIcon>
  );
}

export function ThinSparkIcon(props: IconProps) {
  return (
    <BaseIcon {...props}>
      <path d="m12 3 1.7 4.3L18 9l-4.3 1.7L12 15l-1.7-4.3L6 9l4.3-1.7L12 3Z" />
      <path d="M5 16.5 6 19l2.5 1-2.5 1L5 23l-1-2.5-2.5-1L4 19l1-2.5Z" />
    </BaseIcon>
  );
}

export function ThinClockIcon(props: IconProps) {
  return (
    <BaseIcon {...props}>
      <circle cx="12" cy="12" r="8" />
      <path d="M12 7.5V12l3 2.5" />
    </BaseIcon>
  );
}

export function ThinCheckIcon(props: IconProps) {
  return (
    <BaseIcon {...props}>
      <path d="m6 12 4 4 8-8" />
    </BaseIcon>
  );
}

export function ThinTrashIcon(props: IconProps) {
  return (
    <BaseIcon {...props}>
      <path d="M4.5 6h15" />
      <path d="M9 6V4.5h6V6" />
      <path d="M7 6.5 8 20h8l1-13.5" />
      <path d="M10 10.5v6" />
      <path d="M14 10.5v6" />
    </BaseIcon>
  );
}

export function ThinArrowLeftIcon(props: IconProps) {
  return (
    <BaseIcon {...props}>
      <path d="M18 12H6" />
      <path d="m10 8-4 4 4 4" />
    </BaseIcon>
  );
}

export function ThinCrownIcon(props: IconProps) {
  return (
    <BaseIcon {...props}>
      <path d="m3.5 17 2-9 4.5 4 4-6 4.5 6 2-4 2 9H3.5Z" />
      <path d="M4 20.5h16" />
    </BaseIcon>
  );
}

export function ThinLockIcon(props: IconProps) {
  return (
    <BaseIcon {...props}>
      <rect x="6.5" y="10.5" width="11" height="9" rx="2" />
      <path d="M9 10.5V8a3 3 0 0 1 6 0v2.5" />
    </BaseIcon>
  );
}

export function ThinAlertIcon(props: IconProps) {
  return (
    <BaseIcon {...props}>
      <path d="M12 4 3.5 19h17L12 4Z" />
      <path d="M12 9v5.5" />
      <circle cx="12" cy="17.2" r=".8" fill="currentColor" stroke="none" />
    </BaseIcon>
  );
}


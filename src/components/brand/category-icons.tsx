import type { SVGProps } from "react";

type IconProps = SVGProps<SVGSVGElement>;

const base = {
  viewBox: "0 0 24 24",
  fill: "none",
  xmlns: "http://www.w3.org/2000/svg",
  "aria-hidden": true as const,
};

export function PhotographyIcon(props: IconProps) {
  return (
    <svg {...base} {...props}>
      <rect x="3.5" y="6.5" width="17" height="12" rx="3" stroke="currentColor" strokeWidth="1.8" />
      <path d="M8 6.5 9.4 4.8c.3-.4.8-.6 1.3-.6h2.6c.5 0 1 .2 1.3.6L16 6.5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
      <circle cx="12" cy="12.5" r="3.2" stroke="currentColor" strokeWidth="1.8" />
      <circle cx="12" cy="12.5" r="1.1" fill="currentColor" />
      <path d="M17.2 9.5h.01" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" />
    </svg>
  );
}

export function VenueIcon(props: IconProps) {
  return (
    <svg {...base} {...props}>
      <path d="M4.5 19.5h15" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
      <path d="M6.5 19.5V11.2c0-.5.2-1 .6-1.3L12 5.5l4.9 4.4c.4.3.6.8.6 1.3v8.3" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M9.5 19.5v-4.2c0-1 .8-1.8 1.8-1.8h1.4c1 0 1.8.8 1.8 1.8v4.2" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M12 8.6v1.8" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
    </svg>
  );
}

export function FloristIcon(props: IconProps) {
  return (
    <svg {...base} {...props}>
      <path d="M12 20v-6.2" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
      <path d="M12 16.2c-2.4.2-4.2-1.1-4.8-3.4 2.2-.7 4 .1 4.8 1.8" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M12 14.8c.8-1.8 2.6-2.6 4.8-1.9-.5 2.3-2.3 3.7-4.8 3.4" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
      <circle cx="12" cy="8.2" r="1.8" stroke="currentColor" strokeWidth="1.8" />
      <path d="M12 4.5v1.2M15.7 8.2h-1.2M9.5 8.2H8.3M14.5 5.7l-.8.8M10.3 9.9l-.8.8M14.5 10.7l-.8-.8M10.3 6.5l-.8-.8" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
    </svg>
  );
}

export function CateringIcon(props: IconProps) {
  return (
    <svg {...base} {...props}>
      <path d="M4 17.5h16" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
      <path d="M6 17.5v-.8a6 6 0 0 1 12 0v.8" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M12 7.2v1.3" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
      <circle cx="12" cy="6" r="1" fill="currentColor" />
      <path d="M8.2 13.2c.8-1.5 2.2-2.3 3.8-2.3s3 .8 3.8 2.3" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
    </svg>
  );
}

export function MakeupIcon(props: IconProps) {
  return (
    <svg {...base} {...props}>
      <path d="M7.2 6.2a3.3 3.3 0 0 1 4.6 0l.7.7.7-.7a3.3 3.3 0 1 1 4.6 4.6l-5.3 5.3-5.3-5.3a3.3 3.3 0 0 1 0-4.6Z" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M14.8 14.8l3.9 3.9" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
      <path d="m16.4 13.2 1.6 1.6-2 2-1.6-1.6" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export function FashionIcon(props: IconProps) {
  return (
    <svg {...base} {...props}>
      <path d="M9 4.5 12 7l3-2.5 2.2 2.2-2 2.3V20H8.8V9L6.8 6.7 9 4.5Z" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M8.8 12.2c2 .8 4.4.8 6.4 0" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
      <path d="M10 4.9 12 7l2-2.1" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

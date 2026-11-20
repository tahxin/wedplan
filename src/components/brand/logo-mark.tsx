import type { SVGProps } from "react";

export function LogoMark(props: SVGProps<SVGSVGElement>) {
  return (
    <svg
      viewBox="0 0 64 64"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
      {...props}
    >
      <path
        d="M10 22.5c5.2-4.8 11-4.8 16.2 0L32 28l5.8-5.5c5.2-4.8 11-4.8 16.2 0"
        stroke="currentColor"
        strokeWidth="4.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M14 22.5V39c0 2.2 1.1 4.3 3 5.5l13.2 8.4c1.1.7 2.5.7 3.6 0L47 44.5c1.9-1.2 3-3.3 3-5.5V22.5"
        stroke="currentColor"
        strokeWidth="4.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M32 28v24.5"
        stroke="currentColor"
        strokeWidth="4.5"
        strokeLinecap="round"
      />
      <path
        d="M24.5 14.5c2.2-3 4.7-4.5 7.5-4.5s5.3 1.5 7.5 4.5"
        stroke="currentColor"
        strokeWidth="4.5"
        strokeLinecap="round"
      />
      <circle cx="32" cy="16.5" r="2.6" fill="currentColor" />
    </svg>
  );
}

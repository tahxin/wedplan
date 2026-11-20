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
        d="M24.5 18.5c-6.351 0-11.5 5.149-11.5 11.5S18.149 41.5 24.5 41.5c3.06 0 5.845-1.196 7.9-3.146"
        stroke="currentColor"
        strokeWidth="4.5"
        strokeLinecap="round"
      />
      <path
        d="M39.5 18.5c6.351 0 11.5 5.149 11.5 11.5S45.851 41.5 39.5 41.5c-3.06 0-5.845-1.196-7.9-3.146"
        stroke="currentColor"
        strokeWidth="4.5"
        strokeLinecap="round"
      />
      <path
        d="M22 44.5c3.2 4.2 6.5 6.8 10 9 3.5-2.2 6.8-4.8 10-9"
        stroke="currentColor"
        strokeWidth="4.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M32 13.5v8"
        stroke="currentColor"
        strokeWidth="4.5"
        strokeLinecap="round"
      />
      <circle cx="32" cy="11" r="2.5" fill="currentColor" />
    </svg>
  );
}

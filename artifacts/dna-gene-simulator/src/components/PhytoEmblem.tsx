import type { SVGProps } from 'react';

export default function PhytoEmblem(props: SVGProps<SVGSVGElement>) {
  return (
    <svg
      viewBox="0 0 64 64"
      role="img"
      aria-label="Phyto Athenix botanical DNA emblem"
      xmlns="http://www.w3.org/2000/svg"
      {...props}
    >
      <defs>
        <radialGradient id="phyto-emblem-field" cx="50%" cy="46%" r="68%">
          <stop offset="0%" stopColor="#1c3b46" stopOpacity=".92" />
          <stop offset="48%" stopColor="#102535" stopOpacity=".94" />
          <stop offset="84%" stopColor="#0b1222" stopOpacity=".98" />
          <stop offset="100%" stopColor="#050713" />
        </radialGradient>
        <linearGradient id="phyto-emblem-accent" x1="18%" y1="12%" x2="84%" y2="90%">
          <stop offset="0%" stopColor="#b8f27c" />
          <stop offset="52%" stopColor="#72e6b0" />
          <stop offset="100%" stopColor="#5fd8e8" />
        </linearGradient>
        <filter id="phyto-emblem-halo" x="-90%" y="-90%" width="280%" height="280%">
          <feGaussianBlur stdDeviation="2.6" result="blur" />
          <feMerge>
            <feMergeNode in="blur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
        <filter id="phyto-emblem-soft-glow" x="-80%" y="-80%" width="260%" height="260%">
          <feGaussianBlur stdDeviation="1.2" result="blur" />
          <feMerge>
            <feMergeNode in="blur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>

      {/* Dark circular badge with a restrained scientific halo */}
      <circle cx="32" cy="32" r="28.5" fill="#5fd8e8" opacity=".18" filter="url(#phyto-emblem-halo)" />
      <circle cx="32" cy="32" r="25.5" fill="url(#phyto-emblem-field)" stroke="#7ddcf0" strokeOpacity=".78" strokeWidth=".9" />
      <circle cx="32" cy="32" r="22.7" fill="none" stroke="#b8f27c" strokeOpacity=".18" strokeWidth=".55" />

      {/* Botanical sprout emerging from the DNA helix */}
      <g fill="url(#phyto-emblem-accent)" stroke="none" filter="url(#phyto-emblem-soft-glow)">
        <path d="M31.7 27.8 C24.7 27.8 20.1 23.7 20.6 17.3 C27.2 17.4 32.3 21.4 31.7 27.8Z" opacity=".95" />
        <path d="M32 25.6 C33.7 18.7 39.4 15.1 45.4 16.1 C44 22.4 39.3 26.1 32 25.6Z" opacity=".82" />
        <path d="M31.8 25.2 C31.8 30.3 32 33.3 32 36.2" fill="none" stroke="#b8f27c" strokeOpacity=".9" strokeWidth="1.1" />
      </g>

      {/* Compact double helix */}
      <g fill="none" strokeLinecap="round" strokeLinejoin="round" filter="url(#phyto-emblem-soft-glow)">
        <path
          d="M22 25 C39 29 39 36 22 40 C12 42.5 12 48 22 51"
          stroke="#10202b"
          strokeWidth="3.2"
        />
        <path
          d="M42 25 C25 29 25 36 42 40 C52 42.5 52 48 42 51"
          stroke="#10202b"
          strokeWidth="3.2"
        />
        <g stroke="url(#phyto-emblem-accent)" strokeOpacity=".82" strokeWidth=".9">
          <path d="M25 27 L39 27" />
          <path d="M22 32 L42 32" />
          <path d="M22 37 L42 37" />
          <path d="M25 42 L39 42" />
          <path d="M29 47 L35 47" />
        </g>
        <g stroke="url(#phyto-emblem-accent)" strokeOpacity=".65" strokeWidth=".8">
          <path d="M22 25 C39 29 39 36 22 40 C12 42.5 12 48 22 51" />
          <path d="M42 25 C25 29 25 36 42 40 C52 42.5 52 48 42 51" />
        </g>
      </g>
    </svg>
  );
}
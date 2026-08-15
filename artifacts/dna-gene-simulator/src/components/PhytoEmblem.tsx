import type { SVGProps } from 'react';

export default function PhytoEmblem(props: SVGProps<SVGSVGElement>) {
  return (
    <svg
      viewBox="0 0 64 64"
      role="img"
      aria-label="Phyto Athenix DNA emblem"
      xmlns="http://www.w3.org/2000/svg"
      {...props}
    >
      <defs>
        <radialGradient id="phyto-emblem-field" cx="50%" cy="46%" r="68%">
          <stop offset="0%" stopColor="#8b5cf6" stopOpacity=".9" />
          <stop offset="46%" stopColor="#5b21b6" stopOpacity=".72" />
          <stop offset="82%" stopColor="#24104f" stopOpacity=".96" />
          <stop offset="100%" stopColor="#0b061c" />
        </radialGradient>
        <filter id="phyto-emblem-halo" x="-90%" y="-90%" width="280%" height="280%">
          <feGaussianBlur stdDeviation="2.8" result="blur" />
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

      {/* Halo and field */}
      <circle cx="32" cy="32" r="28.5" fill="#8b5cf6" opacity=".22" filter="url(#phyto-emblem-halo)" />
      <circle cx="32" cy="32" r="25.5" fill="url(#phyto-emblem-field)" stroke="#a78bfa" strokeOpacity=".84" strokeWidth=".9" />
      <circle cx="32" cy="32" r="22.7" fill="none" stroke="#c4b5fd" strokeOpacity=".14" strokeWidth=".55" />

      {/* Near-black DNA silhouette with restrained internal highlights */}
      <g fill="none" strokeLinecap="round" strokeLinejoin="round" filter="url(#phyto-emblem-soft-glow)">
        <path
          d="M22 11 C39 16 39 24 22 32 C5 40 5 48 22 53"
          stroke="#120821"
          strokeWidth="4"
        />
        <path
          d="M42 11 C25 16 25 24 42 32 C59 40 59 48 42 53"
          stroke="#120821"
          strokeWidth="4"
        />
        <g stroke="#24133f" strokeWidth="1">
          <path d="M25 13.2 L39 13.2" />
          <path d="M20.5 19.7 L43.5 19.7" />
          <path d="M18.5 26 L45.5 26" />
          <path d="M18.5 32 L45.5 32" />
          <path d="M18.5 38 L45.5 38" />
          <path d="M20.5 44.3 L43.5 44.3" />
          <path d="M25 50.2 L39 50.2" />
        </g>
        <g stroke="#8b5cf6" strokeOpacity=".22" strokeWidth=".42">
          <path d="M22 11 C39 16 39 24 22 32 C5 40 5 48 22 53" />
          <path d="M42 11 C25 16 25 24 42 32 C59 40 59 48 42 53" />
        </g>
      </g>
    </svg>
  );
}
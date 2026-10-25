// Íconos de trazo del diseño (mismos paths que en Claude Design).
const PATHS = {
  user: 'M12 12a4 4 0 1 0 0-8 4 4 0 0 0 0 8z M4 21c1.5-4 4.5-6 8-6s6.5 2 8 6',
  search: 'M11 18a7 7 0 1 0 0-14 7 7 0 0 0 0 14z M20 20l-4-4',
  arrowRight: 'M5 12h14M13 6l6 6-6 6',
  arrowLeft: 'M19 12H5M11 6l-6 6 6 6',
  arrowUpRight: 'M7 17L17 7M8 7h9v9',
  pin: 'M12 22s7-6.5 7-12a7 7 0 0 0-14 0c0 5.5 7 12 7 12z M12 12.5a2.5 2.5 0 1 0 0-5 2.5 2.5 0 0 0 0 5z',
  check: 'M5 12l5 5L20 7',
  close: 'M6 6l12 12M18 6L6 18',
  plus: 'M12 5v14M5 12h14',
  edit: 'M4 20h4L19 9l-4-4L4 16zM14 6l4 4',
  trash: 'M4 7h16M10 11v6M14 11v6M6 7l1 13h10l1-13M9 7V4h6v3',
  logout: 'M10 4H5v16h5M14 8l4 4-4 4M18 12H9',
  logoutAlt: 'M15 4h4v16h-4M10 8l-4 4 4 4M6 12h10',
  eye: 'M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7S2 12 2 12z M12 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6z',
  eyeOff: 'M3 3l18 18M10.6 5.1A10.4 10.4 0 0 1 12 5c6.5 0 10 7 10 7a17 17 0 0 1-3.3 4.2M6.6 6.6C3.8 8.4 2 12 2 12s3.5 7 10 7a9.7 9.7 0 0 0 5.4-1.6M9.9 9.9a3 3 0 0 0 4.2 4.2',
  whatsapp: 'M21 12a9 9 0 0 1-13.5 7.8L3 21l1.3-4.4A9 9 0 1 1 21 12z',
  mail: 'M5 5h14a2 2 0 0 1 2 2v10a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V7a2 2 0 0 1 2-2z M3 7l9 6 9-6',
  phone: 'M5 4h4l2 5-2.5 1.5a11 11 0 0 0 5 5L15 13l5 2v4a2 2 0 0 1-2 2A16 16 0 0 1 3 6a2 2 0 0 1 2-2',
  instagram: 'M7 3h10a4 4 0 0 1 4 4v10a4 4 0 0 1-4 4H7a4 4 0 0 1-4-4V7a4 4 0 0 1 4-4z M12 16a4 4 0 1 0 0-8 4 4 0 0 0 0 8z M17.5 6.5h.01',
  facebook: 'M15 3h-3a4 4 0 0 0-4 4v3H5v4h3v7h4v-7h3l1-4h-4V7a1 1 0 0 1 1-1h3z',
  clock: 'M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18z M12 7v5l3 2',
  print: 'M6 9V3h12v6M6 18H4v-7h16v7h-2M8 14h8v7H8z',
  download: 'M12 4v12M6 10l6 6 6-6M4 20h16',
  upload: 'M12 16V4M7 9l5-5 5 5M4 20h16',
  alert: 'M12 8v5M12 17h.01M10.3 3.9L2.4 18a2 2 0 0 0 1.7 3h15.8a2 2 0 0 0 1.7-3L13.7 3.9a2 2 0 0 0-3.4 0z',
  calendar: 'M8 3v4M16 3v4M3 9h18M5 5h14v16H5z',
  message: 'M4 5h16v11H8l-4 4z',
  trend: 'M3 17l6-6 4 4 8-8M15 7h6v6',
  area: 'M3 3h18v18H3z M3 9h18M9 21V9',
  bed: 'M3 18V8M3 14h18v4M21 14v-2a3 3 0 0 0-3-3h-7v5',
  bath: 'M4 12h16v3a5 5 0 0 1-5 5H9a5 5 0 0 1-5-5zM6 12V5a2 2 0 0 1 4 0',
  home: 'M3 11l9-7 9 7M5 9v11h14V9',
  homePlus: 'M3 11l9-7 9 7M5 9v11h14V9M12 11v6M9 14h6',
  building: 'M4 21V5l8-3 8 3v16M9 21v-4h6v4M8 8h.01M12 8h.01M16 8h.01M8 12h.01M12 12h.01M16 12h.01',
  file: 'M14 3H6v18h12V7z M14 3v4h4 M9 13h6M9 17h6',
  wallet: 'M3 7h18v13H3z M3 7l3-4h12l3 4 M16 14h2',
  grid: 'M4 4h7v7H4z M13 4h7v7h-7z M4 13h7v7H4z M13 13h7v7h-7z',
  menu: 'M4 7h16M4 12h16M4 17h16',
  install: 'M12 3v12M7 10l5 5 5-5M5 21h14',
  wifiOff: 'M3 3l18 18M8.5 16.5a5 5 0 0 1 7 0M5 13a10 10 0 0 1 5.2-2.8M19 13a10 10 0 0 0-2-1.5M2 8.8a15 15 0 0 1 4.2-2.6M22 8.8A15 15 0 0 0 12 5c-.9 0-1.8.1-2.6.2M12 20h.01',
  refresh: 'M20 11a8 8 0 0 0-14.9-3.9L4 9 M4 4v5h5 M4 13a8 8 0 0 0 14.9 3.9L20 15 M20 20v-5h-5',
} as const

export type IconName = keyof typeof PATHS

interface Props {
  name: IconName
  size?: number
  stroke?: string
  width?: number
  className?: string
  label?: string
}

export function Icon({ name, size = 18, stroke = 'currentColor', width = 2, className, label }: Props) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke={stroke}
      strokeWidth={width}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden={label ? undefined : true}
      role={label ? 'img' : undefined}
      aria-label={label}
      style={{ flex: '0 0 auto' }}
    >
      <path d={PATHS[name]} />
    </svg>
  )
}

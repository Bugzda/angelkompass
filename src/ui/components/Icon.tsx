import { useId, type SVGProps } from 'react'

export type IconName =
  | 'home'
  | 'new-session'
  | 'inventory'
  | 'history'
  | 'theme-system'
  | 'theme-light'
  | 'theme-dark'
  | 'status-online'
  | 'status-offline'
  | 'arrow-left'
  | 'arrow-right'
  | 'chevron-down'
  | 'plus'
  | 'check'
  | 'close'
  | 'update'
  | 'download'
  | 'search'
  | 'screen'
  | 'vibrate'
  | 'touch'
  | 'timer'
  | 'note'
  | 'chart'
  | 'pin'
  | 'trash'
  | 'drop'
  | 'drop-half'
  | 'drop-full'
  | 'cloud'
  | 'weed'
  | 'depth-shallow'
  | 'depth-medium'
  | 'depth-deep'
  | 'thermo'
  | 'fish'
  | 'eye'
  | 'help'
  | 'wind'
  | 'gauge'
  | 'share'
  | 'shield'

type SvgComponentProps = Omit<SVGProps<SVGSVGElement>, 'children' | 'height' | 'title' | 'width'>

export type IconProps = SvgComponentProps & {
  name: IconName
  size?: number | string
  title?: string
}

function IconGlyph({ name }: Pick<IconProps, 'name'>) {
  switch (name) {
    case 'screen':
      return (
        <>
          <rect x="7" y="3" width="10" height="18" rx="2.2" />
          <path d="M11 18h2M3.5 8.5l1.5.8M3.5 15.5l1.5-.8M20.5 8.5l-1.5.8M20.5 15.5l-1.5-.8" />
        </>
      )
    case 'vibrate':
      return (
        <>
          <rect x="8" y="5" width="8" height="14" rx="1.8" />
          <path d="M4.5 9v6M19.5 9v6M2 10.5v3M22 10.5v3" />
        </>
      )
    case 'touch':
      return (
        <>
          <circle cx="12" cy="12" r="8.5" />
          <circle cx="12" cy="12" r="3.5" />
        </>
      )
    case 'timer':
      return (
        <>
          <circle cx="12" cy="13.5" r="7.5" />
          <path d="M12 9.5v4l2.5 1.5M9.5 3h5" />
        </>
      )
    case 'note':
      return (
        <>
          <path d="M5 4h10l4 4v12H5z" />
          <path d="M15 4v4h4M8.5 12.5h7M8.5 16h5" />
        </>
      )
    case 'chart':
      return (
        <>
          <path d="M4 20h16M7 16v-5M12 16V7M17 16v-8" />
        </>
      )
    case 'pin':
      return (
        <>
          <path d="M12 21s-6.5-5.6-6.5-11a6.5 6.5 0 0 1 13 0c0 5.4-6.5 11-6.5 11Z" />
          <circle cx="12" cy="10" r="2.4" />
        </>
      )
    case 'trash':
      return (
        <>
          <path d="M4.5 7h15M9.5 7V4.5h5V7M6.5 7l1 13h9l1-13" />
        </>
      )
    case 'drop':
      return (
        <>
          <path d="M12 3.5s-6 6.6-6 11a6 6 0 0 0 12 0c0-4.4-6-11-6-11Z" />
        </>
      )
    case 'drop-half':
      return (
        <>
          <path d="M12 3.5s-6 6.6-6 11a6 6 0 0 0 12 0c0-4.4-6-11-6-11Z" />
          <path d="M6.3 15.5h11.4" />
        </>
      )
    case 'drop-full':
      return (
        <>
          <path d="M12 3.5s-6 6.6-6 11a6 6 0 0 0 12 0c0-4.4-6-11-6-11Z" fill="currentColor" fillOpacity=".35" />
        </>
      )
    case 'cloud':
      return (
        <>
          <path d="M7.5 18.5h9.5a4 4 0 0 0 .4-8 5.5 5.5 0 0 0-10.6 1.5 3.3 3.3 0 0 0 .7 6.5Z" />
        </>
      )
    case 'weed':
      return (
        <>
          <path d="M12 21V9M12 13c-3 0-5-2-5-5M12 11c3 0 5-2 5-5M8 21c0-3 1.5-5 4-6M16 21c0-3-1.5-5-4-6" />
        </>
      )
    case 'depth-shallow':
      return (
        <>
          <path d="M3 7h18M7 11h10" />
        </>
      )
    case 'depth-medium':
      return (
        <>
          <path d="M3 6h18M7 10h10M9 14h6" />
        </>
      )
    case 'depth-deep':
      return (
        <>
          <path d="M3 5h18M7 9h10M9 13h6M11 17h2" />
        </>
      )
    case 'thermo':
      return (
        <>
          <path d="M10 14.5V5a2 2 0 0 1 4 0v9.5a4 4 0 1 1-4 0Z" />
          <path d="M12 9v7" />
        </>
      )
    case 'fish':
      return (
        <>
          <path d="M3 12c3-4 7.5-5.5 12-3.5L20 5v14l-5-3.5C10.5 17.5 6 16 3 12Z" />
          <circle cx="8" cy="11" r=".8" fill="currentColor" />
        </>
      )
    case 'eye':
      return (
        <>
          <path d="M2.5 12S6 5.5 12 5.5 21.5 12 21.5 12 18 18.5 12 18.5 2.5 12 2.5 12Z" />
          <circle cx="12" cy="12" r="3" />
        </>
      )
    case 'help':
      return (
        <>
          <circle cx="12" cy="12" r="8.5" />
          <path d="M9.6 9.4a2.5 2.5 0 0 1 4.8 1c0 1.7-2.4 2-2.4 3.6M12 17h.01" />
        </>
      )
    case 'wind':
      return (
        <>
          <path d="M3 9h11a2.5 2.5 0 1 0-2.5-2.5M3 13h15a2.5 2.5 0 1 1-2.5 2.5M3 17h7" />
        </>
      )
    case 'gauge':
      return (
        <>
          <path d="M4.5 17a8.5 8.5 0 1 1 15 0" />
          <path d="m12 13 3.5-4" />
        </>
      )
    case 'share':
      return (
        <>
          <path d="M12 15V3m-4 4 4-4 4 4M8 11H5v10h14V11h-3" />
        </>
      )
    case 'shield':
      return (
        <>
          <path d="M12 3 5 6v5c0 4.5 3 8.3 7 10 4-1.7 7-5.5 7-10V6z" />
          <path d="m9 12 2 2 4-4" />
        </>
      )
    case 'download':
      return (
        <>
          <path d="M12 3v12m-5-5 5 5 5-5M4 16v5h16v-5" />
        </>
      )
    case 'search':
      return (
        <>
          <circle cx="10.5" cy="10.5" r="6.5" />
          <path d="m16 16 5 5" />
        </>
      )
    case 'home':
      return (
        <>
          <path d="m4 10.8 8-6.5 8 6.5" />
          <path d="M6.5 9.3v9.9h11V9.3M9.5 19.2v-5.8h5v5.8" />
        </>
      )
    case 'new-session':
      return (
        <>
          <circle cx="10.5" cy="13" r="6.7" />
          <path d="m13.2 9.6-1.5 4.5-4.4 2 1.5-4.6 4.4-1.9Z" />
          <path d="M18.5 3.5v5M16 6h5" />
        </>
      )
    case 'inventory':
      return (
        <>
          <path d="M8.3 7.5V6.2A2.2 2.2 0 0 1 10.5 4h3A2.2 2.2 0 0 1 15.7 6.2v1.3" />
          <path d="M4 7.5h16v11.8H4zM4 11.5h16M9.5 11.5v2h5v-2" />
        </>
      )
    case 'history':
      return (
        <>
          <path d="M5.2 7.2A8.2 8.2 0 1 1 4 14" />
          <path d="M3.7 4v4h4M12 7.7V12l3 2" />
        </>
      )
    case 'theme-system':
      return (
        <>
          <circle cx="12" cy="12" r="8" />
          <path d="M12 4a8 8 0 0 1 0 16Z" fill="currentColor" stroke="none" />
        </>
      )
    case 'theme-light':
      return (
        <>
          <circle cx="12" cy="12" r="3.5" />
          <path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4" />
        </>
      )
    case 'theme-dark':
      return <path d="M20.2 15.2A8.3 8.3 0 0 1 8.8 3.8a8.3 8.3 0 1 0 11.4 11.4Z" />
    case 'status-online':
      return (
        <>
          <path d="M5.2 9.6a9.7 9.7 0 0 1 13.6 0M8.2 12.7a5.4 5.4 0 0 1 7.6 0" />
          <circle cx="12" cy="16.8" r="1" fill="currentColor" stroke="none" />
        </>
      )
    case 'status-offline':
      return (
        <>
          <path d="M7.1 8.3a9.7 9.7 0 0 1 11.7 1.3M5.2 9.6l.7-.6M8.2 12.7a5.4 5.4 0 0 1 6.8-.6M12 16.8h.01M4 4l16 16" />
        </>
      )
    case 'arrow-left':
      return (
        <>
          <path d="M20 12H5M10.5 6.5 5 12l5.5 5.5" />
        </>
      )
    case 'arrow-right':
      return (
        <>
          <path d="M4 12h15M13.5 6.5 19 12l-5.5 5.5" />
        </>
      )
    case 'chevron-down':
      return <path d="m6.5 9 5.5 5.5L17.5 9" />
    case 'plus':
      return <path d="M12 5v14M5 12h14" />
    case 'check':
      return <path d="m4.8 12.4 4.4 4.4L19.5 6.5" />
    case 'close':
      return <path d="m6 6 12 12M18 6 6 18" />
    case 'update':
      return (
        <>
          <path d="M19.3 8A8 8 0 1 0 20 14" />
          <path d="M19.5 3.8V8h-4.2" />
        </>
      )
  }
}

/**
 * A small, dependency-free line icon. Icons are decorative by default. Pass a
 * `title` or `aria-label` when the icon itself is the only accessible label.
 */
export function Icon({
  name,
  size = 24,
  title,
  role,
  'aria-hidden': ariaHidden,
  'aria-label': ariaLabel,
  'aria-labelledby': ariaLabelledBy,
  ...svgProps
}: IconProps) {
  const titleId = useId()
  const hasAccessibleName = Boolean(title || ariaLabel || ariaLabelledBy)

  return (
    <svg
      {...svgProps}
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      width={size}
      height={size}
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      focusable="false"
      role={role ?? (hasAccessibleName ? 'img' : undefined)}
      aria-hidden={ariaHidden ?? (hasAccessibleName ? undefined : true)}
      aria-label={title ? undefined : ariaLabel}
      aria-labelledby={title ? titleId : ariaLabelledBy}
    >
      {title && <title id={titleId}>{title}</title>}
      <IconGlyph name={name} />
    </svg>
  )
}

export type BrandMarkProps = SvgComponentProps & {
  size?: number | string
  title?: string
}

/** Compass needle meeting two calm water lines; all artwork follows currentColor. */
export function BrandMark({
  size = 32,
  title,
  role,
  'aria-hidden': ariaHidden,
  'aria-label': ariaLabel,
  'aria-labelledby': ariaLabelledBy,
  ...svgProps
}: BrandMarkProps) {
  const titleId = useId()
  const hasAccessibleName = Boolean(title || ariaLabel || ariaLabelledBy)

  return (
    <svg
      {...svgProps}
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 48 48"
      width={size}
      height={size}
      fill="none"
      focusable="false"
      role={role ?? (hasAccessibleName ? 'img' : undefined)}
      aria-hidden={ariaHidden ?? (hasAccessibleName ? undefined : true)}
      aria-label={title ? undefined : ariaLabel}
      aria-labelledby={title ? titleId : ariaLabelledBy}
    >
      {title && <title id={titleId}>{title}</title>}
      <path
        d="M24 4.5 30.2 21.7 24 27l-6.2-5.3L24 4.5Z"
        stroke="currentColor"
        strokeWidth="2.2"
        strokeLinejoin="round"
      />
      <path d="M24 7.2V25l-4.3-3.8L24 7.2Z" fill="currentColor" />
      <path
        d="M5 32c4.75 0 4.75-2.5 9.5-2.5S19.25 32 24 32s4.75-2.5 9.5-2.5S38.25 32 43 32M8 39c4 0 4-2 8-2s4 2 8 2 4-2 8-2 4 2 8 2"
        stroke="currentColor"
        strokeWidth="2.2"
        strokeLinecap="round"
      />
    </svg>
  )
}

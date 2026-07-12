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

type SvgComponentProps = Omit<
  SVGProps<SVGSVGElement>,
  'children' | 'height' | 'title' | 'width'
>

export type IconProps = SvgComponentProps & {
  name: IconName
  size?: number | string
  title?: string
}

function IconGlyph({ name }: Pick<IconProps, 'name'>) {
  switch (name) {
    case 'home':
      return <>
        <path d="m4 10.8 8-6.5 8 6.5" />
        <path d="M6.5 9.3v9.9h11V9.3M9.5 19.2v-5.8h5v5.8" />
      </>
    case 'new-session':
      return <>
        <circle cx="10.5" cy="13" r="6.7" />
        <path d="m13.2 9.6-1.5 4.5-4.4 2 1.5-4.6 4.4-1.9Z" />
        <path d="M18.5 3.5v5M16 6h5" />
      </>
    case 'inventory':
      return <>
        <path d="M8.3 7.5V6.2A2.2 2.2 0 0 1 10.5 4h3A2.2 2.2 0 0 1 15.7 6.2v1.3" />
        <path d="M4 7.5h16v11.8H4zM4 11.5h16M9.5 11.5v2h5v-2" />
      </>
    case 'history':
      return <>
        <path d="M5.2 7.2A8.2 8.2 0 1 1 4 14" />
        <path d="M3.7 4v4h4M12 7.7V12l3 2" />
      </>
    case 'theme-system':
      return <>
        <circle cx="12" cy="12" r="8" />
        <path d="M12 4a8 8 0 0 1 0 16Z" fill="currentColor" stroke="none" />
      </>
    case 'theme-light':
      return <>
        <circle cx="12" cy="12" r="3.5" />
        <path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4" />
      </>
    case 'theme-dark':
      return <path d="M20.2 15.2A8.3 8.3 0 0 1 8.8 3.8a8.3 8.3 0 1 0 11.4 11.4Z" />
    case 'status-online':
      return <>
        <path d="M5.2 9.6a9.7 9.7 0 0 1 13.6 0M8.2 12.7a5.4 5.4 0 0 1 7.6 0" />
        <circle cx="12" cy="16.8" r="1" fill="currentColor" stroke="none" />
      </>
    case 'status-offline':
      return <>
        <path d="M7.1 8.3a9.7 9.7 0 0 1 11.7 1.3M5.2 9.6l.7-.6M8.2 12.7a5.4 5.4 0 0 1 6.8-.6M12 16.8h.01M4 4l16 16" />
      </>
    case 'arrow-left':
      return <>
        <path d="M20 12H5M10.5 6.5 5 12l5.5 5.5" />
      </>
    case 'arrow-right':
      return <>
        <path d="M4 12h15M13.5 6.5 19 12l-5.5 5.5" />
      </>
    case 'chevron-down':
      return <path d="m6.5 9 5.5 5.5L17.5 9" />
    case 'plus':
      return <path d="M12 5v14M5 12h14" />
    case 'check':
      return <path d="m4.8 12.4 4.4 4.4L19.5 6.5" />
    case 'close':
      return <path d="m6 6 12 12M18 6 6 18" />
    case 'update':
      return <>
        <path d="M19.3 8A8 8 0 1 0 20 14" />
        <path d="M19.5 3.8V8h-4.2" />
      </>
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

  return <svg
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

  return <svg
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
}

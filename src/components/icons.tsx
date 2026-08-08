import type { SVGProps } from "react";

type IconProps = SVGProps<SVGSVGElement>;

export function SearchIcon(props: IconProps) {
  return <svg viewBox="0 0 24 24" fill="none" aria-hidden="true" {...props}><circle cx="11" cy="11" r="7" stroke="currentColor" strokeWidth="1.8"/><path d="m16.2 16.2 4 4" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/></svg>;
}

export function PhoneIcon(props: IconProps) {
  return <svg viewBox="0 0 24 24" fill="none" aria-hidden="true" {...props}><path d="M7.2 3.5 4.8 5.3c-.7.5-.9 1.5-.5 2.3 2.7 5.6 6.5 9.4 12.1 12.1.8.4 1.8.2 2.3-.5l1.8-2.4-4.6-3-1.7 1.7c-2.5-1.2-4.5-3.2-5.7-5.7l1.7-1.7-3-4.6Z" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round"/></svg>;
}

export function GlobeIcon(props: IconProps) {
  return <svg viewBox="0 0 24 24" fill="none" aria-hidden="true" {...props}><circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="1.6"/><path d="M3 12h18M12 3c2.2 2.5 3.3 5.5 3.3 9S14.2 18.5 12 21c-2.2-2.5-3.3-5.5-3.3-9S9.8 5.5 12 3Z" stroke="currentColor" strokeWidth="1.6"/></svg>;
}

export function CartIcon(props: IconProps) {
  return <svg viewBox="0 0 24 24" fill="none" aria-hidden="true" {...props}><path d="M3 4h2l2.1 10.1a2 2 0 0 0 2 1.6h7.8a2 2 0 0 0 1.9-1.4L21 7H6" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/><circle cx="9" cy="20" r="1.4" fill="currentColor"/><circle cx="18" cy="20" r="1.4" fill="currentColor"/></svg>;
}

export function PlusIcon(props: IconProps) {
  return <svg viewBox="0 0 24 24" fill="none" aria-hidden="true" {...props}><circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="1.7"/><path d="M8 12h8M12 8v8" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round"/></svg>;
}

export function MinusIcon(props: IconProps) {
  return <svg viewBox="0 0 24 24" fill="none" aria-hidden="true" {...props}><circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="1.7"/><path d="M8 12h8" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round"/></svg>;
}

export function CloseIcon(props: IconProps) {
  return <svg viewBox="0 0 24 24" fill="none" aria-hidden="true" {...props}><path d="m6 6 12 12M18 6 6 18" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round"/></svg>;
}

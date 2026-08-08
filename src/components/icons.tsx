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

export function DeliveryIcon(props: IconProps) {
  return <svg viewBox="0 0 64 64" fill="none" aria-hidden="true" {...props}><path d="M8 16h31v30H8V16Z" fill="#FFD34E" stroke="#20252B" strokeWidth="3" strokeLinejoin="round"/><path d="M39 26h9l8 10v10H39V26Z" fill="#FFF2B7" stroke="#20252B" strokeWidth="3" strokeLinejoin="round"/><path d="M45 28v9h10" stroke="#20252B" strokeWidth="3" strokeLinejoin="round"/><circle cx="20" cy="48" r="6" fill="#FFF" stroke="#20252B" strokeWidth="3"/><circle cx="47" cy="48" r="6" fill="#FFF" stroke="#20252B" strokeWidth="3"/><path d="M14 24h15M14 31h11" stroke="#20252B" strokeWidth="3" strokeLinecap="round"/></svg>;
}

export function PickupIcon(props: IconProps) {
  return <svg viewBox="0 0 64 64" fill="none" aria-hidden="true" {...props}><path d="M12 25h40v30H12V25Z" fill="#FFF" stroke="#20252B" strokeWidth="3"/><path d="m9 25 5-14h36l5 14" fill="#FFD34E" stroke="#20252B" strokeWidth="3" strokeLinejoin="round"/><path d="M9 25c0 5 8 5 8 0 0 5 8 5 8 0 0 5 8 5 8 0 0 5 8 5 8 0 0 5 8 5 8 0 0 5 8 5 8 0" fill="#FFF2B7" stroke="#20252B" strokeWidth="3" strokeLinejoin="round"/><path d="M22 55V39h20v16" stroke="#20252B" strokeWidth="3"/></svg>;
}

export function LocationIcon(props: IconProps) {
  return <svg viewBox="0 0 24 24" fill="none" aria-hidden="true" {...props}><path d="M20 10c0 5.5-8 11-8 11S4 15.5 4 10a8 8 0 1 1 16 0Z" stroke="currentColor" strokeWidth="1.7"/><circle cx="12" cy="10" r="2.5" stroke="currentColor" strokeWidth="1.7"/></svg>;
}

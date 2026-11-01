type ProductWhatsAppButtonProps = {
  href: string | null;
  label: string;
  className?: string;
};

export function ProductWhatsAppButton({
  href,
  label,
  className = "",
}: ProductWhatsAppButtonProps) {
  if (!href) {
    return (
      <p className={`text-sm text-foreground/65 ${className}`}>
        Set NEXT_PUBLIC_WHATSAPP_NUMBER in .env.local to enable WhatsApp orders.
      </p>
    );
  }

  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className={`inline-flex min-h-11 w-full items-center justify-center border border-accent bg-accent px-5 py-3 text-center text-sm text-background transition-opacity duration-200 hover:opacity-90 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent ${className}`}
    >
      {label}
    </a>
  );
}

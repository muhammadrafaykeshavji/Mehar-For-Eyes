// Global fallback declarations for Next.js 16 Route Types in CI environments
// when next dev/build has not generated .next/types yet.

declare global {
  type PageProps<_T = string> = {
    params: Promise<Record<string, string>>;
    searchParams: Promise<Record<string, string | string[] | undefined>>;
  };

  type LayoutProps<_T = string> = {
    children: React.ReactNode;
    params?: Promise<Record<string, string>>;
  };
}

export {};

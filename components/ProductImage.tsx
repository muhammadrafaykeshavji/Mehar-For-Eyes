import Image, { type ImageProps } from "next/image";

type ProductImageProps = Omit<ImageProps, "src" | "alt"> & {
  src: string;
  alt: string;
};

export function ProductImage({ src, alt, ...props }: ProductImageProps) {
  const unoptimized =
    src.endsWith(".svg") || src.startsWith("/uploads/") || props.unoptimized;

  return <Image src={src} alt={alt} {...props} unoptimized={unoptimized} />;
}

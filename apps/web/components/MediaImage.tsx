import type { ImgHTMLAttributes } from "react";
import type { MediaAsset, MediaVariant } from "@company/contracts";

export type MediaSource = {
  src: string;
  srcSet?: string;
  sizes?: string;
};

const defaultSizes = "(max-width: 640px) 100vw, (max-width: 1200px) 50vw, 1200px";
const isLocalMediaUrl = (url: string) => url.startsWith("/") && !url.startsWith("//");

function uniqueVariants(variants: MediaVariant[] | undefined) {
  const byWidth = new Map<number, MediaVariant>();
  for (const variant of variants || []) {
    if (!variant.url || !isLocalMediaUrl(variant.url) || !variant.width || !variant.height) continue;
    byWidth.set(variant.width, variant);
  }
  return [...byWidth.values()].sort((left, right) => left.width - right.width);
}

export function mediaSource(media?: MediaAsset, fallback = ""): MediaSource {
  const variants = uniqueVariants(media?.variants);
  const mediaUrl = media?.url && isLocalMediaUrl(media.url) ? media.url : "";
  const safeFallback = isLocalMediaUrl(fallback) ? fallback : "";
  return {
    src: mediaUrl || variants[variants.length - 1]?.url || safeFallback,
    ...(variants.length > 0 ? {
      srcSet: variants.map(variant => `${variant.url} ${variant.width}w`).join(", "),
      sizes: defaultSizes,
    } : {}),
  };
}

type MediaImageProps = Omit<ImgHTMLAttributes<HTMLImageElement>, "src" | "srcSet" | "sizes" | "alt"> & {
  media?: MediaAsset;
  url?: string;
  alt: string;
  caption?: string;
  lightbox?: boolean;
};

export function MediaImage({ media, url, alt, caption, lightbox = false, ...props }: MediaImageProps) {
  const source = mediaSource(media, url || "");
  const lightboxSource = source.src;
  return <img
    {...props}
    src={source.src}
    {...(source.srcSet ? { srcSet: source.srcSet, sizes: source.sizes } : {})}
    alt={alt}
    {...(lightbox ? { "data-lightbox": true, "data-lightbox-src": lightboxSource, "data-lightbox-alt": alt, "data-lightbox-caption": caption || "" } : {})}
  />;
}

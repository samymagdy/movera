"use client";

import { useEffect, useState, type ReactNode } from "react";

type LightboxImage = {
  src: string;
  alt: string;
  caption: string;
};

function imageFromTarget(target: EventTarget | null) {
  if (!(target instanceof Element)) return null;
  const image = target.closest("img[data-lightbox]");
  return image instanceof HTMLImageElement ? image : null;
}

function readImage(image: HTMLImageElement): LightboxImage | null {
  const src = image.dataset.lightboxSrc || image.currentSrc || image.src;
  if (!src) return null;
  return {
    src,
    alt: image.dataset.lightboxAlt || image.alt || "Image preview",
    caption: image.dataset.lightboxCaption || "",
  };
}

export function ImageLightboxProvider({ children }: { children: ReactNode }) {
  const [selectedImage, setSelectedImage] = useState<LightboxImage | null>(null);

  useEffect(() => {
    const handleClick = (event: MouseEvent) => {
      const image = imageFromTarget(event.target);
      if (!image) return;
      const nextImage = readImage(image);
      if (!nextImage) return;

      // Detail images can also be wrapped by a card/link template. The image
      // itself opens the preview; the surrounding page navigation remains intact.
      event.preventDefault();
      event.stopPropagation();
      setSelectedImage(nextImage);
    };

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key !== "Enter" && event.key !== " ") return;
      const image = imageFromTarget(event.target);
      if (!image) return;
      const nextImage = readImage(image);
      if (!nextImage) return;
      event.preventDefault();
      event.stopPropagation();
      setSelectedImage(nextImage);
    };

    document.addEventListener("click", handleClick, true);
    document.addEventListener("keydown", handleKeyDown, true);
    return () => {
      document.removeEventListener("click", handleClick, true);
      document.removeEventListener("keydown", handleKeyDown, true);
    };
  }, []);

  useEffect(() => {
    if (!selectedImage) return;
    const previousOverflow = document.body.style.overflow;
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") setSelectedImage(null);
    };
    document.body.style.overflow = "hidden";
    document.addEventListener("keydown", closeOnEscape);
    return () => {
      document.body.style.overflow = previousOverflow;
      document.removeEventListener("keydown", closeOnEscape);
    };
  }, [selectedImage]);

  return <>
    {children}
    {selectedImage && <div className="image-lightbox-backdrop" role="presentation" onMouseDown={event => { if (event.target === event.currentTarget) setSelectedImage(null); }}>
      <div className="image-lightbox-dialog" role="dialog" aria-modal="true" aria-label="Image preview">
        <button type="button" className="image-lightbox-close" onClick={() => setSelectedImage(null)} aria-label="Close image preview">×</button>
        <img className="image-lightbox-image" src={selectedImage.src} alt={selectedImage.alt} />
        {(selectedImage.caption || selectedImage.alt) && <p className="image-lightbox-caption">{selectedImage.caption || selectedImage.alt}</p>}
      </div>
    </div>}
  </>;
}

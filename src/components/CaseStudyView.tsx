"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { PortableText, type PortableTextComponents } from "@portabletext/react";
import type { PortableTextBlock } from "@portabletext/types";

import type {
  AccordionEntry,
  Appearance,
  DeviceTab,
  GalleryImage,
  MediaItem,
  PaddingToken,
  SanityColor,
  Section,
  StatItem,
  Study,
  StudyCard,
} from "@/sanity/types";

/**
 * Sanity-driven case-study renderer. Iterates `project.sections` (a page
 * builder) and renders each block, honoring the shared `appearance` controls
 * (background / text colour, padding, alignment, width). Visual language
 * (labels, accordions, count-up stats, cover-flow slider, device tabs,
 * load-more grids, "Next up" band) is carried over from the previous
 * hard-coded template.
 */

const SANS = "Helvetica, Arial, sans-serif";
const RED = "#e06164";
const SAGE = "#99B29D66";
const TEAL = "#52747e";
const TILE = "#4f6b76";

// ── appearance helpers ───────────────────────────────────────────────────────
function hexToRgb(hex: string) {
  const h = hex.replace("#", "");
  const full = h.length === 3 ? h.split("").map((c) => c + c).join("") : h;
  const int = parseInt(full.slice(0, 6), 16);
  return { r: (int >> 16) & 255, g: (int >> 8) & 255, b: int & 255 };
}

function colorToCss(c?: SanityColor): string | undefined {
  if (!c?.hex) return undefined;
  const a = c.alpha ?? 1;
  if (a >= 1) return c.hex;
  const { r, g, b } = hexToRgb(c.hex);
  return `rgba(${r}, ${g}, ${b}, ${a})`;
}

const PAD_T: Record<PaddingToken, string> = {
  none: "pt-0",
  sm: "pt-8",
  md: "pt-[60px] xl:pt-[5vw]",
  lg: "pt-24 xl:pt-[7vw]",
  xl: "pt-32 xl:pt-[9vw]",
};
const PAD_B: Record<PaddingToken, string> = {
  none: "pb-0",
  sm: "pb-8",
  md: "pb-[60px] xl:pb-[5vw]",
  lg: "pb-24 xl:pb-[7vw]",
  xl: "pb-32 xl:pb-[9vw]",
};
const MAXW = {
  narrow: "max-w-[640px]",
  default: "max-w-[1140px]",
  wide: "max-w-[1440px]",
  full: "max-w-none",
};
const ALIGN = { left: "text-left", center: "text-center", right: "text-right" };

function bandStyle(a?: Appearance, defaultBg?: string, defaultLight?: boolean) {
  const style: React.CSSProperties = {};
  const bg = colorToCss(a?.backgroundColor) ?? defaultBg;
  if (bg) style.backgroundColor = bg;
  const tc = colorToCss(a?.textColor) ?? (defaultLight ? "#ffffff" : undefined);
  if (tc) style.color = tc;
  return style;
}

function padClasses(a?: Appearance, natural: PaddingToken = "md") {
  return `${PAD_T[a?.paddingTop ?? natural]} ${PAD_B[a?.paddingBottom ?? natural]}`;
}

/** True when a band should treat its text as light (for default label colour). */
function isLight(a?: Appearance, defaultLight?: boolean) {
  if (a?.textColor?.hex) return hexToRgb(a.textColor.hex).r < 140;
  const bg = a?.backgroundColor;
  if (bg?.hex && (bg.alpha ?? 1) > 0.5) {
    const { r, g, b } = hexToRgb(bg.hex);
    return (r * 299 + g * 587 + b * 114) / 1000 < 140;
  }
  return !!defaultLight;
}

// ── Portable Text ────────────────────────────────────────────────────────────
const ptComponents: PortableTextComponents = {
  block: {
    normal: ({ children }) => <p>{children}</p>,
    h3: ({ children }) => <h3 className="text-[1.1em] font-semibold">{children}</h3>,
    blockquote: ({ children }) => (
      <blockquote className="border-l-2 border-current/40 pl-4 italic">{children}</blockquote>
    ),
  },
  list: {
    bullet: ({ children }) => <ul className="list-disc space-y-3 pl-5">{children}</ul>,
    number: ({ children }) => <ol className="list-decimal space-y-3 pl-5">{children}</ol>,
  },
  listItem: {
    bullet: ({ children }) => <li>{children}</li>,
    number: ({ children }) => <li>{children}</li>,
  },
  marks: {
    strong: ({ children }) => <strong className="font-bold">{children}</strong>,
    em: ({ children }) => <em className="italic">{children}</em>,
    link: ({ children, value }) => (
      <a
        href={value?.href}
        target="_blank"
        rel="noopener noreferrer"
        data-cursor="hover"
        className="underline underline-offset-2 transition-colors hover:text-accent"
      >
        {children}
      </a>
    ),
  },
};

function Prose({
  value,
  className = "",
}: {
  value?: PortableTextBlock[];
  className?: string;
}) {
  if (!value?.length) return null;
  return (
    <div className={`space-y-5 ${className}`}>
      <PortableText value={value} components={ptComponents} />
    </div>
  );
}

// ── main component ────────────────────────────────────────────────────────────
export default function CaseStudyView({
  project: p,
  prev,
  next,
  variant,
  onClose,
  onNavigate,
}: {
  project: Study;
  prev: StudyCard;
  next: StudyCard;
  variant: "page" | "overlay";
  onClose?: () => void;
  onNavigate?: (slug: string) => void;
}) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const overlay = variant === "overlay";

  useEffect(() => {
    if (!overlay) return;
    scrollRef.current?.scrollTo({ top: 0 });
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose?.();
    };
    document.addEventListener("keydown", onKey);
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = prevOverflow;
    };
  }, [overlay, onClose, p.slug]);

  // Scroll-reveal: tag each <section> once it enters view.
  useEffect(() => {
    const root = scrollRef.current;
    if (!root) return;
    const sections = Array.from(root.querySelectorAll("section"));
    if (window.matchMedia?.("(prefers-reduced-motion: reduce)").matches) {
      sections.forEach((s) => s.classList.add("cs-active"));
      return;
    }
    const reveal = (s: Element) => s.classList.add("cs-active");
    const io = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            reveal(entry.target);
            io.unobserve(entry.target);
          }
        }
      },
      { threshold: 0, rootMargin: "0px 0px -10% 0px", root: overlay ? root : null },
    );
    sections.forEach((s) => io.observe(s));

    const scroller: HTMLElement | Window = overlay ? root : window;
    const onScroll = () => {
      const vh = overlay ? root.clientHeight : window.innerHeight;
      const rootTop = overlay ? root.getBoundingClientRect().top : 0;
      for (const s of sections) {
        if (s.classList.contains("cs-active")) continue;
        const top = s.getBoundingClientRect().top - rootTop;
        if (top < vh * 0.9) reveal(s);
      }
    };
    scroller.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
    return () => {
      io.disconnect();
      scroller.removeEventListener("scroll", onScroll);
    };
  }, [p.slug, overlay]);

  const nextImg = next.heroImage ?? next.image;

  const goTo = (slug: string) => (e: React.MouseEvent) => {
    if (onNavigate) {
      e.preventDefault();
      onNavigate(slug);
    }
  };

  const inner = (
    <>
      <div className="sticky top-0 z-50 flex items-center justify-between gap-4 bg-white px-6 py-3.5 xl:px-10">
        <nav aria-label="Breadcrumb" className="flex items-center gap-2 font-grotesk text-[15px] xl:text-[17px]">
          {overlay ? (
            <button type="button" onClick={onClose} data-cursor="hover" className="text-black/55 transition-colors hover:text-black">
              Work
            </button>
          ) : (
            <Link href="/work" data-cursor="hover" className="text-black/55 transition-colors hover:text-black">
              Work
            </Link>
          )}
          <span aria-hidden className="text-black/35">/</span>
          <span aria-current="page" className="underline underline-offset-4">{p.name}</span>
        </nav>
        {overlay ? (
          <button type="button" onClick={onClose} aria-label="Close" data-cursor="hover" className="font-grotesk text-[26px] leading-none text-black transition-transform hover:scale-110">
            ×
          </button>
        ) : (
          <Link href="/work" aria-label="Close" data-cursor="hover" className="font-grotesk text-[26px] leading-none text-black transition-transform hover:scale-110">
            ×
          </Link>
        )}
      </div>

      {p.sections?.map((section) => (
        <SectionBlock key={section._key} section={section} project={p} />
      ))}

      <NextUp next={next} image={nextImg} onNavigate={onNavigate} scrollRoot={overlay ? scrollRef : undefined} />

      <div className="sticky bottom-0 z-50 border-t border-black/10 bg-white py-5">
        <div className="mx-auto flex max-w-[900px] items-center justify-between px-6 font-grotesk text-[18px] font-bold xl:text-[20px]" style={{ color: RED }}>
          <Link href={`/work/${prev.slug}`} onClick={goTo(prev.slug)} data-cursor="hover" className="transition-opacity hover:opacity-70">
            &lt; Previous
          </Link>
          <Link href={`/work/${next.slug}`} onClick={goTo(next.slug)} data-cursor="hover" className="transition-opacity hover:opacity-70">
            Next &gt;
          </Link>
        </div>
      </div>
    </>
  );

  if (overlay) {
    if (typeof document === "undefined") return null;
    return createPortal(
      <div
        role="dialog"
        aria-modal="true"
        aria-label={p.name}
        onClick={onClose}
        className="fixed inset-x-0 bottom-0 top-13 z-100 flex items-start justify-center bg-[rgba(226,226,218,0.8)] px-4 pb-8 pt-8 sm:px-6 lg:pt-[30px] animate-[panel-in_0.2s_ease-out]"
      >
        <div
          ref={scrollRef}
          onClick={(e) => e.stopPropagation()}
          className="cs-root cs-fullheight relative h-full max-h-[814px] w-full max-w-[1098px] overflow-y-auto overflow-x-hidden overscroll-contain bg-white font-serif text-black shadow-[0_24px_80px_rgba(0,0,0,0.28)] ring-1 ring-black/10"
        >
          {inner}
        </div>
      </div>,
      document.body,
    );
  }

  return (
    <div ref={scrollRef} className="cs-root min-h-screen bg-white font-serif text-black">
      {inner}
    </div>
  );
}

// ── per-section dispatch ──────────────────────────────────────────────────────
function SectionBlock({ section, project }: { section: Section; project: Study }) {
  switch (section._type) {
    case "heroSection":
      return <HeroBlock section={section} project={project} />;
    case "overviewSection":
      return <OverviewBlock section={section} />;
    case "accordionSection":
      return <AccordionBlock section={section} />;
    case "proseSection":
      return <ProseBlock section={section} />;
    case "mediaSection":
      return <MediaBlock section={section} />;
    case "gallerySection":
      return <GalleryBlock section={section} />;
    case "showcaseGallery":
      return <ShowcaseBlock section={section} />;
    case "statsSection":
      return <StatsBlock section={section} />;
    case "bulletSection":
      return <BulletBlock section={section} />;
    default:
      return null;
  }
}

type Of<T extends Section["_type"]> = Extract<Section, { _type: T }>;

function HeroBlock({ section: s, project: p }: { section: Of<"heroSection">; project: Study }) {
  if (!s.image) return null;
  return (
    <section className="relative">
      {/* eslint-disable-next-line @next/next/no-img-element -- case-study art */}
      <img src={s.image} alt={p.name} className="block h-auto w-full object-cover object-left" />
      <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(180deg,rgba(0,0,0,0)_0%,rgba(0,0,0,0.5)_100%)]" />
      <div className="absolute bottom-4 left-7.5 p-[10px] text-white">
        <p className="text-[16px] leading-[1.6] xl:text-[1.3vw]">
          <strong className="font-bold">{s.headingOverride ?? p.name}</strong> · {s.caption ?? p.tagline}
        </p>
      </div>
    </section>
  );
}

function OverviewBlock({ section: s }: { section: Of<"overviewSection"> }) {
  return (
    <section data-cs-stretch className="grid grid-cols-1 lg:grid-cols-2" style={bandStyle(s.appearance)}>
      <div className="flex flex-col justify-between gap-10 px-6 py-14 sm:px-10 xl:px-[3.5vw] xl:py-[3.8rem]">
        <div>
          <Label>{s.sectionTitle ?? "Overview"}</Label>
          <Prose value={s.body} className="mt-[1em] text-[17px] leading-normal lg:leading-[1.3] xl:text-[1.15vw]" />
          {s.ctaUrl && (
            <a
              href={s.ctaUrl}
              target="_blank"
              rel="noopener noreferrer"
              data-cursor="hover"
              style={{ fontFamily: SANS }}
              className="mt-6 inline-block text-[13px] uppercase tracking-wide underline underline-offset-4 transition-colors hover:text-accent xl:text-[0.85vw]"
            >
              {s.ctaLabel ?? "Visit Site"}
            </a>
          )}
        </div>
        <div className="flex flex-col gap-5">
          {(s.serviceCategoryLabel || s.serviceList) && (
            <div className="max-w-[340px]">
              <Label>{s.serviceCategoryLabel ?? "Research & Design"}</Label>
              <p className="mt-2 text-[13px] font-light leading-[1.35] xl:text-[0.95vw]">{s.serviceList}</p>
            </div>
          )}
          <div className="max-w-[340px] space-y-1 text-[13px] font-light leading-[1.35] xl:text-[0.95vw]">
            {s.duration && <p><span className="font-normal">Duration</span>: {s.duration}</p>}
            {s.team && <p><span className="font-normal">Team</span>: {s.team}</p>}
          </div>
          {s.confidentialityNote && (
            <p className="mt-4 max-w-[400px] text-[11px] italic leading-[1.4] text-black/55 xl:text-[0.78vw]">{s.confidentialityNote}</p>
          )}
        </div>
      </div>
      <div className="relative min-h-[70vw] lg:min-h-full" style={{ backgroundColor: colorToCss(s.sideImageBackgroundColor) ?? TEAL }}>
        {s.sideImage && (
          // eslint-disable-next-line @next/next/no-img-element -- case-study art
          <img src={s.sideImage} alt="" className="absolute inset-0 h-full w-full object-contain object-center" />
        )}
      </div>
    </section>
  );
}

function AccordionBlock({ section: s }: { section: Of<"accordionSection"> }) {
  const light = isLight(s.appearance);
  const items = s.items ?? [];
  if (s.variant === "split") {
    return (
      <section
        data-cs-stretch
        className={`grid grid-cols-1 gap-10 px-6 sm:px-10 lg:grid-cols-2 lg:gap-12 lg:grid-rows-[1fr] xl:px-[3.5vw] ${padClasses(s.appearance, "md")}`}
        style={bandStyle(s.appearance, SAGE)}
      >
        <div className="flex flex-col justify-end">
          <div className="max-w-[445px]">
            <Label light={light}>{s.sideTitle ?? "My Approach"}</Label>
            <Prose value={s.sideBody} className="mt-3 text-[18px] leading-normal xl:text-[1.25vw]" />
          </div>
        </div>
        <div className="self-stretch p-[10vw_5vw] xl:p-[2vw]" style={{ backgroundColor: colorToCss(s.accordionBackgroundColor) }}>
          {s.sectionTitle && <Label center>{s.sectionTitle}</Label>}
          <div className="mt-4">
            <Accordion items={items} variant="process" />
          </div>
        </div>
      </section>
    );
  }
  return (
    <section className={padClasses(s.appearance, "md")} style={bandStyle(s.appearance, SAGE)}>
      <div className="mx-auto w-full max-w-[1140px] px-6 sm:px-10 xl:px-[3.5vw]">
        <div className="mx-auto max-w-[480px]">
          {s.sectionTitle && <Label center light={light}>{s.sectionTitle}</Label>}
          <div className="mt-6">
            <Accordion items={items} variant="brought" />
          </div>
        </div>
      </div>
    </section>
  );
}

function ProseBlock({ section: s }: { section: Of<"proseSection"> }) {
  const light = isLight(s.appearance);
  const align = s.appearance?.contentAlignment ?? "center";
  const width = MAXW[s.appearance?.maxWidth ?? "default"];
  return (
    <section className={`${padClasses(s.appearance, "md")} ${ALIGN[align]}`} style={bandStyle(s.appearance)}>
      <div className="mx-auto w-full max-w-[1140px] px-6 sm:px-10 xl:px-[3.5vw]">
        <div className={`mx-auto ${align === "center" ? "lg:max-w-[60%]" : width}`}>
          {s.sectionTitle && <Label center={align === "center"} light={light}>{s.sectionTitle}</Label>}
          <Prose value={s.body} className="mt-6 text-[18px] leading-[1.4] xl:text-[1.25vw]" />
        </div>
      </div>
    </section>
  );
}

function MediaBlock({ section: s }: { section: Of<"mediaSection"> }) {
  const light = isLight(s.appearance);
  const items = s.items ?? [];
  const multi = items.length > 1;
  return (
    <section data-cs-stretch className={`flex flex-col justify-center gap-10 ${padClasses(s.appearance, "md")}`} style={bandStyle(s.appearance)}>
      {items.length > 0 && (
        <div
          className={
            multi
              ? "mx-auto grid w-full max-w-[1140px] gap-6 px-6 sm:grid-cols-2 sm:px-10 xl:px-[3.5vw]"
              : "mx-auto w-full max-w-[900px] px-6 sm:px-10 xl:px-[3.5vw]"
          }
        >
          {items.map((m) => (
            <MediaUnit key={m._key} item={m} />
          ))}
        </div>
      )}
      {(s.sectionTitle || s.body) && (
        <div className="ml-auto w-full max-w-[440px] px-6 sm:px-10 xl:px-[3.5vw]">
          {s.sectionTitle && <Label light={light}>{s.sectionTitle}</Label>}
          <Prose value={s.body} className="mt-3 text-[12px] leading-[1.45] xl:text-[0.85vw]" />
        </div>
      )}
    </section>
  );
}

function MediaUnit({ item }: { item: MediaItem }) {
  if (item.mediaType === "prototype" && item.embedUrl) {
    return (
      <div className="aspect-video w-full overflow-hidden bg-black/10">
        <iframe src={item.embedUrl} title={item.caption || "Prototype"} className="h-full w-full" allowFullScreen />
      </div>
    );
  }
  if (item.mediaType === "video") {
    if (item.videoUrl) {
      return (
        <div className="aspect-video w-full overflow-hidden bg-black/10">
          <iframe
            src={item.videoUrl}
            title={item.caption || "Video"}
            className="h-full w-full"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
          />
        </div>
      );
    }
    if (item.videoFile) {
      return <video className="block h-auto w-full" src={item.videoFile} autoPlay loop muted playsInline />;
    }
  }
  if (item.image) {
    // eslint-disable-next-line @next/next/no-img-element -- case-study art
    return <img src={item.image} alt={item.caption || ""} className="block h-auto w-full" />;
  }
  return null;
}

function GalleryBlock({ section: s }: { section: Of<"gallerySection"> }) {
  const light = isLight(s.appearance);
  const initial = s.itemsBeforeViewMore ?? 6;
  const tan = colorToCss(s.appearance?.backgroundColor);
  const tile = !!s.useDeviceTabs; // device-tab flows use the framed tile style
  return (
    <section className={`px-6 sm:px-10 xl:px-[3.5vw] ${padClasses(s.appearance, "md")}`} style={bandStyle(s.appearance)}>
      {(s.sectionTitle || s.body) && (
        <div className="mb-2">
          {s.sectionTitle && <Label light={light}>{s.sectionTitle}</Label>}
          <Prose value={s.body} className="max-w-[70ch] text-[18px] leading-[1.6] xl:text-[1.25vw]" />
        </div>
      )}
      {s.useDeviceTabs && s.tabs?.length ? (
        <DeviceGallery tabs={s.tabs} initial={initial} loadMore={s.loadMoreLabel} />
      ) : (
        <ImageGrid
          images={imgUrls(s.items)}
          captions={s.showCaptions ? capList(s.items) : undefined}
          initial={initial}
          loadMore={s.loadMoreLabel}
          tile={tile}
          light={light || !!tan}
        />
      )}
    </section>
  );
}

function ShowcaseBlock({ section: s }: { section: Of<"showcaseGallery"> }) {
  const images = imgUrls(s.items);
  return (
    <section data-cs-stretch className={`flex flex-col justify-center gap-10 ${padClasses(s.appearance, "md")}`} style={bandStyle(s.appearance, "#000000", true)}>
      {images.length > 0 && <CenterSlider images={images} />}
      {(s.sectionTitle || s.introBody) && (
        <div className="w-full max-w-[50%] px-[5vw] text-justify">
          {s.sectionTitle && <Label light>{s.sectionTitle}</Label>}
          <Prose value={s.introBody} className="mt-3 text-[13px] leading-normal xl:text-[0.9vw]" />
        </div>
      )}
    </section>
  );
}

function StatsBlock({ section: s }: { section: Of<"statsSection"> }) {
  const items = s.items ?? [];
  if (!items.length) return null;
  return (
    <section className={`px-6 text-center sm:px-10 xl:px-[3.5vw] ${padClasses(s.appearance, "md")}`} style={bandStyle(s.appearance)}>
      {s.sectionTitle && <div className="mb-10"><Label center light={isLight(s.appearance)}>{s.sectionTitle}</Label></div>}
      <div className="mx-auto grid max-w-[1140px] grid-cols-1 gap-12 sm:grid-cols-3">
        {items.map((st) => (
          <Stat key={st._key} stat={st} />
        ))}
      </div>
    </section>
  );
}

function BulletBlock({ section: s }: { section: Of<"bulletSection"> }) {
  const items = s.items ?? [];
  if (!items.length) return null;
  return (
    <section className={padClasses(s.appearance, "md")} style={bandStyle(s.appearance)}>
      <div className="mx-auto w-full max-w-[1140px] px-6 sm:px-10 xl:px-[3.5vw]">
        <div className="mx-auto max-w-[640px]">
          <Label light={isLight(s.appearance)}>{s.sectionTitle ?? "Next Steps"}</Label>
          <ul className="mt-5 list-disc space-y-3 pl-5 text-[18px] leading-[1.6] xl:text-[1.1vw]">
            {items.map((it, i) => (
              <li key={i}>{it}</li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}

// ── shared bits ───────────────────────────────────────────────────────────────
function imgUrls(items?: GalleryImage[]): string[] {
  return (items ?? []).map((i) => i.image).filter((u): u is string => !!u);
}
function capList(items?: GalleryImage[]): (string | undefined)[] {
  return (items ?? []).map((i) => i.caption);
}

function Label({
  children,
  center,
  light,
}: {
  children: React.ReactNode;
  center?: boolean;
  light?: boolean;
}) {
  return (
    <h2
      style={{ fontFamily: SANS }}
      className={`mb-[20px] text-[20px] font-normal uppercase leading-tight xl:mb-[0.5vw] xl:text-[1vw] ${light ? "text-white" : ""} ${center ? "text-center" : ""}`}
    >
      {children}
    </h2>
  );
}

function Accordion({ items, variant = "process" }: { items: AccordionEntry[]; variant?: "brought" | "process" }) {
  const initial = Math.max(0, items.findIndex((i) => i.defaultOpen));
  const [open, setOpen] = useState(initial === -1 ? 0 : initial);
  const headSize = variant === "brought" ? "text-[18px] xl:text-[1.4vw]" : "text-[18px] xl:text-[1.05vw]";
  const bodySize = variant === "brought" ? "text-[16px] xl:text-[1.25vw]" : "text-[16px] xl:text-[0.9vw]";
  return (
    <div>
      {items.map((it, i) => {
        const isOpen = open === i;
        return (
          <div key={it._key} className="border-b-[0.4px] border-current">
            <button
              type="button"
              onClick={() => setOpen(isOpen ? -1 : i)}
              data-cursor="hover"
              className={`flex w-full items-center justify-between gap-6 py-[25px] text-left font-normal xl:py-[0.9vw] ${headSize}`}
            >
              <span>{it.title}</span>
              <span className="shrink-0 text-[35px] font-semibold leading-none xl:text-[2.5vw]">{isOpen ? "−" : "+"}</span>
            </button>
            {isOpen && it.body && <Prose value={it.body} className={`pb-6 leading-normal ${bodySize}`} />}
          </div>
        );
      })}
    </div>
  );
}

/** Cover-flow slider (Galderma showcase): 5-up centered carousel, autoplay,
 *  infinite loop, white prev/next arrows. */
function CenterSlider({ images }: { images: string[] }) {
  const n = images.length;
  const [visible, setVisible] = useState(5);
  const [index, setIndex] = useState(() => Math.max(n, 0));
  const [noAnim, setNoAnim] = useState(false);
  const locked = useRef(false);
  const viewportRef = useRef<HTMLDivElement>(null);
  const [viewportW, setViewportW] = useState(0);

  useEffect(() => {
    const update = () => {
      const w = window.innerWidth;
      setVisible(w < 575 ? 1 : w < 992 ? 3 : 5);
      if (viewportRef.current) setViewportW(viewportRef.current.clientWidth);
    };
    update();
    window.addEventListener("resize", update);
    return () => window.removeEventListener("resize", update);
  }, []);

  useEffect(() => {
    if (!viewportRef.current) return;
    setViewportW(viewportRef.current.clientWidth);
    const ro = new ResizeObserver(() => {
      if (viewportRef.current) setViewportW(viewportRef.current.clientWidth);
    });
    ro.observe(viewportRef.current);
    return () => ro.disconnect();
  }, []);

  const go = (dir: 1 | -1) => {
    if (locked.current || n < 2) return;
    locked.current = true;
    setIndex((i) => i + dir);
    window.setTimeout(() => {
      locked.current = false;
    }, 820);
  };

  useEffect(() => {
    if (n < 1) return;
    if (index >= 2 * n || index < n) {
      const t = window.setTimeout(() => {
        setNoAnim(true);
        setIndex((i) => (i >= 2 * n ? i - n : i < n ? i + n : i));
        requestAnimationFrame(() => {
          requestAnimationFrame(() => setNoAnim(false));
        });
      }, 800);
      return () => window.clearTimeout(t);
    }
  }, [index, n]);

  useEffect(() => {
    if (n < 2) return;
    if (window.matchMedia?.("(prefers-reduced-motion: reduce)").matches) return;
    const id = window.setInterval(() => {
      if (locked.current) return;
      locked.current = true;
      setIndex((i) => i + 1);
      window.setTimeout(() => {
        locked.current = false;
      }, 820);
    }, 6000);
    return () => window.clearInterval(id);
  }, [n]);

  const loop = n > 0 ? [...images, ...images, ...images] : [];
  const gapPx = viewportW > 0 ? viewportW * 0.015 : 0;
  const slideW = viewportW > 0 ? viewportW / visible : 0;
  const translateX = viewportW > 0 ? viewportW / 2 - (index + 0.5) * slideW : 0;
  const realIdx = n > 0 ? ((index % n) + n) % n : 0;

  return (
    <div className="cs-center-slider relative w-full pt-[3.5vw] pb-[3vw]">
      <div className="pointer-events-none absolute top-0 right-[3vw] z-10 flex items-center gap-[1.5vw]">
        <button type="button" aria-label="Previous slide" data-cursor="hover" onClick={() => go(-1)} className="pointer-events-auto bg-transparent p-1 opacity-90 transition-opacity hover:opacity-100">
          {/* eslint-disable-next-line @next/next/no-img-element -- theme arrow */}
          <img src="/work/slider-arrows.svg" alt="" className="h-[0.85vw] min-h-[8px] w-[2vw] min-w-[19px] -scale-x-100 brightness-0 invert" />
        </button>
        <button type="button" aria-label="Next slide" data-cursor="hover" onClick={() => go(1)} className="pointer-events-auto bg-transparent p-1 opacity-90 transition-opacity hover:opacity-100">
          {/* eslint-disable-next-line @next/next/no-img-element -- theme arrow */}
          <img src="/work/slider-arrows.svg" alt="" className="h-[0.85vw] min-h-[8px] w-[2vw] min-w-[19px] brightness-0 invert" />
        </button>
      </div>
      <div ref={viewportRef} className="overflow-x-hidden overflow-y-visible py-[2vw]">
        <div
          className="flex items-center"
          style={{
            transform: `translateX(${translateX}px)`,
            transition: noAnim ? "none" : "transform 800ms ease-in-out",
            willChange: "transform",
          }}
        >
          {loop.map((src, i) => {
            const isCtr = i === index;
            return (
              <button
                key={`${src}-${i}`}
                type="button"
                aria-label={`Slide ${(i % n) + 1}`}
                aria-current={isCtr ? "true" : undefined}
                onClick={() => {
                  if (i === index || locked.current || n < 1) return;
                  const target = Math.floor(index / n) * n + (i % n);
                  locked.current = true;
                  setIndex(target);
                  window.setTimeout(() => {
                    locked.current = false;
                  }, 820);
                }}
                data-cursor="hover"
                className="relative shrink-0 overflow-visible bg-transparent p-0"
                style={{
                  width: slideW > 0 ? `${slideW}px` : `${100 / visible}%`,
                  paddingLeft: gapPx,
                  paddingRight: gapPx,
                  zIndex: isCtr ? 2 : 1,
                }}
              >
                <div className="relative w-full overflow-hidden pt-[150%] transition-transform duration-800 ease-in-out" style={{ transform: isCtr ? "scale(1.15)" : "scale(1)" }}>
                  {/* eslint-disable-next-line @next/next/no-img-element -- case-study art */}
                  <img
                    key={isCtr ? `c-${realIdx}` : `s-${i}`}
                    src={src}
                    alt=""
                    className={`absolute inset-0 h-full w-full object-cover object-top ${isCtr ? "cs-center-pan" : ""}`}
                  />
                  <div className="pointer-events-none absolute inset-0 bg-black transition-opacity duration-500" style={{ opacity: isCtr ? 0 : 0.85 }} aria-hidden />
                </div>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}

function DeviceGallery({
  tabs,
  initial,
  loadMore,
}: {
  tabs: DeviceTab[];
  initial: number;
  loadMore?: string;
}) {
  const [active, setActive] = useState(0);
  const tab = tabs[active];
  return (
    <div className="mt-8">
      <div className="mx-auto flex max-w-full flex-wrap justify-center gap-8 xl:gap-[6vw]">
        {tabs.map((v, i) => (
          <button
            key={v._key}
            type="button"
            onClick={() => setActive(i)}
            data-cursor="hover"
            style={{ fontFamily: SANS }}
            className={`relative pb-1 text-[16px] uppercase leading-none after:absolute after:bottom-0 after:left-0 after:h-px after:bg-current after:transition-all after:duration-300 xl:text-[1vw] ${
              active === i ? "after:w-full" : "after:w-0 hover:after:w-full"
            }`}
          >
            {v.label}
          </button>
        ))}
      </div>
      <ImageGrid key={tab?._key} images={imgUrls(tab?.items)} initial={initial} loadMore={loadMore} tile light />
    </div>
  );
}

function ImageGrid({
  images,
  captions,
  initial = 6,
  loadMore = "Load More",
  tile,
  light,
}: {
  images: string[];
  captions?: (string | undefined)[];
  initial?: number;
  loadMore?: string;
  tile?: boolean;
  light?: boolean;
}) {
  const STEP = 4;
  const [shown, setShown] = useState(initial);
  const visible = images.slice(0, shown);
  return (
    <>
      <div className="mt-8 grid grid-cols-1 gap-x-[5vw] gap-y-10 sm:grid-cols-2">
        {visible.map((src, i) =>
          tile ? (
            <div key={i} className="shadow-[0_0.5vw_0.8vw_rgba(0,0,0,0.4)]" style={{ backgroundColor: TILE }}>
              {/* eslint-disable-next-line @next/next/no-img-element -- case-study art */}
              <img src={src} alt="" loading="lazy" className="h-[40vw] w-full object-contain xl:h-[20vw]" />
            </div>
          ) : (
            <figure key={i}>
              {/* eslint-disable-next-line @next/next/no-img-element -- case-study art */}
              <img src={src} alt="" loading="lazy" className="block h-auto w-full object-cover" />
              {captions?.[i] && <figcaption className="mt-2 text-[13px] opacity-70">{captions[i]}</figcaption>}
            </figure>
          ),
        )}
      </div>
      {shown < images.length && (
        <div className="mt-10 flex justify-center">
          <button
            type="button"
            onClick={() => setShown((n) => n + STEP)}
            data-cursor="hover"
            style={{ fontFamily: SANS }}
            className={`relative pb-1 text-[16px] uppercase leading-none after:absolute after:bottom-0 after:left-0 after:h-px after:w-full after:bg-current xl:text-[1vw] ${light ? "text-white" : ""}`}
          >
            {loadMore}
          </button>
        </div>
      )}
    </>
  );
}

function Stat({ stat }: { stat: StatItem }) {
  const ref = useRef<HTMLDivElement>(null);
  const [n, setN] = useState(0);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    let raf = 0;
    const io = new IntersectionObserver(
      (entries) => {
        if (!entries[0].isIntersecting) return;
        io.disconnect();
        const start = performance.now();
        const dur = 1500;
        const tick = (t: number) => {
          const k = Math.min(1, (t - start) / dur);
          setN(Math.floor(k * stat.value));
          if (k < 1) raf = requestAnimationFrame(tick);
          else setN(stat.value);
        };
        raf = requestAnimationFrame(tick);
      },
      { threshold: 0.5 },
    );
    io.observe(el);
    return () => {
      io.disconnect();
      cancelAnimationFrame(raf);
    };
  }, [stat.value]);
  return (
    <div ref={ref} className="text-[16px] xl:text-[1.2vw]">
      <p className="flex justify-center text-[64px] leading-none xl:text-[8.5vw]">
        {n}
        {stat.suffix}
      </p>
      <p className="mt-4 block text-[20px] font-bold xl:text-[1.8vw]">{stat.label}</p>
      {stat.note && <p className="mt-2 leading-normal opacity-70">{stat.note}</p>}
    </div>
  );
}

function NextUp({
  next,
  image,
  onNavigate,
  scrollRoot,
}: {
  next: StudyCard;
  image?: string;
  onNavigate?: (slug: string) => void;
  scrollRoot?: React.RefObject<HTMLDivElement | null>;
}) {
  const sectionRef = useRef<HTMLElement>(null);
  const textRef = useRef<HTMLSpanElement>(null);
  const label = `Next up- ${next.name}`;
  useEffect(() => {
    const section = sectionRef.current;
    const textEl = textRef.current;
    if (!section || !textEl) return;
    if (window.matchMedia?.("(prefers-reduced-motion: reduce)").matches) {
      textEl.textContent = label;
      textEl.style.color = "#ffffff";
      return;
    }
    const FILL_MS = 3000;
    let timers: ReturnType<typeof setTimeout>[] = [];
    const reset = () => {
      timers.forEach(clearTimeout);
      timers = [];
      textEl.textContent = label;
      textEl.style.color = "";
    };
    const fill = () => {
      reset();
      textEl.innerHTML = "";
      const chars = label.split("");
      const step = FILL_MS / Math.max(chars.length, 1);
      chars.forEach((ch, i) => {
        const span = document.createElement("span");
        span.textContent = ch;
        span.style.color = "rgba(255,255,255,0.2)";
        span.style.transition = "color 0.5s ease";
        textEl.appendChild(span);
        timers.push(setTimeout(() => (span.style.color = "#ffffff"), i * step));
      });
    };
    const io = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) fill();
          else reset();
        }
      },
      { threshold: 0.3, root: scrollRoot?.current ?? null },
    );
    io.observe(section);
    return () => {
      io.disconnect();
      timers.forEach(clearTimeout);
    };
  }, [label, scrollRoot, next.slug]);
  const go = (e: React.MouseEvent) => {
    if (onNavigate) {
      e.preventDefault();
      onNavigate(next.slug);
    }
  };
  return (
    <section ref={sectionRef} data-cs-stretch className="cs-next-up relative flex items-center overflow-hidden text-left">
      {image && (
        // eslint-disable-next-line @next/next/no-img-element -- next-up art
        <img src={image} alt="" className="absolute inset-0 z-0 h-full w-full object-cover" />
      )}
      <div className="absolute inset-0 z-1 bg-black/75" aria-hidden />
      <div className="relative z-2 mx-auto w-full max-w-[1140px] px-6 sm:px-10 xl:px-[3.5vw]">
        <Link
          href={`/work/${next.slug}`}
          onClick={go}
          data-cursor="hover"
          className="group relative inline-block max-w-full font-serif text-[34px] font-thin leading-[1.3] text-white/50 no-underline transition-[padding] duration-400 ease-in-out hover:pl-[2.5vw] xl:text-[5vw]"
        >
          <span
            aria-hidden
            className="pointer-events-none absolute top-[0.55em] left-[2.5vw] z-[-1] size-[1.8vw] min-h-[18px] min-w-[18px] rounded-full opacity-0 transition-all duration-400 ease-in-out group-hover:left-0 group-hover:opacity-100"
            style={{ backgroundColor: RED }}
          />
          <span ref={textRef} className="relative">{label}</span>
        </Link>
      </div>
    </section>
  );
}
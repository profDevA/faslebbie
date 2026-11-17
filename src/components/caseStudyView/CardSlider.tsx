'use client'

import { useEffect, useRef, useState } from 'react'

// Life of a Miner card slider — the reference is horizonx.so/explore/lumina
// (Fas, Nov 13: "mimic the exact one"). Re-measured Nov 17 and copied:
//   1440: every card 944×531 (16:9), radius 30, gap 16; neighbours scale 0.93
//         at opacity 0.5; controls 20 px under the card.
//   375:  card 308×173, radius 30, gap 16; controls 20 px under.
//   controls: ‹ › 36px tinted circles with a 14px chevron, 10 px from a
//   36-tall tinted pill holding the dots (24-wide hit areas, 8×8 dots at 30 %,
//   active 24×8 solid). Auto-advance ~4.4 s, 600 ms slide.
// One Studio image = one card (HorizonX's "three at a time" is three phones
// drawn inside each slide image — Xian, Nov 17). HorizonX's images are 16:9
// compositions; ours are 4:3 / 3:2 / 16:9 storyboard pages, so each card shows
// the whole image centred over a blurred copy of itself — no white bands, no
// crop (Xian, Nov 17: option 1). The image's own corners are rounded so the
// black corners baked into some Figma pages never show. Long lists show a
// window of five dots around the active card (Life of a Miner has 68).
// Autoplay pauses while hovered / touched and restarts after a manual move;
// off with prefers-reduced-motion.
// Studio: Showcase Gallery → Tap to expand off → Slider style "Cards".
// Lives in its own module: adding it to CaseStudyView.tsx made the Next build's
// page-data workers die with a V8 "Zone Allocation failed" (Nov 11).
const CARD_SLIDER = {
  /** Card width as a share of the slider width (HorizonX 944 @1440, 308 @375). */
  desktopCardW: 944 / 1440,
  mobileCardW: 308 / 375,
  aspect: '944 / 531',
  slotGap: 16,
  sideScale: 0.93,
  sideOpacity: 0.5,
  transitionMs: 600,
  autoplayMs: 4400,
  /** Most dots shown at once; longer lists get a window around the active card
   *  (HorizonX has 3 slides → an 84-wide pill; 5 keeps ours at 132). */
  maxDots: 5,
}

export function CardSlider({
  images,
  light,
  onExpand,
}: {
  images: string[]
  /** Band uses light text (dots / arrows follow currentColor). */
  light: boolean
  /** Click on the centred card — the parent opens its lightbox at this index. */
  onExpand?: (index: number) => void
}) {
  // One card per Studio image, in order.
  const cards = images
  const n = cards.length
  const [index, setIndex] = useState(() => Math.max(n, 0))
  const [noAnim, setNoAnim] = useState(false)
  const locked = useRef(false)
  const viewportRef = useRef<HTMLDivElement>(null)
  const [viewportW, setViewportW] = useState(0)
  const [desktop, setDesktop] = useState(true)
  const touchStartX = useRef<number | null>(null)
  const [paused, setPaused] = useState(false)
  // Bumped on every manual move so the autoplay timer starts over.
  const [autoplayRun, setAutoplayRun] = useState(0)

  useEffect(() => {
    const update = () => {
      setDesktop(window.innerWidth >= 1024)
      if (viewportRef.current) setViewportW(viewportRef.current.clientWidth)
    }
    update()
    window.addEventListener('resize', update)
    const el = viewportRef.current
    const ro = el ? new ResizeObserver(update) : null
    if (el) ro!.observe(el)
    return () => {
      window.removeEventListener('resize', update)
      ro?.disconnect()
    }
  }, [])

  const lock = () => {
    locked.current = true
    window.setTimeout(() => {
      locked.current = false
    }, CARD_SLIDER.transitionMs + 20)
  }
  const go = (dir: 1 | -1, manual = true) => {
    if (locked.current || n < 2) return
    lock()
    setIndex(i => i + dir)
    if (manual) setAutoplayRun(r => r + 1)
  }
  const goTo = (real: number) => {
    if (locked.current || n < 1) return
    const target = Math.floor(index / n) * n + real
    if (target === index) return
    lock()
    setIndex(target)
    setAutoplayRun(r => r + 1)
  }

  // HorizonX auto-advance: one slide every autoplayMs, paused while the
  // pointer is over the slider or a finger is on it, restarted by a manual
  // move, skipped for reduced-motion users.
  useEffect(() => {
    if (n < 2 || paused) return
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return
    const id = window.setInterval(() => go(1, false), CARD_SLIDER.autoplayMs)
    return () => window.clearInterval(id)
    // eslint-disable-next-line react-hooks/exhaustive-deps -- go only touches refs / setters
  }, [n, paused, autoplayRun])

  // Same infinite loop as the coverflow: three copies, re-centre after a move.
  useEffect(() => {
    if (n < 1) return
    if (index >= 2 * n || index < n) {
      const t = window.setTimeout(() => {
        setNoAnim(true)
        setIndex(i => (i >= 2 * n ? i - n : i < n ? i + n : i))
        requestAnimationFrame(() => {
          requestAnimationFrame(() => setNoAnim(false))
        })
      }, CARD_SLIDER.transitionMs)
      return () => window.clearTimeout(t)
    }
  }, [index, n])

  const onTouchEnd = (clientX: number) => {
    if (touchStartX.current == null) return
    const dx = clientX - touchStartX.current
    if (Math.abs(dx) >= 40) go(dx > 0 ? -1 : 1)
    touchStartX.current = null
  }

  const loop = n > 0 ? [...cards, ...cards, ...cards] : []
  const cardFrac = desktop ? CARD_SLIDER.desktopCardW : CARD_SLIDER.mobileCardW
  const cardW = viewportW * cardFrac
  const slotW = cardW + CARD_SLIDER.slotGap
  const realIdx = n > 0 ? ((index % n) + n) % n : 0
  // Dots: all of them up to maxDots, otherwise a window around the active card.
  const dotCount = Math.min(n, CARD_SLIDER.maxDots)
  const dotStart = Math.min(
    Math.max(realIdx - Math.floor(dotCount / 2), 0),
    Math.max(n - dotCount, 0),
  )
  const dotWindow = Array.from({ length: dotCount }, (_, k) => dotStart + k)
  // Before the first measurement (server render, first paint) the geometry
  // comes from CSS variables set per breakpoint on the root (no jump on load);
  // after it, from the measured pixel width.
  const measured = viewportW > 0
  const cssSlot = 'calc(var(--cs-card-w) * 1vw + 16px)'
  const cardWidth = measured ? `${cardW}px` : 'calc(var(--cs-card-w) * 1vw)'
  const slotWidth = measured ? `${slotW}px` : cssSlot
  const translate = measured
    ? `translateX(${viewportW / 2 - (index + 0.5) * slotW}px)`
    : `translateX(calc(50vw - ${index + 0.5} * ${cssSlot}))`
  const moveTransition = noAnim ? 'none' : `transform ${CARD_SLIDER.transitionMs}ms ease-in-out`

  const arrow = (dir: 1 | -1) => (
    <button
      type="button"
      aria-label={dir === 1 ? 'Next slide' : 'Previous slide'}
      data-cursor="hover"
      onClick={() => go(dir)}
      // HorizonX: 36px filled circle (current colour at low alpha, no border),
      // 14px chevron. 10% instead of their 6% so it still reads on the brown band.
      className="flex size-[36px] shrink-0 items-center justify-center rounded-full bg-current/10 transition-opacity hover:opacity-70"
    >
      <svg
        viewBox="0 0 10.5 10.5"
        className={`size-[14px] ${dir === 1 ? '' : '-scale-x-100'}`}
        aria-hidden
      >
        <path
          d="M3.2 1.2l4.2 4.05-4.2 4.05"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    </button>
  )

  return (
    <div
      className={`cs-card-slider relative w-full [--cs-card-w:82.13] lg:[--cs-card-w:65.56] ${
        light ? 'text-white' : 'text-[#171717]'
      }`}
    >
      <div
        ref={viewportRef}
        className="w-full overflow-hidden"
        onMouseEnter={() => setPaused(true)}
        onMouseLeave={() => setPaused(false)}
        onTouchStart={e => {
          touchStartX.current = e.touches[0]?.clientX ?? 0
          setPaused(true)
        }}
        onTouchEnd={e => {
          onTouchEnd(e.changedTouches[0]?.clientX ?? 0)
          setPaused(false)
        }}
      >
        <div
          className="flex items-center"
          style={{
            transform: translate,
            transition: moveTransition,
            willChange: 'transform',
          }}
        >
          {loop.map((card, i) => {
            const isCtr = i === index
            return (
              <button
                key={`${card}-${i}`}
                type="button"
                aria-label={`Slide ${(i % n) + 1}`}
                aria-current={isCtr ? 'true' : undefined}
                data-cursor="hover"
                onClick={() => {
                  if (isCtr) {
                    onExpand?.(realIdx)
                    return
                  }
                  goTo(i % n)
                }}
                className="flex shrink-0 justify-center bg-transparent p-0"
                style={{ width: slotWidth }}
              >
                <div
                  className="relative overflow-hidden rounded-[30px] bg-[#d9d4cc]"
                  style={{
                    width: cardWidth,
                    aspectRatio: CARD_SLIDER.aspect,
                    transform: isCtr ? 'scale(1)' : `scale(${CARD_SLIDER.sideScale})`,
                    opacity: isCtr ? 1 : CARD_SLIDER.sideOpacity,
                    transition: noAnim
                      ? 'none'
                      : `transform ${CARD_SLIDER.transitionMs}ms ease-in-out, opacity ${CARD_SLIDER.transitionMs}ms ease-in-out`,
                  }}
                >
                  {/* Blurred copy fills the 16:9 card around a 4:3 / 3:2 page. */}
                  {/* eslint-disable-next-line @next/next/no-img-element -- case-study art */}
                  <img
                    src={card}
                    alt=""
                    aria-hidden
                    draggable={false}
                    className="absolute inset-0 h-full w-full scale-110 object-cover blur-2xl"
                  />
                  <div className="absolute inset-0 flex items-center justify-center">
                    {/* eslint-disable-next-line @next/next/no-img-element -- case-study art */}
                    <img
                      src={card}
                      alt={`Slide ${(i % n) + 1}`}
                      draggable={false}
                      className="block h-auto max-h-full w-auto max-w-full rounded-[8px] object-contain lg:rounded-[24px]"
                    />
                  </div>
                </div>
              </button>
            )
          })}
        </div>
      </div>
      {n > 1 && (
        <div className="mx-auto mt-[20px] flex w-fit items-center gap-[10px]">
          {arrow(-1)}
          <div
            className="flex h-[36px] items-center rounded-full bg-current/10 px-[6px]"
            role="tablist"
            aria-label="Slides"
          >
            {dotWindow.map(i => {
              const edge =
                (i === dotWindow[0] && i > 0) ||
                (i === dotWindow[dotWindow.length - 1] && i < n - 1)
              return (
                <button
                  key={`dot-${i}`}
                  type="button"
                  role="tab"
                  aria-selected={i === realIdx}
                  aria-label={`Go to slide ${i + 1} of ${n}`}
                  data-cursor="hover"
                  onClick={() => goTo(i)}
                  className="flex h-[36px] w-[24px] items-center justify-center bg-transparent p-0"
                >
                  <span
                    className={`block rounded-full bg-current transition-all duration-300 ${
                      i === realIdx
                        ? 'h-[8px] w-[24px] opacity-100'
                        : edge
                          ? 'h-[5px] w-[5px] opacity-30'
                          : 'h-[8px] w-[8px] opacity-30'
                    }`}
                  />
                </button>
              )
            })}
          </div>
          {arrow(1)}
        </div>
      )}
    </div>
  )
}

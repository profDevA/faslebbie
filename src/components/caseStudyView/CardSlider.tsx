'use client'

import { useEffect, useRef, useState } from 'react'

// Life of a Miner card slider — Figma 618:21805 (desktop) / 618:27118 (mobile).
// Fas, Nov 13: "mimic the exact one" = horizonx.so/explore/lumina (measured at
// 1440: card 944×531 radius 30, neighbours scale 0.93 at opacity 0.5, slot gap
// 16, auto-advance every ~4.4 s with a ~600 ms slide, dots 24×8 / 8×8 at 30 %,
// arrows 36px filled circles with a 14px chevron, 16px from the dots).
// Card width / slot gap / control offsets stay on the Figma numbers: one 16:9
// card centred (912 @1440, 303 @393), neighbours peeking 220 / 30 px (slot gap
// 12 / 4); ‹ dots › 133 wide, 41 / 31 px under the card. Autoplay pauses while
// hovered / touched and restarts after a manual move; off with
// prefers-reduced-motion.
// Studio: Showcase Gallery → Tap to expand off → Slider style "Cards".
// Lives in its own module: adding it to CaseStudyView.tsx made the Next build's
// page-data workers die with a V8 "Zone Allocation failed" (Nov 11).
const CARD_SLIDER = {
  desktopCardVw: (912 / 1440) * 100,
  mobileCardVw: (303.4 / 393) * 100,
  desktopSlotGap: 12,
  mobileSlotGap: 4,
  sideScale: 0.93,
  sideOpacity: 0.5,
  aspect: '912 / 513',
  transitionMs: 600,
  autoplayMs: 4400,
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
  const n = images.length
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

  const loop = n > 0 ? [...images, ...images, ...images] : []
  const cardVw = desktop ? CARD_SLIDER.desktopCardVw : CARD_SLIDER.mobileCardVw
  const slotGap = desktop ? CARD_SLIDER.desktopSlotGap : CARD_SLIDER.mobileSlotGap
  const cardW = (viewportW * cardVw) / 100
  const slotW = cardW + slotGap
  const realIdx = n > 0 ? ((index % n) + n) % n : 0
  // Before the first measurement (server render, first paint) the geometry
  // comes from CSS variables set per breakpoint on the root (no jump on load);
  // after it, from the measured pixel width.
  const measured = viewportW > 0
  const cssSlot = 'calc(var(--cs-card-vw) * 1vw + var(--cs-slot-gap))'
  const cardWidth = measured ? `${cardW}px` : 'calc(var(--cs-card-vw) * 1vw)'
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
      className={`cs-card-slider relative w-full [--cs-card-vw:77.2] [--cs-slot-gap:4px] lg:[--cs-card-vw:63.33] lg:[--cs-slot-gap:12px] ${
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
          {loop.map((src, i) => {
            const isCtr = i === index
            return (
              <button
                key={`${src}-${i}`}
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
                  className="overflow-hidden rounded-[10px] lg:rounded-[30px]"
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
                  {/* eslint-disable-next-line @next/next/no-img-element -- case-study art */}
                  <img src={src} alt="" className="h-full w-full object-cover object-center" />
                </div>
              </button>
            )
          })}
        </div>
      </div>
      {n > 1 && (
        <div className="mx-auto mt-[31px] flex w-fit items-center gap-4 lg:mt-[41px]">
          {arrow(-1)}
          <div
            className="flex h-[36px] items-center justify-center gap-2"
            role="tablist"
            aria-label="Slides"
          >
            {images.map((src, i) => (
              <button
                key={`${src}-dot-${i}`}
                type="button"
                role="tab"
                aria-selected={i === realIdx}
                aria-label={`Go to slide ${i + 1}`}
                data-cursor="hover"
                onClick={() => goTo(i)}
                className={`h-[8px] rounded-full bg-current transition-all duration-300 ${
                  i === realIdx ? 'w-[24px] opacity-100' : 'w-[8px] opacity-30'
                }`}
              />
            ))}
          </div>
          {arrow(1)}
        </div>
      )}
    </div>
  )
}

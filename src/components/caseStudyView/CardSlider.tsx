'use client'

import { useEffect, useRef, useState } from 'react'

// Life of a Miner card slider — Figma 618:21805 (desktop) / 618:27118 (mobile);
// Fas, Nov 10: horizonx.so "Virtual Try-On App". One 16:9 card centred (912
// @1440, 303 @393), neighbours at 0.93 peeking 220 / 30 px (slot gap 12 / 4),
// no dimming; ‹ dots › 133 wide, 41 / 31 px under the card. No autoplay.
// Studio: Showcase Gallery → Tap to expand off → Slider style "Cards".
// Lives in its own module: adding it to CaseStudyView.tsx made the Next build's
// page-data workers die with a V8 "Zone Allocation failed" (Nov 11).
const CARD_SLIDER = {
  desktopCardVw: (912 / 1440) * 100,
  mobileCardVw: (303.4 / 393) * 100,
  desktopSlotGap: 12,
  mobileSlotGap: 4,
  sideScale: 0.93,
  aspect: '912 / 513',
  transitionMs: 800,
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
  const go = (dir: 1 | -1) => {
    if (locked.current || n < 2) return
    lock()
    setIndex(i => i + dir)
  }
  const goTo = (real: number) => {
    if (locked.current || n < 1) return
    const target = Math.floor(index / n) * n + real
    if (target === index) return
    lock()
    setIndex(target)
  }

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
      className="flex size-[27px] shrink-0 items-center justify-center rounded-full border border-current bg-transparent transition-opacity hover:opacity-70"
    >
      <svg
        viewBox="0 0 10.5 10.5"
        className={`size-[10.5px] ${dir === 1 ? '' : '-scale-x-100'}`}
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
        onTouchStart={e => {
          touchStartX.current = e.touches[0]?.clientX ?? 0
        }}
        onTouchEnd={e => onTouchEnd(e.changedTouches[0]?.clientX ?? 0)}
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
                  className="overflow-hidden bg-white shadow-[0_4px_18px_rgba(0,0,0,0.18)]"
                  style={{
                    width: cardWidth,
                    aspectRatio: CARD_SLIDER.aspect,
                    transform: isCtr ? 'scale(1)' : `scale(${CARD_SLIDER.sideScale})`,
                    transition: moveTransition,
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
        <div className="mx-auto mt-[31px] flex w-fit min-w-[133px] items-center justify-between gap-2 lg:mt-[41px]">
          {arrow(-1)}
          <div
            className="flex h-[33px] min-w-[63px] items-center justify-center gap-1.5"
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
                className={`h-[5px] rounded-full bg-current transition-all duration-300 ${
                  i === realIdx ? 'w-[19px] opacity-100' : 'w-[5px] opacity-45'
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

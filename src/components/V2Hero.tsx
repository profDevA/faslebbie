'use client'

import { useEffect, useLayoutEffect, useRef, useState } from 'react'
import Image from 'next/image'
import HeroParagraph from '@/components/HeroParagraph'
import { contentDrift, revealProgress } from '@/lib/reveal'

// The wordmark→content dissolve should only play the FIRST time Home is opened
// in a session. Returning Home (e.g. via the nav "Home" link) must jump straight
// to the revealed content, not replay the intro (Fas 07/21). We latch that in
// sessionStorage once the reveal completes. useLayoutEffect on the client (and a
// no-op on the server) applies the latched state before paint, so there's no
// flash of the intro on return.
const REVEAL_KEY = 'home-revealed'
const useIsoLayoutEffect =
  typeof window !== 'undefined' ? useLayoutEffect : useEffect

/**
 * aidesign-os-style shell hero (Fas 06/14 ask — reference: aidesign-os.com).
 *
 * Faithful behaviour (Fas 06/22):
 *  - The giant "Fas lebbie / Ph.D." wordmark NEVER moves, scales or wobbles. It
 *    lives in a FIXED, parallax background layer that stays put while the page
 *    scrolls over it — so it remains behind every section, all the way down.
 *  - It is slightly soft (tiny ~2px text-shadow), not sharp.
 *  - On scroll its colour fades from near-black toward the page grey; the real
 *    content (the clickable paragraph, then the About copy) reads on top.
 */

// smoothstep ramp: 0 below `a`, 1 above `b`, eased in between.
function ramp(a: number, b: number, t: number) {
  const x = Math.min(1, Math.max(0, (t - a) / (b - a)))
  return x * x * (3 - 2 * x)
}

// The paragraph starts as the dim, blurred BACK layer behind the wordmark
// (matches the About page), then brightens + de-blurs as it comes forward.
const START_OPACITY = 0.32
const START_BLUR = 2 // px

// linear blend between two rgb triples → "rgb(r, g, b)"
const NEAR_BLACK: [number, number, number] = [32, 32, 30]
const FADED_GREY: [number, number, number] = [183, 183, 175]
function mix(t: number) {
  const c = NEAR_BLACK.map((a, i) => Math.round(a + (FADED_GREY[i] - a) * t))
  return `rgb(${c[0]}, ${c[1]}, ${c[2]})`
}

export default function V2Hero() {
  const ref = useRef<HTMLElement>(null)
  const [p, setP] = useState(0) // 0 = top, 1 = past the hero scroll range
  // The dissolve plays ONCE. `fade`/`rEff` RATCHET — they can only ever
  // increase, never decrease — so once the wordmark has receded and the content
  // is clear, scrolling back up (even all the way to the top) never brings it
  // forward again (Fas/Israel 07/04 — "it should never come up again… only the
  // first time"). A boolean latch wasn't enough because the wordmark drops
  // behind at ~50% but only "completed" near 100%. Computed in the scroll
  // handler (refs can't be touched during render).
  const [fade, setFade] = useState(0) // 0 = wordmark in front, 1 = fully receded
  const [rEff, setREff] = useState(0) // ratcheted content drift progress
  const fadeMax = useRef(0)
  const rMax = useRef(0)

  // If Home has already been revealed this session, start fully revealed so the
  // content shows immediately (no scroll-to-reveal, no intro replay).
  useIsoLayoutEffect(() => {
    if (sessionStorage.getItem(REVEAL_KEY)) {
      fadeMax.current = 1
      rMax.current = 1
      setP(1)
      setFade(1)
      setREff(1)
    }
  }, [])

  useEffect(() => {
    const el = ref.current
    if (!el) return
    const onScroll = () => {
      const total = el.offsetHeight - window.innerHeight
      const scrolled = Math.min(
        Math.max(-el.getBoundingClientRect().top, 0),
        total,
      )
      const pv = total > 0 ? scrolled / total : 0
      setP(pv)
      // Wide, gentle ramp so the transition "dissolves" in softly (Israel 06/23).
      const nextFade = Math.max(fadeMax.current, ramp(0.04, 0.72, pv))
      fadeMax.current = nextFade
      setFade(nextFade)
      // Latch "revealed" once the dissolve is essentially complete, so future
      // returns to Home skip the intro.
      if (nextFade >= 0.99) sessionStorage.setItem(REVEAL_KEY, '1')
      const nextR = Math.max(
        rMax.current,
        revealProgress(window.scrollY, window.innerHeight),
      )
      rMax.current = nextR
      setREff(nextR)
    }
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    window.addEventListener('resize', onScroll)
    return () => {
      window.removeEventListener('scroll', onScroll)
      window.removeEventListener('resize', onScroll)
    }
  }, [])

  const nameColor = mix(fade)
  // Tiny softening only (Israel 06/22: "very small, about 1–2px"), not the heavy
  // "text overload" blur.
  const nameShadow = `0 0 1.5px ${nameColor}`
  // Once it recedes, fade the whole wordmark down so it's only barely
  // perceptible behind the content (Fas 06/23 — "apply more opacity… users can
  // notice that barely").
  const nameOpacity = 1 - fade * 0.7
  // Wordmark sits ON TOP at the very first moment (sharp, dark) so the bio
  // paragraph reads as the dim, blurred BACK layer behind it; once it recedes it
  // drops behind every section (z below the nav's z-40). Mirrors the About
  // watermark treatment.
  const nameZ = fade < 0.5 ? 30 : -10
  // The portrait should STAND OUT and stay clear — it must not blend into the
  // wordmark (Israel 06/23: "this is supposed to stand out… nothing is on top of
  // this"). Keep it near-full and only gently soften as the page recedes.
  const portraitOpacity = 0.55 + (1 - fade) * 0.45

  // Content is visible from the FIRST moment as the back layer — dim + blurred
  // behind the wordmark — then brightens, de-blurs and comes forward as you
  // scroll (Fas 06/24: "at the first moment we should see the content in back").
  const paraOpacity = START_OPACITY + fade * (1 - START_OPACITY)
  const paraBlur = (1 - fade) * START_BLUR
  const paraFront = fade >= 0.4

  return (
    <section ref={ref} className="relative h-[240vh] shrink-0">
      {/* FIXED parallax background — stays behind every section of the page.
          Layout per Figma 224-747: "Fas lebbie" + portrait on one line, then
          "Ph.D." on the next line, right-aligned. No background words. */}
      <div
        aria-hidden
        style={{
          color: nameColor,
          textShadow: nameShadow,
          opacity: nameOpacity,
          zIndex: nameZ,
        }}
        className="pointer-events-none fixed inset-0 flex select-none flex-col justify-center overflow-hidden font-grotesk font-bold leading-[0.8] tracking-[-0.03em] will-change-[color,opacity]"
      >
        {/* Big wordmark STRETCHED across the full width, sitting a touch below
            centre like aidesign-os (Israel 06/23 — "bring it down a bit… it
            should be bigger, stretched across, the image is just in the
            corner"). "Fas lebbie" spans the left with the portrait tucked into
            the top-right corner; "Ph.D." is right-aligned beneath. */}
        <div className="w-full translate-y-[20vh] px-[4vw]">
          {/* Portrait tucked right up against "lebbie" (Israel 06/24 — "this
              image should be closer… it's too far away"): pack the row to the
              left with a small gap instead of pushing the photo to the edge. */}
          <div className="flex items-start justify-start gap-[1.5vw]">
            <span className="whitespace-nowrap text-[clamp(72px,15vw,250px)]">
              Fas lebbie
            </span>
            {/* Portrait tucked in the corner, in front, with a soft shadow so it
                STANDS OUT and never blends into the wordmark letters. */}
            <Image
              src="/portrait-home.png"
              alt=""
              width={1111}
              height={1416}
              priority
              style={{ opacity: portraitOpacity }}
              className="relative z-10 mt-[1.5vh] aspect-161/145 w-20 shrink-0 bg-[#f0f0f0] object-cover object-center shadow-[0_10px_34px_rgba(0,0,0,0.22)] lg:w-[clamp(120px,11vw,180px)]"
            />
          </div>
          {/* Bigger gap between "Fas lebbie" and "Ph.D." (Israel 06/26). In em
              so it tracks the responsive wordmark size. */}
          <span className="mt-[0.34em] block text-right text-[clamp(72px,15vw,250px)]">
            Ph.D.
          </span>
        </div>
      </div>

      {/* (1) → (2) counter (fixed, subtle) */}
      <div
        aria-hidden
        className="pointer-events-none fixed right-6 top-6 z-30 font-grotesk text-[14px] tabular-nums tracking-[0.15em] text-black/40"
      >
        ({p < 0.5 ? 1 : 2})<span className="text-black/20"> / (2)</span>
      </div>

      {/* Interactive paragraph — fades to the foreground (opacity only). The
          block is CENTRED in the viewport (equal margins); the text inside stays
          left-aligned to match Figma (Israel 06/23 — "justify to the left"). */}
      <div
        style={{
          opacity: paraOpacity,
          filter: paraBlur ? `blur(${paraBlur}px)` : undefined,
          transform: contentDrift(rEff),
          pointerEvents: paraFront ? 'auto' : 'none',
        }}
        className="sticky top-0 flex h-screen items-center justify-center px-6 will-change-[opacity,filter,transform] lg:px-[5vw]"
      >
        <div className="w-full max-w-272 text-left">
          <HeroParagraph storyHref="/about" />
        </div>
      </div>
    </section>
  )
}

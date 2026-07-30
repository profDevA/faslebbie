'use client'

import { useEffect, useRef, useState } from 'react'
import Image from 'next/image'
import HeroParagraph from '@/components/HeroParagraph'
import type { HomeContentData } from '@/lib/homeFromSanity'
import { HOME_INTRO_REVEAL } from '@/lib/reveal'

// Returning to Home from another page must NOT replay the intro (Fas 07/21), so
// completing it latches a flag in sessionStorage.
const REVEAL_KEY = 'home-revealed'

// False again on every full document load, but survives client-side navigation.
// This is what tells the two cases apart:
//
//  - Full page load. The server has ALREADY rendered (and the browser is about
//    to paint) the intro's first frame — wordmark in front, paragraph dim behind.
//    Nothing we do after hydration can un-paint that, so honouring the latch
//    here is exactly what made the wordmark "show for about 0.1s and disappear"
//    (Fas 07/30). So a full load always plays the intro, from its first frame.
//  - Client-side navigation back to Home. React renders on the client with no
//    server HTML involved, so the latch can be applied in the very first render
//    and the settled page is the only thing ever painted.
let documentPainted = false

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
 *
 * Fas 07/30: the dissolve is restored on HOME ONLY (section pages stay settled —
 * see INTRO_REVEAL). It is driven by real vertical page scroll, so the hero has
 * to be tall enough to scroll through — the `h-[200vh]` below is what makes Home
 * scrollable at all — but that scroll is spent ENTIRELY on the dissolve: both
 * layers are fixed to the viewport, so nothing on screen ever travels. The "no
 * phantom up/down scroll" fix stays in place for every state where the intro
 * ISN'T playing: coming back to Home from another page gives a single screen with
 * no scrollbar.
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

/**
 * Starting point for every progress value: 0 = wordmark in front / paragraph dim
 * behind it (the intro's first frame), 1 = fully settled.
 *
 * Whatever this returns is what gets PAINTED first, so it must already be the
 * final answer — never "intro" followed by a correction (Fas 07/30: "it appears
 * in front about 0.1s… it should be behind from the first moment"). During SSR
 * and the hydration pass it therefore has to return the same thing, and the
 * session latch only gets a say once we're past that.
 */
function startProgress() {
  if (!HOME_INTRO_REVEAL) return 1
  if (typeof window === 'undefined' || !documentPainted) return 0
  return sessionStorage.getItem(REVEAL_KEY) ? 1 : 0
}

export default function V2Hero({ content }: { content?: HomeContentData }) {
  const ref = useRef<HTMLElement>(null)
  const [start] = useState(startProgress)
  const [p, setP] = useState(start) // 0 = top, 1 = past the hero scroll range
  // The dissolve plays ONCE. `fade`/`rEff` RATCHET — they can only ever
  // increase, never decrease — so once the wordmark has receded and the content
  // is clear, scrolling back up (even all the way to the top) never brings it
  // forward again (Fas/Israel 07/04 — "it should never come up again… only the
  // first time"). A boolean latch wasn't enough because the wordmark drops
  // behind at ~50% but only "completed" near 100%. Computed in the scroll
  // handler (refs can't be touched during render).
  const [fade, setFade] = useState(start) // 0 = wordmark in front, 1 = receded
  const fadeMax = useRef(start)

  useEffect(() => {
    documentPainted = true
  }, [])

  // The intro is "live" — and Home is therefore scrollable — whenever the page
  // opened on the intro's first frame. Decided at the first render and never
  // changed afterwards: the hero's height depends on it, and shrinking the page
  // mid-gesture would clamp the scroll position and yank the visitor back to the
  // top halfway through the dissolve.
  const introActive = start === 0

  useEffect(() => {
    if (!introActive) return // no dissolve to drive; see INTRO_REVEAL in lib/reveal
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
      // It finishes at the BOTTOM of the pin (pv 1) rather than at 72%, so the
      // scroll the visitor is given is exactly the scroll the dissolve needs —
      // no leftover stretch that scrolls with nothing happening in it. The pin
      // was shortened to match, so the pacing per scrolled pixel is unchanged.
      const nextFade = Math.max(fadeMax.current, ramp(0.06, 1, pv))
      fadeMax.current = nextFade
      setFade(nextFade)
      // Latch "revealed" once the dissolve is essentially complete, so future
      // returns to Home skip the intro.
      if (nextFade >= 0.99) sessionStorage.setItem(REVEAL_KEY, '1')
    }
    // A reload keeps the browser's old scroll position, which would hand the
    // intro to the scroll handler already finished. Start it from the top.
    if (window.scrollY) window.scrollTo(0, 0)
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    window.addEventListener('resize', onScroll)
    return () => {
      window.removeEventListener('scroll', onScroll)
      window.removeEventListener('resize', onScroll)
    }
  }, [introActive])

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

  // THIS is what gives Home its vertical scroll: 200vh = one screen of content
  // plus one screen of scroll for the dissolve to play through, which now ends
  // exactly at the bottom of it.
  //
  // Once the intro has played (or on any later visit this session) the extra
  // screen would be scroll with nothing in it — the Home that "goes up and down
  // but there's nothing to go down to" Fas flagged — so it collapses to a single
  // screen. NOT `h-screen`: the nav is `sticky`, which still occupies flow space,
  // so a 100vh hero under a 52px nav makes the page 52px taller than the viewport
  // and you get a scrollbar with nothing behind it. Subtract the nav (h-13 =
  // 3.25rem) so a settled Home fits exactly one screen, no scrollbar.
  const heroHeight = introActive ? 'h-[200vh]' : 'h-[calc(100vh-3.25rem)]'

  return (
    <section ref={ref} className={`relative shrink-0 ${heroHeight}`}>
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

      {/* (1) → (2) counter (fixed, subtle) — tracks the intro's two stages, so
          it's meaningless (and stuck on "2 / 2") once the intro is off. */}
      {introActive && (
        <div
          aria-hidden
          className="pointer-events-none fixed right-6 top-6 z-30 font-grotesk text-[14px] tabular-nums tracking-[0.15em] text-black/40"
        >
          ({p < 0.5 ? 1 : 2})<span className="text-black/20"> / (2)</span>
        </div>
      )}

      {/* Interactive paragraph — it ONLY brightens and de-blurs. The text never
          moves: not a slide, not a rise, not a pixel, from the first frame
          onwards (Fas 07/30 — "text should not move from start to forever").
          While the intro is scrolling it is therefore FIXED to the viewport, not
          `sticky` (sticky still slides up by the height of the nav before it
          latches). The box is the exact area a settled Home lays the paragraph
          out in — under the nav, down to the bottom — so both states centre it
          identically; the text inside stays left-aligned to match Figma (Israel
          06/23 — "justify to the left"). */}
      <div
        style={{
          opacity: paraOpacity,
          filter: paraBlur ? `blur(${paraBlur}px)` : undefined,
          pointerEvents: paraFront ? 'auto' : 'none',
        }}
        className={`flex items-center justify-center px-6 will-change-[opacity,filter] lg:px-[5vw] ${
          introActive ? 'fixed inset-x-0 bottom-0 top-13' : 'h-full'
        }`}
      >
        <div className="w-full max-w-272 text-left">
          <HeroParagraph
            storyHref={content?.storyHref ?? '/about'}
            segments={content?.segments}
          />
        </div>
      </div>
    </section>
  )
}

import Link from "next/link";
import { navItems } from "@/lib/content";

function BracketLink({ label, href }: { label: string; href: string }) {
  return (
    <Link
      href={href}
      data-cursor="hover"
      className="whitespace-nowrap font-serif font-medium uppercase tracking-[0.02em]"
    >
      <span className="font-normal">[</span>
      {label}
      <span className="font-normal">]</span>
    </Link>
  );
}

export default function Nav() {
  return (
    <header className="sticky top-0 z-40 bg-bg shadow-[0_2px_4px_rgba(0,0,0,0.08)]">
      <div className="mx-auto flex h-[52px] max-w-[1380px] items-center justify-between gap-8 px-6">
        <Link
          href="/"
          data-cursor="hover"
          className="whitespace-nowrap font-logo text-[20px] font-bold tracking-[-0.02em]"
        >
          Fas Lebbie, Ph.D.
        </Link>
        <nav className="hidden items-center gap-9 text-[14px] lg:flex">
          {navItems.map((item) => (
            <BracketLink key={item.href} {...item} />
          ))}
        </nav>
        <Link
          href="/contact"
          data-cursor="hover"
          className="font-serif text-[16px] font-medium uppercase"
        >
          Contact
        </Link>
      </div>
      <nav className="flex flex-wrap items-center justify-center gap-x-5 gap-y-1 px-4 pb-2 text-[12px] lg:hidden">
        {navItems.map((item) => (
          <BracketLink key={item.href} {...item} />
        ))}
      </nav>
    </header>
  );
}

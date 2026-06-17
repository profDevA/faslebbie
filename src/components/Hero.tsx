import Image from "next/image";
import HeroParagraph from "@/components/HeroParagraph";

export default function Hero() {
  return (
    <section className="mx-auto flex w-full max-w-272 flex-col items-center px-6 pb-24">
      {/* ~square frame per Figma 2:507 (161×145); object-cover crops the tall
          source photo, object-top keeps the face in frame. */}
      <Image
        src="/portrait.png"
        alt="Portrait of Fas Lebbie"
        width={161}
        height={145}
        priority
        className="mt-15 h-36.25 w-40.25 object-cover object-top"
      />
      <HeroParagraph className="mt-12 w-full text-left lg:text-center" storyHref="/about" />
    </section>
  );
}

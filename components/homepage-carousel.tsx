"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import type { HomepageSlide } from "@/lib/homepage-slides";
import { TimeAwareHero } from "@/components/time-aware-hero";

export function HomepageCarousel({ slides }: { slides: HomepageSlide[] }) {
  const [activeIndex, setActiveIndex] = useState(0);
  const hasMultipleSlides = slides.length > 1;

  useEffect(() => {
    if (!hasMultipleSlides) return;
    const motionPreference = window.matchMedia("(prefers-reduced-motion: reduce)");
    if (motionPreference.matches) return;
    const interval = window.setInterval(() => setActiveIndex((current) => (current + 1) % slides.length), 5000);
    return () => window.clearInterval(interval);
  }, [hasMultipleSlides, slides.length]);

  if (!slides.length) return <TimeAwareHero />;

  const safeIndex = activeIndex % slides.length;
  const activeSlide = slides[safeIndex];
  const image = <img src={activeSlide.image_url} alt={activeSlide.alt_text} fetchPriority="high" />;

  return (
    <section className="homepage-carousel" aria-label="首页轮播">
      {activeSlide.href ? <Link href={activeSlide.href} className="homepage-carousel-image">{image}</Link> : <div className="homepage-carousel-image">{image}</div>}
      {hasMultipleSlides ? <>
        <button type="button" className="homepage-carousel-arrow is-previous" onClick={() => setActiveIndex((current) => (current - 1 + slides.length) % slides.length)} aria-label="上一张轮播图">‹</button>
        <button type="button" className="homepage-carousel-arrow is-next" onClick={() => setActiveIndex((current) => (current + 1) % slides.length)} aria-label="下一张轮播图">›</button>
        <div className="homepage-carousel-dots" aria-label="选择轮播图">
          {slides.map((slide, index) => <button type="button" key={slide.id} className={index === safeIndex ? "is-active" : ""} onClick={() => setActiveIndex(index)} aria-label={`第 ${index + 1} 张`} aria-current={index === safeIndex ? "true" : undefined} />)}
        </div>
      </> : null}
    </section>
  );
}
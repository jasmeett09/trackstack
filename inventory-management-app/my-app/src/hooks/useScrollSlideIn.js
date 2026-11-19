import { useLayoutEffect } from 'react';
import gsap from 'gsap';

const slideSelector = '[data-scroll-slide]';

function getStartOffset(element) {
  const viewportWidth = document.documentElement.clientWidth;
  const bounds = element.getBoundingClientRect();
  const rightOverflow = Math.max(0, element.scrollWidth - element.clientWidth);
  const fromRight = element.dataset.scrollSlide === 'right';
  const rightSpace = viewportWidth - bounds.right - rightOverflow;
  const maxTravel = viewportWidth < 768 ? 14 : 30;
  const useRight = fromRight && (rightSpace >= 6 || rightSpace >= bounds.left);
  const space = useRight ? rightSpace : bounds.left;
  const travel = Math.min(maxTravel, Math.max(0, space - 1));
  return useRight ? travel : -travel;
}

function playSlide(element) {
  gsap.fromTo(element, { x: getStartOffset(element), opacity: 0 }, {
    x: 0,
    opacity: 1,
    duration: 0.52,
    ease: 'power2.out',
    clearProps: 'transform,opacity'
  });
}

export default function useScrollSlideIn(surfaceRef) {
  useLayoutEffect(() => {
    if (!('IntersectionObserver' in window)) return;

    const surface = surfaceRef.current;
    const media = gsap.matchMedia();

    media.add('(prefers-reduced-motion: no-preference)', (context) => {
      const waiting = [];
      for (const element of surface.querySelectorAll(slideSelector)) {
        const { top, bottom } = element.getBoundingClientRect();
        const onEntry = element.hasAttribute('data-scroll-slide-initial');

        if (onEntry && top < window.innerHeight - 20 && bottom > 0) {
          playSlide(element);
        } else if (onEntry || top >= window.innerHeight) {
          waiting.push(element);
        }
      }

      if (!waiting.length) return;

      gsap.set(waiting, { opacity: 0 });
      const observer = new IntersectionObserver((entries) => {
        for (const { isIntersecting, target } of entries) {
          if (!isIntersecting) continue;
          observer.unobserve(target);
          context.add(() => playSlide(target));
        }
      }, { rootMargin: '0px 0px -20px 0px' });

      waiting.forEach((element) => observer.observe(element));
      return () => observer.disconnect();
    });

    return () => media.revert();
  }, [surfaceRef]);
}

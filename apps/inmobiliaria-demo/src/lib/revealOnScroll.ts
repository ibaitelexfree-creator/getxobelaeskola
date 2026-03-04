'use client';

/**
 * A simple utility to create a ref callback for scroll reveal animations.
 * Usage: <div ref={revealOnScroll(0.1)}>...</div>
 */
export const revealOnScroll = (delay: number = 0) => {
    return (el: HTMLElement | null) => {
        if (!el) return;

        const observer = new IntersectionObserver(
            ([entry]) => {
                if (entry.isIntersecting) {
                    setTimeout(() => {
                        el.classList.add('is-visible');
                    }, delay * 1000);
                    observer.unobserve(el);
                }
            },
            { threshold: 0.1 }
        );

        observer.observe(el);
    };
};

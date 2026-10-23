"use client";
import { useEffect } from "react";
import { usePathname } from "next/navigation";
import { useMotion } from "./motion";

export default function EditorialEffects() {
  const { enabled } = useMotion();
  const pathname = usePathname();
  useEffect(() => {
    const progress = document.querySelector('.spatial-scroll-progress span');
    let frame = null;
    const update = () => {
      frame = null;
      const distance = document.documentElement.scrollHeight - innerHeight;
      if (progress) progress.style.transform = `scaleX(${distance > 0 ? scrollY / distance : 0})`;
    };
    const schedule = () => { if (frame === null) frame = requestAnimationFrame(update); };
    update();
    window.addEventListener('scroll', schedule, { passive: true });
    window.addEventListener('resize', schedule);
    return () => {
      window.removeEventListener('scroll', schedule);
      window.removeEventListener('resize', schedule);
      if (frame !== null) cancelAnimationFrame(frame);
    };
  }, []);

  useEffect(() => {
    if (!enabled) return undefined;
    const animations = [];
    const counters = [];
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        observer.unobserve(entry.target);
        const target = Number(entry.target.dataset.countTarget);
        if (!Number.isInteger(target) || target < 1 || target > 99) return;
        const reel = document.createElement('span');
        reel.className = 'spatial-counter-reel';
        reel.setAttribute('aria-hidden', 'true');
        for (let value = 0; value <= target; value++) {
          const digit = document.createElement('span');
          digit.textContent = String(value);
          reel.appendChild(digit);
        }
        entry.target.classList.add('is-counting');
        entry.target.appendChild(reel);
        counters.push(entry.target);
        animations.push(reel.animate([
          { transform: 'translateY(0)' },
          { transform: `translateY(-${100 * target / (target + 1)}%)` },
        ], { duration: 1100, easing: 'cubic-bezier(.2,.7,.2,1)', fill: 'forwards' }));
      });
    }, { threshold: .8 });
    document.querySelectorAll('[data-count-target]').forEach((element) => observer.observe(element));
    return () => {
      observer.disconnect();
      animations.forEach((animation) => animation.cancel());
      counters.forEach((element) => { element.querySelector('.spatial-counter-reel')?.remove(); element.classList.remove('is-counting'); });
    };
  }, [enabled, pathname]);

  // Animate only when a reader reaches content. Static/no-JS content stays visible.
  useEffect(() => {
    if (!enabled) return undefined;
    const root = document.querySelector('.theme-spatial main');
    if (!root) return undefined;
    const seen = new WeakSet();
    const animations = new Set();
    const selector = [
      '.spatial-section-title', '.spatial-letter-body', '.spatial-role',
      '.spatial-project-feature', '.spatial-skill-group', '.spatial-record-list > li',
      '.portfolio-certificate', '.spatial-articles > li', '.spatial-resume-document',
      '.spatial-contact-copy', '.spatial-contact-form', '.spatial-route-head',
      '.spatial-route .spatial-project:not(.spatial-project-feature)',
    ].join(',');
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(({ target, isIntersecting }) => {
        if (!isIntersecting) return;
        observer.unobserve(target);
        // About is the first reading stop: never fade its content out on arrival.
        if (target.id === 'spatial-about-title') return;
        const isAbout = Boolean(target.closest('#about'));
        const siblings = [...(target.parentElement?.children ?? [])];
        const delay = isAbout ? 0 : Math.min(siblings.indexOf(target) % 4, 3) * 70;
        const animation = target.animate([
          { opacity: isAbout ? 1 : 0, transform: isAbout ? 'translateY(12px)' : 'translateY(28px)' },
          { opacity: 1, transform: 'translateY(0)' },
        ], { duration: isAbout ? 450 : 700, delay, easing: 'cubic-bezier(.2,.7,.2,1)', fill: 'backwards' });
        animations.add(animation);
        animation.onfinish = () => animations.delete(animation);
      });
    }, { threshold: 0, rootMargin: '0px 0px -48px 0px' });
    const discover = (node) => {
      if (!(node instanceof Element)) return;
      const elements = [...node.querySelectorAll(selector)];
      if (node.matches(selector)) elements.unshift(node);
      elements.forEach((element) => {
        if (seen.has(element)) return;
        seen.add(element);
        observer.observe(element);
      });
    };
    discover(root);
    // Writing is streamed; register later content as well as the initial HTML.
    const mutations = new MutationObserver((records) => {
      records.forEach(({ addedNodes }) => addedNodes.forEach(discover));
    });
    mutations.observe(root, { childList: true, subtree: true });
    return () => {
      observer.disconnect();
      mutations.disconnect();
      animations.forEach((animation) => animation.cancel());
    };
  }, [enabled, pathname]);

  useEffect(() => {
    const media = matchMedia('(hover: hover) and (pointer: fine)');
    if (!enabled || !media.matches) return undefined;
    const cards = [...document.querySelectorAll('.spatial-project-feature, .spatial-portrait-scene')];
    const cleanups = cards.map((card) => {
      let frame = null;
      let pointer = null;
      const update = () => {
        frame = null;
        if (!pointer) return;
        const bounds = card.getBoundingClientRect();
        const x = pointer.x - bounds.left;
        const y = pointer.y - bounds.top;
        card.style.setProperty('--pointer-x', `${x}px`);
        card.style.setProperty('--pointer-y', `${y}px`);
        if (card.classList.contains('spatial-portrait-scene')) {
          card.style.setProperty('--tilt-x', `${(0.5 - y / bounds.height) * 7}deg`);
          card.style.setProperty('--tilt-y', `${(x / bounds.width - 0.5) * 9}deg`);
        }
      };
      const move = (event) => {
        pointer = { x: event.clientX, y: event.clientY };
        if (frame === null) frame = requestAnimationFrame(update);
      };
      const reset = () => {
        pointer = null;
        if (frame !== null) cancelAnimationFrame(frame);
        frame = null;
        ['--pointer-x', '--pointer-y', '--tilt-x', '--tilt-y'].forEach((key) => card.style.removeProperty(key));
      };
      card.addEventListener('pointermove', move, { passive: true });
      card.addEventListener('pointerleave', reset);
      return () => {
        card.removeEventListener('pointermove', move);
        card.removeEventListener('pointerleave', reset);
        reset();
      };
    });
    return () => cleanups.forEach((cleanup) => cleanup());
  }, [enabled, pathname]);
  return null;
}

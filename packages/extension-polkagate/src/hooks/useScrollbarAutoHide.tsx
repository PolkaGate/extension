// Copyright 2017-2025 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

// @ts-nocheck

import { useEffect, useMemo } from 'react';

export default function useScrollbarAutoHide () {
  const opts = useMemo(() => ({
    autoHideAfter: 700,
    bgColor: 'transparent',
    minThumb: 20,
    thumbColor: '#674394',
    width: 4
  }), []);

  useEffect(() => {
    // ---- style (once per hook instance)
    const style = document.createElement('style');

    style.textContent = `
      .osb-track {
        position: fixed;
        top: 0;
        right: 0;
        width: ${opts.width}px;
        background: ${opts.bgColor};
        border-radius: 6px;
        opacity: 0;
        transition: opacity .2s ease;
        z-index: 2147483646; /* on top, but below browser UI */
        pointer-events: auto;
      }
      .osb-track:hover { background: ${opts.bgColor}; }
      .osb-thumb {
        position: absolute;
        top: 0;
        right: 0;
        width: 100%;
        min-height: ${opts.minThumb}px;
        border-radius: 6px;
        background: ${opts.thumbColor};
        cursor: default;
        transition: background-color .2s;
        will-change: transform, height;
      }
      .osb-thumb:active { cursor: default; }
    `;
    document.head.appendChild(style);

    interface Data {
      track: HTMLDivElement;
      thumb: HTMLDivElement;
      ro: ResizeObserver;
      hideTimer?: ReturnType<typeof setTimeout>;
    }

    const map = new WeakMap<HTMLElement, Data>();
    const raf = (cb: FrameRequestCallback) => requestAnimationFrame(cb);

    const isScrollable = (el: HTMLElement) => {
      const SCROLL_OPTIONS = ['auto', 'scroll', 'overlay'];
      const cs = getComputedStyle(el);
      const overflowY = cs.overflowY;
      const overflowX = cs.overflowX;
      const overflowOK = SCROLL_OPTIONS.includes(overflowY) || SCROLL_OPTIONS.includes(overflowX);

      if (!overflowOK) {
        return false;
      }

      // allow a tiny epsilon for subpixel rounding
      return el.scrollHeight - el.clientHeight > 1;
    };

    const updateFor = (el: HTMLElement) => {
      const d = map.get(el);

      if (!d) {
        return;
      }

      const rect = el.getBoundingClientRect();
      const rtl = getComputedStyle(el).direction === 'rtl';

      d.track.style.height = `${rect.height}px`;
      d.track.style.top = `${rect.top}px`;

      if (rtl) {
        d.track.style.left = `${rect.left}px`;
        d.track.style.right = '';
      } else {
        d.track.style.right = `${window.innerWidth - rect.right}px`;
        d.track.style.left = '';
      }

      const canScroll = isScrollable(el);

      d.track.style.display = canScroll ? 'block' : 'none';

      if (!canScroll) {
        return;
      }

      const trackH = d.track.offsetHeight;
      const thumbH = Math.max(
        opts.minThumb,
        (el.clientHeight / el.scrollHeight) * trackH
      );
      const maxTop = trackH - thumbH;
      const ratio =
        el.scrollTop / Math.max(1, el.scrollHeight - el.clientHeight);

      d.thumb.style.height = `${thumbH}px`;
      d.thumb.style.transform = `translateY(${ratio * maxTop}px)`;
    };

    const ensure = (el: HTMLElement): Data => {
      const existing = map.get(el);

      if (existing) {
        return existing;
      }

      const track = document.createElement('div');

      track.className = 'osb-track'.trim();

      const thumb = document.createElement('div');

      thumb.className = 'osb-thumb';
      track.appendChild(thumb);
      document.body.appendChild(track);

      const showThenAutoHide = (_el: HTMLElement, d: Data) => {
        d.track.style.opacity = '1';

        if (d.hideTimer) {
          clearTimeout(d.hideTimer);
        }

        d.hideTimer = setTimeout(() => {
          d.track.style.opacity = '0';
        }, opts.autoHideAfter);
      };

      const ro = new ResizeObserver(() => raf(() => updateFor(el)));

      ro.observe(el);

      const onScroll = () => {
        const d = map.get(el);

        if (!d) {
          return;
        }

        showThenAutoHide(el, d);
        raf(() => updateFor(el));
      };

      el.addEventListener('scroll', onScroll, { passive: true });

      const data: Data = { ro, thumb, track };

      map.set(el, data);

      // initial paint
      raf(() => {
        updateFor(el);
        showThenAutoHide(el, data);
      });

      return data;
    };

    // Activate when pointer enters scrollable elements
    const onPointerEnter = (e: Event) => {
      const el = e.target as HTMLElement | null;

      if (!el || !isScrollable(el)) {
        return;
      }

      const cs = getComputedStyle(el);
      const maybeScrollable =
        /auto|scroll/.test(cs.overflowY) || el.scrollHeight > el.clientHeight;

      if (maybeScrollable) {
        ensure(el);
        raf(() => updateFor(el));
      }
    };

    // Keep tracks aligned on window changes
    const onGlobalLayoutChange = () => {
      map.forEach((_, el) => raf(() => updateFor(el)));
    };

    document.addEventListener('pointerenter', onPointerEnter, true);
    window.addEventListener('scroll', onGlobalLayoutChange, true);
    window.addEventListener('resize', onGlobalLayoutChange);

    // Cleanup
    return () => {
      document.head.removeChild(style);
      document.removeEventListener('pointerenter', onPointerEnter, true);
      window.removeEventListener('scroll', onGlobalLayoutChange, true);
      window.removeEventListener('resize', onGlobalLayoutChange);
      map.forEach((d) => {
        d.ro.disconnect();

        if (d.hideTimer) {
          clearTimeout(d.hideTimer);
        }

        d.track.remove();
      });
      map.clear();
    };
  }, [opts.autoHideAfter, opts.bgColor, opts.minThumb, opts.thumbColor, opts.width]);
}

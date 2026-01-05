// Copyright 2017-2026 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

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
        background: ${opts.bgColor};
        border-radius: 6px;
        opacity: 0;
        transition: opacity .2s ease;
        z-index: 2147483646; /* on top, but below browser UI */
        pointer-events: none;
      }
      .osb-thumb {
        position: absolute;
        border-radius: 6px;
        background: ${opts.thumbColor};
        cursor: default;
        transition: background-color .2s;
        pointer-events: none;
      }
      .osb-thumb.vertical {
        top: 0;
        right: 0;
        width: 100%;
        min-height: ${opts.minThumb}px;
        will-change: transform, height;
      }
      .osb-thumb.horizontal {
        left: 0;
        bottom: 0;
        height: 100%;
        min-width: ${opts.minThumb}px;
        will-change: transform, width;
      }
      .osb-track.vertical {
        top: 0;
        right: 0;
        width: ${opts.width}px;
      }
      .osb-track.horizontal {
        left: 0;
        bottom: 0;
        height: ${opts.width}px;
      }
    `;
    document.head.appendChild(style);

    interface Data {
      vTrack: HTMLDivElement;
      vThumb: HTMLDivElement;
      hTrack: HTMLDivElement;
      hThumb: HTMLDivElement;
      ro: ResizeObserver;
      hideTimer?: ReturnType<typeof setTimeout>;
    }

    const map = new Map<HTMLElement, Data>();
    const raf = (cb: FrameRequestCallback) => requestAnimationFrame(cb);

    const isScrollable = (el: HTMLElement | null) => {
      if (!el || !(el instanceof Element)) {
        return { x: false, y: false };
      }

      const cs = getComputedStyle(el);
      const SCROLL_OPTIONS = ['auto', 'scroll', 'overlay'];

      const overflowY = SCROLL_OPTIONS.includes(cs.overflowY) && el.scrollHeight > el.clientHeight + 1;
      const overflowX = SCROLL_OPTIONS.includes(cs.overflowX) && el.scrollWidth > el.clientWidth + 1;

      return { x: overflowX, y: overflowY };
    };

    const updateFor = (el: HTMLElement) => {
      const d = map.get(el);

      if (!d) {
        return;
      }

      const rect = el.getBoundingClientRect();
      const { x, y } = isScrollable(el);

      // --- Vertical scrollbar ---
      if (y) {
        d.vTrack.style.display = 'block';
        d.vTrack.style.height = `${rect.height}px`;
        d.vTrack.style.top = `${rect.top}px`;
        d.vTrack.style.right = `${window.innerWidth - rect.right}px`;

        const trackH = d.vTrack.offsetHeight;
        const thumbH = Math.max(opts.minThumb, (el.clientHeight / el.scrollHeight) * trackH);
        const maxTop = trackH - thumbH;
        const ratio = el.scrollTop / Math.max(1, el.scrollHeight - el.clientHeight);

        d.vThumb.style.height = `${thumbH}px`;
        d.vThumb.style.transform = `translateY(${ratio * maxTop}px)`;
      } else {
        d.vTrack.style.display = 'none';
      }

      // --- Horizontal scrollbar ---
      if (x) {
        d.hTrack.style.display = 'block';
        d.hTrack.style.width = `${rect.width}px`;
        d.hTrack.style.left = `${rect.left}px`;
        d.hTrack.style.bottom = `${window.innerHeight - rect.bottom}px`;

        const trackW = d.hTrack.offsetWidth;
        const thumbW = Math.max(opts.minThumb, (el.clientWidth / el.scrollWidth) * trackW);
        const maxLeft = trackW - thumbW;
        const ratio = el.scrollLeft / Math.max(1, el.scrollWidth - el.clientWidth);

        d.hThumb.style.width = `${thumbW}px`;
        d.hThumb.style.transform = `translateX(${ratio * maxLeft}px)`;
      } else {
        d.hTrack.style.display = 'none';
      }
    };

    const ensure = (el: HTMLElement): Data => {
      const existing = map.get(el);

      if (existing) {
        return existing;
      }

      const vTrack = document.createElement('div');

      vTrack.className = 'osb-track vertical';

      const vThumb = document.createElement('div');

      vThumb.className = 'osb-thumb vertical';
      vTrack.appendChild(vThumb);

      const hTrack = document.createElement('div');

      hTrack.className = 'osb-track horizontal';

      const hThumb = document.createElement('div');

      hThumb.className = 'osb-thumb horizontal';
      hTrack.appendChild(hThumb);

      document.body.appendChild(vTrack);
      document.body.appendChild(hTrack);

      const showThenAutoHide = (d: Data) => {
        d.vTrack.style.opacity = '1';
        d.hTrack.style.opacity = '1';

        if (d.hideTimer) {
          clearTimeout(d.hideTimer);
        }

        d.hideTimer = setTimeout(() => {
          d.vTrack.style.opacity = '0';
          d.hTrack.style.opacity = '0';
        }, opts.autoHideAfter);
      };

      const ro = new ResizeObserver(() => raf(() => updateFor(el)));

      ro.observe(el);

      const onScroll = () => {
        const d = map.get(el);

        if (!d) {
          return;
        }

        showThenAutoHide(d);
        raf(() => updateFor(el));
      };

      el.addEventListener('scroll', onScroll, { passive: true });

      const data: Data = { hThumb, hTrack, ro, vThumb, vTrack };

      map.set(el, data);

      return data;
    };

    // Instead of pointerenter, just listen globally for scrollable elements
    const onScrollCapture = (e: Event) => {
      const el = e.target as HTMLElement;

      if (!el || !(el instanceof HTMLElement)) {
        return;
      }

      const { x, y } = isScrollable(el);

      if (x || y) {
        ensure(el);
      }
    };

    document.addEventListener('scroll', onScrollCapture, true);

    // Cleanup
    return () => {
      document.head.removeChild(style);
      window.removeEventListener('scroll', onScrollCapture, true);
      map.forEach((d, el) => {
        d.ro.disconnect();

        if (d.hideTimer) {
          clearTimeout(d.hideTimer);
        }

        d.vTrack.remove();
        d.hTrack.remove();
        map.delete(el);
      });
      map.clear();
    };
  }, [opts.autoHideAfter, opts.bgColor, opts.minThumb, opts.thumbColor, opts.width]);
}

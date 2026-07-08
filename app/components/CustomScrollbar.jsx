"use client";
import { useEffect, useRef, useCallback } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

const CustomScrollbar = () => {
  const thumbRef = useRef(null);
  const containerRef = useRef(null);
  const maxThumbMoveRef = useRef(0);
  const maxScrollRef = useRef(0);
  const isDraggingRef = useRef(false);

  const getScrollMetrics = useCallback(() => {
    const scrollHeight = document.documentElement.scrollHeight;
    const clientHeight = window.innerHeight;
    return {
      maxScroll: Math.max(scrollHeight - clientHeight, 1),
      scrollHeight,
      clientHeight,
    };
  }, []);

  const updateScrollbar = useCallback(() => {
    const thumb = thumbRef.current;
    const container = containerRef.current;
    if (!thumb || !container) return;

    const scrollbarHeight = container.getBoundingClientRect().height;
    const { scrollHeight, clientHeight } = getScrollMetrics();

    maxScrollRef.current = Math.max(scrollHeight - clientHeight, 1);
    const scrollRatio = clientHeight / scrollHeight;

    const thumbHeight = Math.max(scrollbarHeight * scrollRatio, 50);
    maxThumbMoveRef.current = scrollbarHeight - thumbHeight;

    gsap.set(thumb, { height: thumbHeight });
  }, [getScrollMetrics]);

  const applyScroll = useCallback((scrollY) => {
    const clamped = Math.max(0, Math.min(scrollY, maxScrollRef.current));
    const progress = maxScrollRef.current > 0 ? clamped / maxScrollRef.current : 0;
    gsap.set(thumbRef.current, { y: progress * maxThumbMoveRef.current });
    window.scrollTo(0, clamped);
  }, []);

  const updateThumbPosition = useCallback(() => {
    if (!maxScrollRef.current || !thumbRef.current || isDraggingRef.current) return;
    const progress = window.scrollY / maxScrollRef.current;
    gsap.set(thumbRef.current, { y: progress * maxThumbMoveRef.current });
  }, []);

  const scrollBy = useCallback((amount) => {
    applyScroll(window.scrollY + amount);
  }, [applyScroll]);

  const handleKeyDown = useCallback((e) => {
    const step = window.innerHeight * 0.1; // 10% of viewport per arrow press
    const page = window.innerHeight * 0.8; // 80% of viewport per page

    switch (e.key) {
      case "ArrowUp":
        e.preventDefault();
        scrollBy(-step);
        break;
      case "ArrowDown":
        e.preventDefault();
        scrollBy(step);
        break;
      case "PageUp":
        e.preventDefault();
        scrollBy(-page);
        break;
      case "PageDown":
        e.preventDefault();
        scrollBy(page);
        break;
      case "Home":
        e.preventDefault();
        applyScroll(0);
        break;
      case "End":
        e.preventDefault();
        applyScroll(maxScrollRef.current);
        break;
    }
  }, [scrollBy, applyScroll]);

  const handleThumbMouseDown = useCallback((e) => {
    e.preventDefault();
    isDraggingRef.current = true;

    const container = containerRef.current;
    const thumb = thumbRef.current;
    if (!container || !thumb) return;

    const thumbRect = thumb.getBoundingClientRect();
    const mouseOffsetY = e.clientY - thumbRect.top;

    const handleMouseMove = (e) => {
      if (!isDraggingRef.current) return;
      const currentContainerRect = container.getBoundingClientRect();
      const newThumbTop = e.clientY - currentContainerRect.top - mouseOffsetY;
      const clampedThumbTop = Math.max(0, Math.min(newThumbTop, maxThumbMoveRef.current));

      gsap.set(thumb, { y: clampedThumbTop, duration: 0 });

      const scrollProgress = maxThumbMoveRef.current > 0
        ? clampedThumbTop / maxThumbMoveRef.current
        : 0;
      const newScrollY = scrollProgress * maxScrollRef.current;

      requestAnimationFrame(() => {
        window.scrollTo(0, newScrollY);
      });
    };

    const handleMouseUp = () => {
      isDraggingRef.current = false;
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseup", handleMouseUp);
      document.body.style.userSelect = "";
    };

    document.body.style.userSelect = "none";
    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("mouseup", handleMouseUp);
  }, []);

  const handleTrackClick = useCallback((e) => {
    if (isDraggingRef.current) return;
    const container = containerRef.current;
    if (!container || !thumbRef.current) return;

    const rect = container.getBoundingClientRect();
    const clickY = e.clientY - rect.top;
    const thumbHeight = thumbRef.current.getBoundingClientRect().height;
    const thumbTop = parseFloat(gsap.getProperty(thumbRef.current, "y"));

    // Only jump if clicking on the track (not the thumb)
    if (clickY < thumbTop || clickY > thumbTop + thumbHeight) {
      const progress = maxThumbMoveRef.current > 0
        ? (clickY - thumbHeight / 2) / maxThumbMoveRef.current
        : 0;
      const clampedProgress = Math.max(0, Math.min(progress, 1));
      applyScroll(clampedProgress * maxScrollRef.current);
    }
  }, [applyScroll]);

  useEffect(() => {
    const initScrollTrigger = () => {
      ScrollTrigger.create({
        trigger: document.documentElement,
        start: "top top",
        end: "bottom bottom",
        onUpdate: updateThumbPosition,
        onRefresh: () => {
          updateScrollbar();
          updateThumbPosition();
        },
      });
    };

    updateScrollbar();
    initScrollTrigger();
    updateThumbPosition();

    const onResize = () => {
      updateScrollbar();
      ScrollTrigger.refresh();
      updateThumbPosition();
    };

    window.addEventListener("resize", onResize);

    const resizeObserver = new ResizeObserver(() => {
      onResize();
    });
    resizeObserver.observe(document.body);

    return () => {
      window.removeEventListener("resize", onResize);
      resizeObserver.disconnect();
      ScrollTrigger.getAll().forEach((trigger) => trigger.kill());
    };
  }, [updateScrollbar, updateThumbPosition]);

  return (
    <div
      ref={containerRef}
      className="hidden lg:block fixed top-[8vh] md:top-[5vh] right-0 md:right-[0.4vw] w-[0.4vw] h-[90vh] bg-white/25 rounded-md z-[1000] overflow-hidden"
      onClick={handleTrackClick}
    >
      <div
        ref={thumbRef}
        role="scrollbar"
        aria-valuenow={0}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-label="Scroll"
        tabIndex={0}
        className="w-full bg-white rounded-full absolute top-0 cursor-pointer focus:bg-primary focus:outline-none"
        onMouseDown={handleThumbMouseDown}
        onKeyDown={handleKeyDown}
      />
    </div>
  );
};

export default CustomScrollbar;

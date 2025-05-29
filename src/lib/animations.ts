/**
 * Animation utilities for the Threads application
 * Provides reusable animations for various UI components and interactions
 */

import { ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

// Helper function to merge Tailwind classes
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// ===== 1. FADE ANIMATIONS =====
export const fadeAnimations = {
  // Fade in from transparent to opaque
  fadeIn: "animate-in fade-in duration-300",
  // Fade in from transparent to opaque with a slight delay
  fadeInDelayed: "animate-in fade-in duration-300 delay-150",
  // Fade out from opaque to transparent
  fadeOut: "animate-out fade-out duration-300",
  // Fade in from bottom
  fadeInUp: "animate-in fade-in slide-in-from-bottom-4 duration-300",
  // Fade in from top
  fadeInDown: "animate-in fade-in slide-in-from-top-4 duration-300",
  // Fade in from left
  fadeInLeft: "animate-in fade-in slide-in-from-left-4 duration-300",
  // Fade in from right
  fadeInRight: "animate-in fade-in slide-in-from-right-4 duration-300",
};

// ===== 2. SLIDE/SCALE ANIMATIONS =====
export const transformAnimations = {
  // Slide in from bottom (for modals)
  slideInBottom: "animate-in slide-in-from-bottom duration-300",
  // Slide in from top (for dropdowns)
  slideInTop: "animate-in slide-in-from-top duration-300",
  // Slide in from left (for sidebars)
  slideInLeft: "animate-in slide-in-from-left duration-300",
  // Slide in from right (for sidebars)
  slideInRight: "animate-in slide-in-from-right duration-300",
  // Scale up from center (for modals, dialogs)
  scaleIn: "animate-in zoom-in-95 duration-300",
  // Scale up with fade (for images, cards)
  scaleFadeIn: "animate-in fade-in zoom-in-95 duration-300",
  // Scale down with fade (for closing modals)
  scaleFadeOut: "animate-out fade-out zoom-out-95 duration-300",
};

// ===== 3. HOVER EFFECT ANIMATIONS =====
export const hoverAnimations = {
  // Subtle scale on hover (for cards)
  scaleHover: "transition-transform duration-300 hover:scale-[1.02]",
  // Elevation hover (for cards, buttons)
  elevateHover: "transition-all duration-300 hover:shadow-lg hover:-translate-y-1",
  // Underline animation (for links)
  underlineHover: "relative after:absolute after:bg-primary after:bottom-0 after:left-0 after:h-[2px] after:w-0 after:transition-all after:duration-300 hover:after:w-full",
  // Background fill (for buttons)
  backgroundFillHover: "relative overflow-hidden transition-colors duration-300 before:absolute before:inset-0 before:z-0 before:bg-primary before:transition-transform before:duration-300 before:ease-out before:scale-x-0 before:origin-right hover:before:origin-left hover:before:scale-x-100 hover:text-primary-foreground",
  // Glow effect (for primary buttons)
  glowHover: "transition-all duration-300 hover:shadow-[0_0_15px_rgba(var(--primary)/0.5)]",
  // Border animation (for cards, buttons)
  borderHover: "transition-all duration-300 hover:border-primary",
};

// ===== 4. MICRO-INTERACTION ANIMATIONS =====
export const microAnimations = {
  // Pulse animation (for notifications, alerts)
  pulse: "animate-pulse",
  // Spin animation (for loading indicators)
  spin: "animate-spin",
  // Bounce animation (for alerts, notifications)
  bounce: "animate-bounce",
  // Ping animation (for notifications)
  ping: "animate-ping",
  // Button press effect
  buttonPress: "active:scale-95 transition-transform duration-200",
  // Input focus animation
  inputFocus: "transition-all duration-300 focus:ring-2 focus:ring-primary/30 focus:border-primary",
  // Toggle switch animation
  toggleSwitch: "transition-transform duration-200 transform",
};

// ===== 5. PAGE TRANSITION ANIMATIONS =====
// These are applied via React components or route change events
export const pageTransitions = {
  // Default page transition
  default: "animate-in fade-in duration-300",
  // Slide up transition
  slideUp: "animate-in fade-in slide-in-from-bottom-8 duration-500",
  // Slide down transition
  slideDown: "animate-in fade-in slide-in-from-top-8 duration-500",
  // Scale transition
  scale: "animate-in fade-in zoom-in-95 duration-500",
};

// ===== 6. PARALLAX SCROLLING =====
// This requires JavaScript implementation (see below)
export function setupParallax() {
  if (typeof window === "undefined") return;

  const parallaxElements = document.querySelectorAll<HTMLElement>("[data-parallax]");
  
  const handleScroll = () => {
    const scrollY = window.scrollY;
    
    parallaxElements.forEach((element) => {
      const speed = parseFloat(element.dataset.parallaxSpeed || "0.2");
      const direction = element.dataset.parallaxDirection || "up";
      const limit = parseFloat(element.dataset.parallaxLimit || "100");
      
      let yPos = 0;
      
      if (direction === "up") {
        yPos = Math.min(limit, scrollY * speed);
      } else if (direction === "down") {
        yPos = Math.max(-limit, -scrollY * speed);
      }
      
      element.style.transform = `translate3d(0, ${yPos}px, 0)`;
    });
  };
  
  window.addEventListener("scroll", handleScroll);
  
  // Call once to initialize
  handleScroll();
  
  // Return cleanup function
  return () => window.removeEventListener("scroll", handleScroll);
}

// ===== 7. SCROLL-TRIGGERED ANIMATIONS =====
// This uses Intersection Observer API
export function setupScrollAnimations() {
  if (typeof window === "undefined" || !("IntersectionObserver" in window)) return;
  
  const animatedElements = document.querySelectorAll<HTMLElement>("[data-animate-on-scroll]");
  
  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          const element = entry.target as HTMLElement;
          const animation = element.dataset.animation || "fadeIn";
          const delay = element.dataset.animationDelay || "0";
          
          // Add animation classes based on the data attribute
          element.style.animationDelay = `${delay}ms`;
          element.classList.add("animated", animation);
          
          // Optionally unobserve after animation is applied
          if (element.dataset.animateOnce === "true") {
            observer.unobserve(element);
          }
        } else if (entry.target.dataset.animateOnce !== "true") {
          // Remove animation classes when out of view (if not animate-once)
          entry.target.classList.remove("animated", entry.target.dataset.animation || "fadeIn");
        }
      });
    },
    {
      root: null,
      rootMargin: "0px",
      threshold: 0.1,
    }
  );
  
  animatedElements.forEach((element) => {
    observer.observe(element);
  });
  
  // Return cleanup function
  return () => observer.disconnect();
}

// React hook for scroll animations
export function useScrollAnimations() {
  if (typeof window === "undefined") return;
  
  const setupAnimations = () => {
    setupParallax();
    setupScrollAnimations();
  };
  
  // Call on mount and window resize
  window.addEventListener("load", setupAnimations);
  window.addEventListener("resize", setupAnimations);
  
  // Return cleanup function
  return () => {
    window.removeEventListener("load", setupAnimations);
    window.removeEventListener("resize", setupAnimations);
  };
}

// GSAP core CDN (can be replaced with npm build if needed)
// Place this in your theme.liquid or main layout file for production use
// For now, this is a local asset for development
import { gsap } from 'https://cdn.jsdelivr.net/npm/gsap@3.12.5/+esm';
import { ScrollTrigger } from 'https://cdn.jsdelivr.net/npm/gsap@3.12.5/ScrollTrigger.js?module';

gsap.registerPlugin(ScrollTrigger);

export { gsap, ScrollTrigger };

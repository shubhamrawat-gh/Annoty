import { SourceMappingResult } from './types';
/**
 * Analyzes a clicked DOM element using a tiered strategy:
 * Tier 1: React Fiber walk
 * Tier 2: Vue vnode / component walk
 * Tier 3: data-annoty-source attribute
 * Tier 4: Universal CSS selector + context fallback
 */
export declare function mapElementToSource(el: HTMLElement): SourceMappingResult;

'use client';

import {useEffect} from 'react';

/**
 * A hook that optimizes the page layout for mobile devices by injecting custom CSS
 * This specifically targets the game day view to make it more compact on mobile
 */
export function useMobileOptimizer() {
	useEffect(() => {
		// Only run on client
		if (typeof window === 'undefined') return;

		// Create a style element for mobile-specific optimizations
		const styleEl = document.createElement('style');
		styleEl.setAttribute('id', 'mobile-optimizer-style');

		// Add mobile-specific styles
		styleEl.innerHTML = `
      @media (max-width: 767px) {
        /* Game day specific mobile optimizations */
        .space-y-6 > * + * { 
          margin-top: var(--game-spacing) !important; 
        }
        
        h1.text-2xl {
          font-size: var(--heading-large) !important;
        }
        
        h2.text-xl {
          font-size: var(--heading-medium) !important;
          margin-bottom: var(--card-margin) !important;
        }
        
        h3.text-md {
          font-size: var(--heading-small) !important;
          margin-bottom: 0.25rem !important;
        }
        
        .mt-8 {
          margin-top: var(--team-selection-margin-top) !important;
        }
        
        .mb-12 {
          margin-bottom: var(--team-selection-margin-bottom) !important;
        }
        
        .p-3, .p-4 {
          padding: var(--card-padding) !important;
        }
        
        .py-8 {
          padding-top: 0.75rem !important;
          padding-bottom: 0.75rem !important;
        }
        
        .mb-4 {
          margin-bottom: var(--card-margin) !important;
        }
        
        .gap-4 {
          gap: var(--card-margin) !important;
        }
        
        .text-4xl {
          font-size: var(--score-size) !important;
        }
        
        .h-14 {
          height: var(--score-height) !important;
        }
        
        .py-2 {
          padding-top: 0.25rem !important;
          padding-bottom: 0.25rem !important;
        }
        
        .px-2 {
          padding-left: 0.25rem !important;
          padding-right: 0.25rem !important;
        }
        
        .space-y-4 > * + * {
          margin-top: var(--card-margin) !important;
        }
        
        .space-y-2 > * + * {
          margin-top: 0.25rem !important;
        }
        
        .space-y-1\\.5 > * + * {
          margin-top: 0.25rem !important;
        }
        
        /* Make team name containers smaller */
        .max-w-\\[110px\\] {
          max-width: 90px !important;
          font-size: 0.875rem !important;
          margin-bottom: 0.25rem !important;
        }
        
        /* Make goal indicators smaller */
        .min-w-\\[24px\\] {
          min-width: 20px !important;
          padding: 0.125rem 0.25rem !important;
        }
        
        /* Fix save button position */
        .fixed.bottom-6 {
          bottom: 1rem !important;
        }
        
        .fixed.right-6 {
          right: 1rem !important;
        }
        
        .fixed.left-6 {
          left: 1rem !important;
        }
      }
    `;

		// Append to document head
		document.head.appendChild(styleEl);

		// Clean up on unmount
		return () => {
			const existingStyle = document.getElementById('mobile-optimizer-style');
			if (existingStyle) {
				document.head.removeChild(existingStyle);
			}
		};
	}, []);
}

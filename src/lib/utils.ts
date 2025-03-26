import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import { cubicOut } from "svelte/easing";
import type { TransitionConfig } from "svelte/transition";

export function cn(...inputs: ClassValue[]) {
	return twMerge(clsx(inputs));
}

type FlyAndScaleParams = {
	y?: number;
	x?: number;
	start?: number;
	duration?: number;
};

export const flyAndScale = (
	node: Element,
	params: FlyAndScaleParams = { y: -8, x: 0, start: 0.95, duration: 150 }
): TransitionConfig => {
	const style = getComputedStyle(node);
	const transform = style.transform === "none" ? "" : style.transform;

	const scaleConversion = (
		valueA: number,
		scaleA: [number, number],
		scaleB: [number, number]
	) => {
		const [minA, maxA] = scaleA;
		const [minB, maxB] = scaleB;

		const percentage = (valueA - minA) / (maxA - minA);
		const valueB = percentage * (maxB - minB) + minB;

		return valueB;
	};

	const styleToString = (
		style: Record<string, number | string | undefined>
	): string => {
		return Object.keys(style).reduce((str, key) => {
			if (style[key] === undefined) return str;
			return str + `${key}:${style[key]};`;
		}, "");
	};

	return {
		duration: params.duration ?? 200,
		delay: 0,
		css: (t) => {
			const y = scaleConversion(t, [0, 1], [params.y ?? 5, 0]);
			const x = scaleConversion(t, [0, 1], [params.x ?? 0, 0]);
			const scale = scaleConversion(t, [0, 1], [params.start ?? 0.95, 1]);

			return styleToString({
				transform: `${transform} translate3d(${x}px, ${y}px, 0) scale(${scale})`,
				opacity: t
			});
		},
		easing: cubicOut
	};
};

/**
 * Get a placeholder image URL 
 * @param type - The type of placeholder ('item', 'container', 'location')
 * @param text - The text to display on the placeholder
 * @param width - Width of the placeholder image
 * @param height - Height of the placeholder image
 * @returns The placeholder URL
 */
export function getPlaceholderImage(
	type: 'item' | 'container' | 'location' = 'item', 
	text: string = '', 
	width: number = 200, 
	height: number = 200
): string {
	// If text is empty, use the type as text
	const displayText = text || type.charAt(0).toUpperCase() + type.slice(1);
	
	const colors = {
		item: 'e2e8f0/64748b', // Light gray/slate
		container: 'd1fae5/10b981', // Light green/emerald
		location: 'dbeafe/3b82f6'  // Light blue/blue
	};
	
	const color = colors[type] || colors.item;
	
	return `https://placehold.co/${width}x${height}/${color}?text=${encodeURIComponent(displayText)}`;
}
// src/utils/Stego/generateCoordinates.ts

import { TraversalMode } from "@/types/Stego";

// Traversal Coordinates
export function generateCoordinates(width: number, height: number, mode: TraversalMode): [number, number][] {
    const coords: [number, number][] = [];

    switch (mode) {
        case 'top-bottom-left-right':
            for (let y = 0; y < height; y++)
                for (let x = 0; x < width; x++)
                    coords.push([x, y]);
            break;
        case 'top-bottom-right-left':
            for (let y = 0; y < height; y++)
                for (let x = width - 1; x >= 0; x--)
                    coords.push([x, y]);
            break;
        case 'bottom-top-left-right':
            for (let y = height - 1; y >= 0; y--)
                for (let x = 0; x < width; x++)
                    coords.push([x, y]);
            break;
        case 'bottom-top-right-left':
            for (let y = height - 1; y >= 0; y--)
                for (let x = width - 1; x >= 0; x--)
                    coords.push([x, y]);
            break;
        case 'spiral-cw': {
            let top = 0, bottom = height - 1, left = 0, right = width - 1;
            while (top <= bottom && left <= right) {
                for (let x = left; x <= right; x++) coords.push([x, top]);
                top++;
                for (let y = top; y <= bottom; y++) coords.push([right, y]);
                right--;
                if (top <= bottom) { for (let x = right; x >= left; x--) coords.push([x, bottom]); bottom--; }
                if (left <= right) { for (let y = bottom; y >= top; y--) coords.push([left, y]); left++; }
            }
            break;
        }
        case 'spiral-ccw': {
            let top = 0, bottom = height - 1, left = 0, right = width - 1;
            while (top <= bottom && left <= right) {
                for (let y = top; y <= bottom; y++) coords.push([left, y]);
                left++;
                for (let x = left; x <= right; x++) coords.push([x, bottom]);
                bottom--;
                if (left <= right) { for (let y = bottom; y >= top; y--) coords.push([right, y]); right--; }
                if (top <= bottom) { for (let x = right; x >= left; x--) coords.push([x, top]); top++; }
            }
            break;
        }
        case 'zigzag-horizontal':
            for (let y = 0; y < height; y++) {
                if (y % 2 === 0) for (let x = 0; x < width; x++) coords.push([x, y]);
                else for (let x = width - 1; x >= 0; x--) coords.push([x, y]);
            }
            break;
        case 'zigzag-vertical':
            for (let x = 0; x < width; x++) {
                if (x % 2 === 0) for (let y = 0; y < height; y++) coords.push([x, y]);
                else for (let y = height - 1; y >= 0; y--) coords.push([x, y]);
            }
            break;
        case 'diagonal-tl-br':
            for (let d = 0; d < width + height - 1; d++)
                for (let x = 0; x <= d; x++) { const y = d - x; if (x < width && y < height) coords.push([x, y]); }
            break;
        case 'diagonal-tr-bl':
            for (let d = 0; d < width + height - 1; d++)
                for (let x = width - 1; x >= 0; x--) { const y = d - (width - 1 - x); if (y >= 0 && y < height) coords.push([x, y]); }
            break;
    }

    return coords;
}
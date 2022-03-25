import { writable } from 'svelte/store';

export const cueData = writable([]);
export const tags = writable([]);
export const currentTime = writable(0);
export const duration = writable(0);
export const paused = writable(true);

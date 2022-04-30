import { writable } from 'svelte/store';

export const cueData = writable([]);
export const tags = writable([]);
export const currentTime = writable(0);
export const duration = writable(0);
export const paused = writable(true);
// TODO: add more colors. OR make colors editable.
export const colors = writable(["rgb(255,255,255)", "rgb(255, 255, 131)", "rgb(166, 255, 233)","rgb(255, 199, 186)","rgb(217, 195, 255)",
"rgb(184, 238, 255)", "rgb(255, 208, 239)"]);
export const range = writable([]);
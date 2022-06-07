import { writable } from 'svelte/store';


export type Tags = {
    [label : string]: {
        label: string,
        color: string,
        idxs: Set<Number>
    }
}
export const cueData = writable([]);
export const tags = writable(<Tags>{});
export const currentTime = writable(0);
export const duration = writable(0);
export const paused = writable(true);
export const videoFile = writable('');
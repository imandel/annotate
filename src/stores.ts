import { writable } from 'svelte/store';

export type Annotation = {
    start: number,
    end: number,
    line?: string
}

// TODO: this wants to be a class? (unique ids)
export type Tags = {
    [label: string]: {
        label: string,
        color: string,
        annotations: Map<string, Annotation>
    }
}
export const cueData = writable([]);
export const tags = writable(<Tags>{ note: { label: "note", color: "#ebebff", annotations: new Map() } });
export const currentTime = writable(0);
export const duration = writable(0);
export const paused = writable(true);
export const videoFile = writable('');
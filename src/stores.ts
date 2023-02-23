import { writable, derived } from 'svelte/store';
import { TimingObject } from 'timing-object';
import { setTimingsrc } from 'timingsrc';

export type Annotation = {
    start: number,
    end: number,
    line?: string,
    note?: string,
    createTime?: number,
}

// TODO: this wants to be a class? (unique ids)
// label: (id, color, annotations)
export type Tags = {
    [label: string]: {
        label: string,
        color: string,
        annotations: Map<string, Annotation>
    }
}

export type VideoFiles = {
    [name: string]: {
        src: string,
        offset: number,
        visible: boolean,
        element?: HTMLMediaElement

    }
}

function createTimingObject() {
    const timingObject = new TimingObject();
    // let {position, velocity} = timingObject.query()
    const { subscribe, set, update } = writable(timingObject);


    return {
        subscribe,
        setTimingsrc: (mediaElement, offset) => setTimingsrc(mediaElement, timingObject, ({ position, ...vector }) => ({ ...vector, position: position - offset })),
        play: () => update(timer => { timer.update({ velocity: 1 }); return timer }),
        pause: () => update(timer => { timer.update({ velocity: 0 }); return timer }),
        set: (time: number) => timingObject.update({ position: time })
    };
}

export const timer = createTimingObject();
export const cueData = writable([]);
export const tags = writable(<Tags>{ note: { label: "note", color: "#ebebff", annotations: new Map() } });
export const currentTime = writable(0);
export const duration = writable(0);
export const paused = writable(true);
export const videoFiles = writable(<VideoFiles>{});
// TODO this is actually a really bad heuristic for the "main" file
export const videoFile = derived(videoFiles, $videoFiles => Object.keys($videoFiles).filter(x => $videoFiles[x].offset == 0)[0]);
export const zoom = writable(1);
export const audio = writable('');
export const label_colors = writable({});
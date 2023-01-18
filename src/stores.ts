import { writable } from 'svelte/store';
import { TimingObject } from 'timing-object';
import { setTimingsrc } from 'timingsrc';

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

function createTimingObject() {
    const timingObject = new TimingObject();
    // let {position, velocity} = timingObject.query()
	const { subscribe, set, update } = writable(timingObject);
   

	return {
		subscribe,
        setTimingsrc: (mediaElement, offset)=> setTimingsrc(mediaElement, timingObject,  ({ position, ...vector }) => ({ ...vector, position: position - offset })),
		play: ()=> update(timer => {timer.update({velocity: 1}); return timer}),
        pause: ()=> update(timer => {timer.update({velocity: 0}); return timer}),
        set: (time: number) => timingObject.update({position: time})
	};
}

export const timer = createTimingObject();
export const cueData = writable([]);
export const tags = writable(<Tags>{ note: { label: "note", color: "#ebebff", annotations: new Map() } });
export const currentTime = writable(0);
export const duration = writable(0);
export const paused = writable(true);
export const videoFile = writable('');
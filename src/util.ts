import { get } from 'svelte/store'
import type { EditorRange } from 'typewriter-editor';
import { Annotation, cueData, currentTime, videoFile, paused, tags } from './stores';
// @ts-ignore https://github.com/sveltejs/svelte-preprocess/issues/91
import { play, pause, playUntil } from "./Video.svelte";
import { parseRangeString } from './customFormatting';
import { fetchFile, FFmpeg } from "@ffmpeg/ffmpeg";
import path from "path";

export function getId(prefix: string): string {
    if (prefix === undefined) {
      prefix = '_';
    }
    return prefix + Math.random().toString(32).substring(2);
  }

  export interface keyConfig {
    [index: string]: Function;
  }
  
  export function processKey(e: KeyboardEvent, config: keyConfig): void {
    let shortcut = '';
    if (e.ctrlKey) {
      shortcut += 'ctrl+';
    }
    if (e.altKey) {
      shortcut += 'alt+';
    }
    if (e.shiftKey) {
      shortcut += 'shift+';
    }
    shortcut += e.code;
    console.log(shortcut);
    if (config[shortcut]?.(e)) {
      return;
    } else {
      config['quicktag'](e);
    }
  }


export async function saveFile(data: Blob, fileName: string) {
    // create a new handle
    const newHandle = await window.showSaveFilePicker({ suggestedName: fileName });

    // create a FileSystemWritableFileStream to write to
    const writableStream = await newHandle.createWritable();

    // write our file
    await writableStream.write(data);

    // close the file and write the contents to disk.
    await writableStream.close();
}

export const randomColor = () => '#' + Math.floor(Math.random() * 16777215).toString(16);


export const getSelectionElements = (selection: Selection) => {
    const { anchorNode, focusNode } = selection;
    const anchorP = getPTag(anchorNode)
    const focusP = getPTag(focusNode)
    const orderBitmask = anchorNode.compareDocumentPosition(focusNode)
    if (orderBitmask == 4) {
        return getNodeRange(anchorP, focusP);
    } else if (orderBitmask == 2) {
        return getNodeRange(focusP, anchorP);
    } else if (orderBitmask == 0) {
        return [anchorP]
    }

}

const getPTag = (node: Node) => {
    if (node.nodeType == Node.ELEMENT_NODE) {
        return (node as Element).closest('p')
    } else {
        return node.parentElement.closest('p')
    }
}
export const getNodeRange = (start: Node, end: Node) => {
    if (start && end) {
        let nodes = [start];
        let cur = start.nextSibling;
        while (cur !== end.nextSibling) {
            nodes.push(cur)
            cur = cur.nextSibling;
        }
        return nodes
    }
}

export const getElementRange = (start: HTMLDivElement, end: HTMLDivElement) => {

    if (start?.dataset?.starttime && end?.dataset?.starttime) {
        if (parseFloat(start.dataset.starttime) > parseFloat(end.dataset.starttime)) {
            [start, end] = [end, start]
        }
        let nodes = [start];
        let cur = start.nextElementSibling;
        while (cur !== end.nextElementSibling) {
            nodes.push(<HTMLDivElement>cur)
            cur = cur.nextElementSibling;
        }
        return nodes.filter(node => node.classList.contains('content'))
    }
}

export const getTranscriptIdx = (timestamp: number) => {
    const cues = [...get(cueData)].map((cue) => { return { startTime: cue.startTime, endTime: cue.endTime, idx: cue.id - 1 } })
    // console.log(timestamp)
    for (const cue of cues) {
        // console.log(timestamp, cue.startTime, cue.endTime)
        if (timestamp >= cue.startTime && timestamp <= cue.endTime) {
            return cue.idx
        }
    }
    return undefined;
}
export const getTranscriptIdxs = (start: number, end: number) => {
    const cues = [...get(cueData)].map((cue) => { return { startTime: cue.startTime, endTime: cue.endTime, idx: cue.id - 1 } })
    let startIdx: number;
    let endIdx: number;
    return cues.filter(cue => cue.endTime > start && cue.startTime < end).map(cue => cue.idx)

}

export const range = (start: number, stop: number, step = 1) =>
    Array.from({ length: (stop - start) / step + 1 }, (_, i) => start + (i * step))

export const createId = (existing: Map<string, Annotation>) => {
    let id: string;
    while (existing[(id = Math.random().toString(36).slice(2))]);
    return id;
}

export const expandTsSelection = (text: string, ts: string, selection: EditorRange) => {
    const rangeStart = Math.min(...selection);
    const rangeEnd = Math.max(...selection);

    if (text.length) {
        const offset = ts.indexOf(text);
        const remainder = ts.substring(offset + text.length).length;
        const newRange = <EditorRange>[rangeStart - offset, rangeEnd + remainder]
        return newRange
    }
}

// TODO proper async function for this
export const playTs = (ts: string) => {
    if (get(paused)) {
        const { start, end } = parseRangeString(ts);
        if (start !== end) {
            currentTime.set(start);
            playUntil(end).then(() => (paused.set(true)));
        } else {
            currentTime.set(start);
            play();
        }
    } else {
        pause();
    }
};

// TODO error handling
export const clip = async (timeString: string, ffmpeg: FFmpeg) => {
    const { start, end } = parseRangeString(timeString);
    const data = await fetchFile(get(videoFile));
    console.log(data);
    ffmpeg.FS("writeFile", "srcfile.mp4", data);
    await ffmpeg.run(
        "-ss",
        start.toString(),
        "-i",
        "srcfile.mp4",

        "-to",
        end.toString(),
        "-c",
        "copy",
        "clip.mp4"
    );
    const outData = ffmpeg.FS("readFile", "clip.mp4");
    await saveFile(
        new Blob([outData.buffer]),
        `${path.parse(get(videoFile)).name}_${start}_${end}`.replace(".", "m") +
        ".mp4"
    );
    return true;
};

export const swapLabel = (id: string, currentLabel: string, newLabel: string) => {
    let tempTags = get(tags)
    tempTags[newLabel].annotations.set(id, tempTags[currentLabel].annotations.get(id))
    tempTags[currentLabel].annotations.delete(id)
    tags.set(tempTags)
}

export const noTs = { ts: null, label: null, id: null, color: null };
export const startIdx = {
    '@': _ => 0,
    '(': _ => 1,
    ')': ts => ts.length

}
import { get } from 'svelte/store'
import { cueData } from './stores';
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
    for (const cue of cues) {
        if (timestamp >= cue.startTime && timestamp <= cue.endTime) {
            return cue.idx
        }
    }
    return false;
}

export const range = (start: number, stop: number, step = 1) =>
    Array.from({ length: (stop - start) / step + 1 }, (_, i) => start + (i * step))
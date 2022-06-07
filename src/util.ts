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

// TODO sort so you can select either direction
export const getElementRange = (start: HTMLElement, end: HTMLElement) => {
    if (start && end) {
        let nodes = [start];
        let cur = start.nextElementSibling;
        while (cur !== end.nextElementSibling) {
            nodes.push(<HTMLElement>cur)
            cur = cur.nextElementSibling;
        }
        return nodes
    }
}
export async function saveFile(data, fileName) {
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
export const getSelectionElements = (selection) => {
    const { anchorNode, focusNode } = selection;
    const anchorP = getPTag(anchorNode);
    const focusP = getPTag(focusNode);
    const orderBitmask = anchorNode.compareDocumentPosition(focusNode);
    if (orderBitmask == 4) {
        return getNodeRange(anchorP, focusP);
    }
    else if (orderBitmask == 2) {
        return getNodeRange(focusP, anchorP);
    }
    else if (orderBitmask == 0) {
        return [anchorP];
    }
};
const getPTag = (node) => {
    if (node.nodeType == Node.ELEMENT_NODE) {
        return node.closest('p');
    }
    else {
        return node.parentElement.closest('p');
    }
};
const getNodeRange = (start, end) => {
    if (start && end) {
        let nodes = [start];
        let cur = start.nextSibling;
        while (cur !== end.nextSibling) {
            nodes.push(cur);
            cur = cur.nextSibling;
        }
        return nodes;
    }
};
//# sourceMappingURL=util.js.map
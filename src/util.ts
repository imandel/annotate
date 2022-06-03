export async function saveFile(data: Blob, fileName:string) {
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
<script context="module" lang="ts">
    let editor: Editor;
    export const appendLabel = (
        timerange: [number, number],
        label: string,
        color: string
    ) => {
        if (editor) {
            const change = editor.change;
            change.insert(editor.doc.length, "\n");
            change.insert(
                editor.doc.length,
                `@(${timerange[0]}-${timerange[1]})`,
                { ts: `@(${timerange[0]}-${timerange[1]})` }
            );
            change.insert(editor.doc.length, { label, color });
            change.apply();
        }
    };
</script>

<script lang="ts">
    import {
        Editor,
        placeholder,
        smartEntry,
        editorStores,
    } from "typewriter-editor";
    import { onMount, onDestroy } from "svelte";
    import Root from "typewriter-editor/lib/Root.svelte";
    import Toolbar from "typewriter-editor/lib/Toolbar.svelte";
    import BubbleMenu from "typewriter-editor/lib/BubbleMenu.svelte";
    import { ts, tsReplace, label, parseRangeString } from "./customFormatting";
    import { play, pause, playUntil } from "./Video.svelte";
    import { currentTime, tags, videoFile } from "./stores";
    import { saveFile } from "./util.js";
    import TagSelect from "./TagSelect.svelte";
    import path from "path";
    import {
        defaultHandlers,
        markReplace,
    } from "typewriter-editor/lib/modules/smartEntry";
    import { Jumper } from "svelte-loading-spinners";
    import { createFFmpeg, fetchFile } from "@ffmpeg/ffmpeg";

    let playingNote = false;
    let downloadingVid = false;

    const ffmpeg = createFFmpeg({ log: false });
    onMount(async () => {
        await ffmpeg.load();
    });
    onDestroy(async () => {
        ffmpeg.exit();
    });

    const clip = async (timeString: string) => {
        downloadingVid = true;
        const { start, end } = parseRangeString(timeString);
        const data = await fetchFile($videoFile);
        console.log(data);
        ffmpeg.FS("writeFile", "srcfile.mp4", data);
        await ffmpeg.run(
            "-i",
            "srcfile.mp4",
            "-ss",
            start.toString(),
            "-to",
            end.toString(),
            "-c",
            "copy",
            "clip.mp4"
        );
        const outData = ffmpeg.FS("readFile", "clip.mp4");
        downloadingVid = false;
        await saveFile(
            new Blob([outData.buffer]),
            `${path.parse($videoFile).name}_${start}_${end}`.replace(".", "m") +
                ".mp4"
        );
        return;
    };

    window.process = { env: { NODE_ENV: import.meta.env.MODE } };
    if (import.meta.env.MODE == "development") {
        $tags = {
            "cat": { label: "cat", color: "teal", idxs: new Set() },
            "bat":{ label: "bat", color: "lavender", idxs: new Set() },

        };
    }
    const playTs = (ts: string) => {
        if (playingNote) {
            pause();
            playingNote = false;
        } else {
            playingNote = true;
            const { start, end } = parseRangeString(ts);
            if (end) {
                $currentTime = start;
                playUntil(end).then(() => (playingNote = false));
            } else {
                $currentTime = start;
                play();
            }
        }
    };

    editor = window.editor = new Editor({
        modules: {
            placeholder: placeholder(
                "When the video loads try writing @now, @(1:23), or @(10.5-20.23)"
            ),
            smartEntry: smartEntry([
                ...defaultHandlers,
                markReplace,
                tsReplace,
            ]),
        },
    });

    editor.typeset.formats.add(ts);
    editor.typeset.embeds.add(label);

    const { active, doc, selection, focus, root, updateEditor } =
        editorStores(editor);
    // $: console.log($active, $doc, $selection, $focus, $root )
    const beforeUnload = (event: BeforeUnloadEvent) => {
        if (import.meta.env.MODE == "production") {
            if ($active.undo) {
                event.preventDefault();
                event.returnValue = "";
                return "";
            }
        }
    };
    const downloadNotes = () => {
        saveFile(new Blob([editor.getHTML()]), "Notes.html");
    };
</script>

<svelte:window on:beforeunload={beforeUnload} />

<h3>Notes</h3>
<div class="toolbar">
    <Toolbar {editor} let:active let:commands>
        <button
            class="toolbar-button material-icons"
            class:active={active.header === 2}
            on:click={commands.header2}>title</button
        >

        <button
            class="toolbar-button material-icons header3"
            class:active={active.header === 3}
            on:click={commands.header3}>title</button
        >

        <button
            class="toolbar-button material-icons"
            class:active={active.bold}
            on:click={commands.bold}>format_bold</button
        >

        <button
            class="toolbar-button material-icons"
            class:active={active.italic}
            on:click={commands.italic}>format_italic</button
        >

        <button
            class="toolbar-button material-icons"
            class:active={active.italic}
            on:click={commands.bulletList}>format_list_bulleted</button
        >

        <button
            class="toolbar-button material-icons"
            class:active={active.italic}
            on:click={commands.orderedList}>format_list_numbered</button
        >

        <button
            class="toolbar-button material-icons"
            disabled={!active.undo}
            on:click={commands.undo}>undo</button
        >

        <button
            class="toolbar-button material-icons"
            disabled={!active.redo}
            on:click={commands.redo}>redo</button
        >
        <button
            class="toolbar-button material-icons right"
            disabled={!active.undo}
            on:click={downloadNotes}>file_download</button
        >
    </Toolbar>
</div>

<BubbleMenu {editor} let:active let:commands let:placement let:selection>
    {#if active.link || active.ts}
        <div class="menu">
            <div data-arrow class="arrow {placement}" />
            {#if active.link}
                <button
                    class="menu-button material-icons"
                    on:click={() => window.open(active.link)}
                    >open_in_new</button
                >
            {/if}

            {#if active.ts}
                <button
                    class="menu-button material-icons"
                    on:click={() => playTs(active.ts)}
                >
                    {#if playingNote}
                        pause
                    {:else}
                        play_arrow
                    {/if}
                </button>
                {#if active.ts.includes("-")}
                    {#if downloadingVid}
                        <Jumper
                            size="34"
                            color="#e6e4fe"
                            unit="px"
                            duration="1s"
                        />
                    {:else}
                        <button
                            class="menu-button material-icons"
                            on:click={() => clip(active.ts)}
                            >file_download</button
                        >
                    {/if}
                {/if}
            {/if}
        </div>
    {:else}
        <div class="tag-select">
            <TagSelect
                callback={(_label, _color) => {
                    editor.insert(
                        { label: _label, color: _color },
                        [],
                        [editor.doc.selection[0], editor.doc.selection[0]]
                    );
                }}
            />
        </div>
    {/if}
</BubbleMenu>

<Root {editor} class="text-content" />

<style>
    .toolbar {
        display: flex;
        background: #eee;
        position: sticky;
        top: 0;
        padding: 8px;
        margin-bottom: 8px;
        border-radius: 3px;
        box-shadow: 0 1px 2px rgba(0, 0, 0, 0.3), 0 2px 6px rgba(0, 0, 0, 0.1);
    }
    :global(.toolbar-button) {
        display: flex;
        align-items: center;
        justify-content: center;
        background: #fff;
        margin: 0;
        width: 40px;
        height: 40px;
        margin-right: 4px;
        border-radius: 4px;
        border: 1px solid #ced4da;
        transition: border-color 0.15s ease-in-out, box-shadow 0.15s ease-in-out;
        cursor: pointer;
    }
    .toolbar-button:hover {
        outline: none;
        border-color: #80bdff;
        box-shadow: 0 0 0 0.2rem rgba(0, 123, 255, 0.25);
    }
    .toolbar-button.active {
        border-color: #80bdff;
        background: #eaf4ff;
    }
    .header3 {
        font-size: 18px;
    }

    :global(.placeholder) {
        position: relative;
    }
    :global(.placeholder::before) {
        content: attr(data-placeholder);
        position: absolute;
        left: 0;
        right: 0;
        opacity: 0.5;
    }

    :global(.text-content) {
        outline: none;
        padding: 8px 16px;
        border-radius: 3px;
        min-height: 100px;
        max-height: 30vh;
        overflow-y: auto;
        border: 1px solid #ced4da;
        transition: border-color 0.15s ease-in-out, box-shadow 0.15s ease-in-out;
    }

    .menu {
        display: flex;
        align-items: baseline;
        height: 42px;
        background-image: linear-gradient(
            to bottom,
            rgba(49, 49, 47, 0.99),
            #262625
        );
        border-radius: 5px;
        z-index: 100;
        white-space: nowrap;
        animation: pop-upwards 180ms forwards linear;
    }
    .menu-button {
        height: 42px;
        width: 42px;
        text-align: center;
        border: none;
        margin: 0;
        color: #fff;
        background: none;
        outline: none;
        cursor: pointer;
    }
    .menu-button:first-child {
        padding-left: 14px;
    }
    .menu-button:last-child {
        padding-right: 14px;
    }
    :global(.menu-button.active .material-icons) {
        color: #74b6ff;
    }
    .material-icons {
        font-size: 24px;
    }
    :global(.header3 .material-icons) {
        font-size: 18px;
    }
    :global(.bubble-menu.active) {
        transition: all 75ms ease-out;
        z-index: 2;
    }
    .arrow {
        display: block;
        border: 6px solid transparent;
    }
    .arrow.top {
        bottom: -12px;
        border-top-color: #262625;
    }
    .arrow.bottom {
        top: -12px;
        border-bottom-color: rgba(49, 49, 47, 0.99);
    }
    @keyframes pop-upwards {
        0% {
            transform: matrix(0.97, 0, 0, 1, 0, 12);
            opacity: 0;
        }
        20% {
            transform: matrix(0.99, 0, 0, 1, 0, 2);
            opacity: 0.7;
        }
        40% {
            transform: matrix(1, 0, 0, 1, 0, -1);
            opacity: 1;
        }
        70% {
            transform: matrix(1, 0, 0, 1, 0, 0);
            opacity: 1;
        }
        100% {
            transform: matrix(1, 0, 0, 1, 0, 0);
            opacity: 1;
        }
    }
    .right {
        margin-left: auto;
        margin-right: 0;
    }
    .tag-select {
        background-color: rgb(216, 216, 216);
        color: white;
        padding: 5px 10px;
        border-radius: 25px;
        font-size: 13px;
        display: flex;
        align-items: center;
    }
</style>

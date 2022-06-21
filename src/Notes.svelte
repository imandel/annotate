<script context="module" lang="ts">
    let editor: Editor;
    export const setData = (data: Delta) => {
        editor.set(new Delta(data));
    };
    export const appendLabel = (
        start: number,
        end: number,
        label: string,
        color: string,
        id: string
    ) => {
        if (editor) {
            const change = editor.change;
            change.insert(editor.doc.length, "\n");
            change.insert(editor.doc.length + 1, `@(${start}-${end})`, {
                ts: `@(${start}-${end})`,
                label,
                color,
                id,
            });
            change.apply();
            // TODO: typewriter change event? this is hacky
            const keys = [...editor.doc.byId.keys()];
            return keys[keys.length - 2];
        }
    };
</script>

<script lang="ts">
    import {
        Editor,
        placeholder,
        smartEntry,
        editorStores,
        EditorChangeEvent,
        deltaToText,
        EditorRange,
    } from "typewriter-editor";
    import { Delta } from "@typewriter/delta";
    import { onMount, onDestroy } from "svelte";
    import Root from "typewriter-editor/lib/Root.svelte";
    import Toolbar from "typewriter-editor/lib/Toolbar.svelte";
    import BubbleMenu from "typewriter-editor/lib/BubbleMenu.svelte";
    import { ts, tsReplace, parseRangeString } from "./customFormatting";
    import { tags, paused } from "./stores";
    import {
        saveFile,
        expandTsSelection,
        playTs,
        clip,
        swapLabel,
        noTs,
        startIdx,
    } from "./util.js";
    import {
        defaultHandlers,
        markReplace,
    } from "typewriter-editor/lib/modules/smartEntry";
    import { Jumper } from "svelte-loading-spinners";
    import { createFFmpeg } from "@ffmpeg/ffmpeg";
    // TODO: idea capature shift up or down to add/reduce time on tag?
    let downloadingVid = false;
    // TODO fix regex to treat @(10-) as @(10)
    const regEx =
        /@\(\d+((:\d+){1,2})?(\.\d+)?(-?\d+((:\d+){1,2})?(\.\d+)?)\)/g;
    // TODO move ffmpeg code to util?
    const ffmpeg = createFFmpeg({ log: false });
    onMount(async () => {
        await ffmpeg.load();
    });
    // onDestroy(async () => {
    //     ffmpeg.exit();
    // });

    // TODO move fn to util and await promise on interface
    // $: console.log($tags)
    window.process = { env: { NODE_ENV: import.meta.env.MODE } };
    if (import.meta.env.MODE == "development") {
        $tags = {
            cat: { label: "cat", color: "teal", annotations: new Map() },
            bat: { label: "bat", color: "#9d9dff", annotations: new Map() },
            ...$tags,
        };
    }
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
    // TODO move to the onchanging event?
    const onTextChanged = ({ change, changedLines }: EditorChangeEvent) => {
        if (changedLines.length && change.activeFormats.ts) {
            changedLines.forEach(({ content, id: line }) => {
                const text = deltaToText(content);
                const lineStart = editor.doc.getLineRanges(
                    change.selection[0]
                )[0][0];
                const matches = text.matchAll(regEx);
                for (const m of matches) {
                    const match = m[0];
                    const startIdx = m.index + lineStart;
                    const endIdx = m.index + lineStart + match.length;
                    if (
                        change.selection[0] <= endIdx &&
                        change.selection[0] >= startIdx
                    ) {
                        const allFormats = editor.doc.getFormats(
                            [startIdx, endIdx],
                            { allFormats: true }
                        );

                        allFormats.ts = match;
                        const { start, end } = parseRangeString(match);
                        const { id, label } = allFormats;
                        editor.formatText(allFormats, <EditorRange>[
                            startIdx,
                            endIdx,
                        ]);
                        $tags[label].annotations.set(id, {
                            start,
                            end,
                            line,
                        });
                        $tags = $tags;
                    }
                }
            });
        }
    };

    editor.on("changed", onTextChanged);
    editor.on("changing", (event: EditorChangeEvent) => {
        const { change } = event;
        const ops = change.delta.ops;
        const convert = new Delta();
        let pos = 0;
        ops.forEach((op) => {
            if (op.retain) pos += op.retain;
            else if (typeof op.insert === "string") pos += op.insert.length;
            else if (op.delete) {
                // TODO drag, highlight delete not handeled. will stay in $tags
                // TODO undo will not re-add tag
                const { ts, id, label } = change.doc.getTextFormat([
                    pos,
                    pos + op.delete,
                ]);
                const deleted = change.doc.getText([pos, pos + op.delete]);
                if (ts && /@|\(|\)/.test(deleted)) {
                    let start = startIdx[deleted](ts);
                    convert
                        .retain(pos - start)
                        .retain(pos - start + ts.length, noTs);

                    $tags[label].annotations.delete(id);
                    $tags = $tags;
                    event.modify(convert);
                }
            }
        });
    });

    $: if ($active?.ts)
        editor.select(
            expandTsSelection(
                editor.getText($selection),
                $active.ts,
                $selection
            )
        );

    const { active, doc, selection, focus, root, updateEditor } =
        editorStores(editor);
    // $: console.log($doc);
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
    // TODO download as structured
    const downloadNotes = () => {
        saveFile(new Blob([JSON.stringify(editor.getDelta())]), "Notes.json");
    };
    const downloadCsv = () => {};
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
        <div class="dropdown">
            <button
                class="toolbar-button material-icons "
                disabled={!active.undo}>file_download</button
            >
            <div class="dropdown-content">
                <button
                    class="drop-btn"
                    on:click={downloadNotes}
                    disabled={!active.undo}>Notes</button
                >
                <button
                    class="drop-btn"
                    on:click={downloadCsv}
                    disabled={!active.undo}>CSV</button
                >
            </div>
        </div>
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
                    {#if $paused}
                        play_arrow
                    {:else}
                        pause
                    {/if}
                </button>
                {#each Object.values($tags) as tag}
                    <button
                        class="menu-button material-icons label"
                        style="--tag-color: {tag.color}"
                        on:click={() => {
                            console.log(active);
                            editor.formatText({
                                color: tag.color,
                                label: tag.label,
                            });
                            swapLabel(active.id, active.label, tag.label);
                        }}>circle</button
                    >
                {/each}
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
                            on:click={() => {
                                downloadingVid = true;
                                clip(active.ts, ffmpeg).then(
                                    () => (downloadingVid = false)
                                );
                            }}>file_download</button
                        >
                    {/if}
                {/if}
            {/if}
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
    .menu-button.label {
        color: var(--tag-color);
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
    .dropdown {
        position: relative;
        display: inline-block;
    }
    .dropdown-content {
        display: none;
        position: absolute;
        z-index: 10000;

        /* background-color: #f1f1f1;
        min-width: 160px;
        box-shadow: 0px 8px 16px 0px rgba(0, 0, 0, 0.2);
        z-index: 1; */
    }
    /* Show the dropdown menu on hover */
    .dropdown:hover .dropdown-content {
        display: block;
    }
    .drop-btn {
        width: 100%;
        margin: 0px;
    }
    .drop-btn:hover {
        outline: none;
        border-color: #80bdff;
        box-shadow: 0 0 0 0.2rem rgba(0, 123, 255, 0.25);
    }
</style>

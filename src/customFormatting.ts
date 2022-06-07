import type { Editor } from 'typewriter-editor';
import { get } from 'svelte/store';
import { format, h, embed } from 'typewriter-editor';
import { currentTime } from "./stores";
import type { Replacement } from "typewriter-editor/lib/modules/smartEntry"
import type { AttributeMap } from '@typewriter/document';

// Typewritter css stored in public/global.css
export const ts = format({
  name: 'ts',
  selector: 'span.timestamp',
  greedy: false,
  render: (_, children) => h('span', { class: 'timestamp' }, children),
});

export const parseRangeString = (timeString: string) => {
  const parser = timeString.includes(':') ? parseTimes : parseFloat
  if (timeString.includes('-')) {
    const [start, end] = timeString.substring(2, timeString.length - 1).split('-')
    return { start: parser(start), end: parser(end) }
  } else {
    return { start: parser(timeString.substring(2, timeString.length - 1)), end: undefined }
  }
}


// TODO popperjs instead of css tooltip?
export const label = embed({
  name: 'label',
  selector: 'span.text-circle',
  commands: editor => (label: string, color: string) => editor.insert({ label, color }),
  render: (tag: AttributeMap) => {
    const { label, color } = tag;
    return h('span', { class: 'text-circle tooltip', "data-text": label, style: `background-color: ${color}` },)
    // ]);
  },
});


// TODO match format start,duration
const tsReplacements: Replacement[] = [
  [/(@\()[\d.-]*\).$/s, capture => ({ ts: capture })],
  [/@now.$/s, _ => ({ ts: `@(${get(currentTime).toFixed(1)})` })],
  [/(@\()[\d.:-]*\).$/s, (capture) => {
    const { start, end } = parseRangeString(capture)
    return capture.includes('-') ? { ts: `@(${start}-${end})` } : { ts: `@(${parseTimes(capture.slice(2, -1))})` };
  }]

];


const parseTimes = (timeString: any) => {
  return +(timeString.split(':').reduce((acc: number, time: number) => (60 * acc) + +time))
}

export const tsReplace = (editor: Editor, index: number, prefix: string) => {
  return tsReplacements.some(([regexp, getAttributes]) => {
    const match = prefix.match(regexp);
    if (match) {
      let text = match[0].slice(0, -1);
      const end = index - (match[0].length - text.length);
      const attributes = getAttributes(text);
      if (!editor.typeset.formats.findByAttributes(attributes)) {
        return false;
      }
      if (attributes.ts !== text) { editor.insert(attributes.ts, attributes, [end - text.length, end]) }
      else {
        editor.formatText(attributes, [end - text.length, end]);
      }

      return true;
    } else {
      return false;
    }
  });
}

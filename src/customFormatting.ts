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
  commands: editor => (label:string, color:string) => editor.toggleTextFormat({color, label}),
  render: (timeSpan: AttributeMap, children) => {
    const {ts, color, label, id}= timeSpan
    return h('span', { class: `timestamp ${label? 'label':''}`, style: label? `--tag-color: ${color}`: '' }, children)},
});

// TODO popperjs instead of css tooltip?
// TODO getting weird spacing bug make minimal example
// TODO fromdom for copy and paste?
// export const label = embed({
//   name: 'label',
//   selector: 'span.text-circle',
//   fromDom: (node: HTMLSpanElement) => ({label: node.dataset.text, color: node.style.backgroundColor, attributes:{label:true}}),
//   // noFill: true,
//   commands: editor => (label: string, props: object) => editor.insert({ label, ...props }, {label:true} ),
//   render: (tag: AttributeMap) => {

//     const { label, color } = tag;
//     return h('span', { class: 'text-circle tooltip', "data-text": label, style: `background-color: ${color}` })
//   }
// });


export const parseRangeString = (timeString: string) => {
  const parser = timeString.includes(':') ? parseTimes : parseFloat
  if (timeString.includes('-')) {
    const [start, end] = timeString.substring(2, timeString.length - 1).split('-')
    return { start: parser(start), end: parser(end) }
  } else {
    return { start: parser(timeString.substring(2, timeString.length - 1)), end: undefined }
  }
}

// TODO match format start,duration
const tsReplacements: Replacement[] = [
  [/@\(\d+(\.\d+)?\).$/s, capture => ({ ts: capture  })],
  [/@now.$/s, _ => ({ ts: `@(${get(currentTime).toFixed(1)})` })],
  [/@\(\d+((:\d+){1,2})?(\.\d+)?(-\d+((:\d+){1,2})?(\.\d+)?)\).$/s, (capture) => {
    const { start, end } = parseRangeString(capture)
    return capture.includes('-') ? { ts: `@(${start}-${end})` } : { ts: `@(${parseTimes(capture.slice(2, -1))})` };
  }]

];

const parseTimes = (timeString: any) => {
  return +(timeString.split(':').reduce((acc: number, time: number) => (60 * acc) + +time))
}

export const tsReplace = (editor: Editor, index: number, prefix: string) => {
  return tsReplacements.some(([regexp, getAttributes]) => {
    const baseNote = {}
    const match = prefix.match(regexp);
    if (match) {
      let text = match[0].slice(0, -1);
      const end = index - (match[0].length - text.length);
      const attributes = getAttributes(text);
      if (!editor.typeset.formats.findByAttributes(attributes)) {
        return undefined;
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

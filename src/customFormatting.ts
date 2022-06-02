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
  render: (attributes, children) => h('span', { class: 'timestamp' }, children),
});


// TODO popperjs instead of css tooltip?
export const label = embed({
  name: 'label',
  selector: 'span.text-circle',
  commands: editor => (label: string, color: string) => editor.insert({ label, color }),
  render: (tag: AttributeMap) => {
    const { label, color } = tag;
    return h('span', {class:'text-circle tooltip', "data-text":label, style:`background-color: ${color}`}, )
    // ]);
  },
});


// TODO match format start,duration
const tsReplacements: Replacement[] = [
  [/(@\()[\d.-]*\).$/s, capture => ({ ts: capture })],
  [/@now.$/s, _ => ({ ts: `@(${get(currentTime).toFixed(1)})` })],
  [/(@\()[\d.:-]*\).$/s, (capture) => {
    if (capture.includes('-')) {
      const [start, end] = capture.split("-");
      return { ts: `@(${parseTimes(start.slice(2))}-${parseTimes(end.slice(0, -1))})` }
    } else return { ts: `@(${parseTimes(capture.slice(2, -1))})` }
  }]

];

const parseTimes = (timeString) => {
  return +(timeString.split(':').reduce((acc, time) => (60 * acc) + +time))
}

export const tsReplace = (editor: Editor, index: number, prefix: string) => {
  return tsReplacements.some(([regexp, getAttributes]) => {
    const match = prefix.match(regexp);
    if (match) {
      // console.log(match)
      let text = match[0].slice(0, -1);
      // console.log(text)
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

import { get } from 'svelte/store';
import { format, h} from 'typewriter-editor';
import { timer, tags } from "./stores";
import { createId } from './util';
import type { Replacement } from "typewriter-editor/lib/modules/smartEntry"
import type { AttributeMap } from '@typewriter/document';
import type { Editor } from 'typewriter-editor';

// TODO set default label from store?

// Typewritter css stored in public/global.css
export const ts = format({
  name: 'ts',
  selector: 'span.timestamp',
  greedy: false,
  // commands: editor => (label: string, color: string) => editor.toggleTextFormat({ color, label }),
  render: (timeSpan: AttributeMap, children) => {
    const { color } = timeSpan
    return h('span', { class: `timestamp label`, style: `--tag-color: ${color}` }, children)
  },
});

export const parseRangeString = (timeString: string) => {
  const parser = timeString.includes(':') ? parseTimes : parseFloat
  if (timeString.includes('-')) {
    const [start, end] = timeString.substring(2, timeString.length - 1).split('-')
    return { start: parser(start), end: parser(end) }
  } else {
    const start = parser(timeString.substring(2, timeString.length - 1))
    return { start, end: start }
  }
}

// TODO match format start,duration
//  TODO ordering start and end?
const tsReplacements: Replacement[] = [
  [/@\(\d+(\.\d+)?\).$/s, capture => ({ ts: capture })],
  [/@now.$/s, _ => ({ ts: `@(${get(timer).query().position.toFixed(1)})` })],
  [/@\(\d+((:\d+){1,2})?(\.\d+)?(-?\d+((:\d+){1,2})?(\.\d+)?)\).$/s, (capture) => {
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
      const endIdx = index - (match[0].length - text.length);
      let attributes = getAttributes(text);
      let tempTags = get(tags)

      if (!editor.typeset.formats.findByAttributes(attributes)) {
        return undefined;
      }
      if (attributes.ts !== text) {
        const label = 'note';
        const color = tempTags['note'].color
        const id = createId(tempTags['note'].annotations)
        const { start, end } = parseRangeString(attributes.ts)
        const line = editor.doc.getLineAt(endIdx).id
        attributes = { ...attributes, label, color, id }

        tempTags['note'].annotations.set(id, {
          start,
          end,
          line,
        });
        editor.insert(attributes.ts, attributes, [endIdx - text.length, endIdx])
      }
      else {
        const { label = 'note', id = createId(tempTags['note'].annotations), color = tempTags['note'].color } = editor.doc.getTextFormat([endIdx - text.length, endIdx])
        if (tempTags[label].annotations.has(id)) {
          // do nothing? this case should be handled in editor onchange event
          return true
        } else {
          const { start, end } = parseRangeString(attributes.ts)
          attributes = { ...attributes, label, id, color }
          const line = editor.doc.getLineAt(endIdx).id
          editor.formatText(attributes, [endIdx - text.length, endIdx]);
          tempTags[label].annotations.set(id, {
            start,
            end,
            line,
          });
        }
      }
      tags.set(tempTags);
      return true;
    } else {
      return false;
    }
  });
}

import type { Editor } from 'typewriter-editor';
import type { AttributeMap, Delta } from '@typewriter/document';
import { get } from 'svelte/store';
import { format, h } from 'typewriter-editor';
import { currentTime } from "./stores";

export const ts = format({
  name: 'ts',
  selector: 'span.timestamp',
  greedy: false,
  // If the link is a string, it is an actual address. Otherwise it is either undefined (empty) or being called from the
  // testing code (which passes a pointer to the dom object, hence the conversion to a boolean which works with the toggleTextFormat)
  // commands: editor => (link: string) => editor.toggleTextFormat({ link: typeof link === 'string' ? link : !!link }),
  // fromDom: (node: HTMLAnchorElement) => node.href,
  render: (attributes, children) => h('span', { class: 'timestamp' }, children),
});

type Replacement = [RegExp, (captured: string) => AttributeMap];
export type TextReplacement = [RegExp, (captured: string) => string];
const httpExpr = /(https?:\/\/.)[-a-zA-Z0-9@:%._\+~#=]{2,256}\.[a-z]{2,6}\b[-a-zA-Z0-9@:%_+.~#?&/=]*\s$/s;
const wwwExpr = /(www\.)[-a-zA-Z0-9@:%._\+~#=]{2,256}\.[a-z]{2,6}\b[-a-zA-Z0-9@:%_+.~#?&/=]*\s$/s;
const nakedExpr = /[-a-zA-Z0-9@:%._\+~#=]{2,256}\.(com|org|net|io)\b[-a-zA-Z0-9@:%_+.~#?&/=]*\s$/s;

export type Handler = (editor?: Editor, index?: number, prefix?: string, wholeText?: string) => void;

/**
 * A list of [ RegExp, Function ] tuples to convert text into a formatted line with the attributes returned by the
 * function. The function's argument will be the captured text from the regular expression.
 */
export const lineReplacements: Replacement[] = [
  [/^(#{1,6}) $/, capture => ({ header: capture.length })],
  [/^[-*] $/, () => ({ list: 'bullet' })],
  [/^1\. $/, () => ({ list: 'ordered' })],
  [/^([AaIi])\. $/, type => ({ list: 'ordered', type })],
  [/^(-?\d+)\. $/, start => ({ list: 'ordered', start })], // Use /^(-?\d+)\. $/ to support lists starting at something other than 1.
  [/^([A-Z])\. $/, char => ({ list: 'ordered', type: 'A', start: char.charCodeAt(0) - 'A'.charCodeAt(0) + 1 })],
  [/^([a-z])\. $/, char => ({ list: 'ordered', type: 'a', start: char.charCodeAt(0) - 'a'.charCodeAt(0) + 1 })],
  //   [ /^([IVXLCDM]+)\. $/i, chars => ({ list: 'ordered', type: chars[0].toUpperCase() === chars[0] ? 'I' : 'i', start: fromRomanNumeral(chars) }) ],
  [/^> $/, () => ({ blockquote: true })],
];

/**
 * A list of [ RegExp, Function ] tuples to convert text into formatted text with the attributes returned by the
 * function. The function's argument will be the captured text from the regular expression.
 */
export const markReplacements: Replacement[] = [
  [/(\*|_){3}(\b(?:(?!\1).)+\b)\1{3}((?:(?!\1).))$/s, () => ({ bold: true, italic: true })],
  [/(\*|_){2}(\b(?:(?!\1).)+\b)\1{2}((?:(?!\1).))$/s, () => ({ bold: true })],
  [/(\*|_){1}(\b(?:(?!\1).)+\b)\1{1}((?:(?!\1).))$/s, () => ({ italic: true })],
];

export const linkReplacements: Replacement[] = [
  [httpExpr, capture => ({ link: capture })],
  [wwwExpr, capture => ({ link: 'https://' + capture })],
  [nakedExpr, capture => ({ link: 'https://' + capture })],
];

/**
 * A list of [ RegExp, Function ] tuples to convert text into another string of text which is returned by the function.
 * The function's argument will be the captured text from the regular expression.
 */
export const textReplacements: TextReplacement[] = [
  [/--$/, () => '—'],
  [/\.\.\.$/, () => '…'],
];

// TODO match format start,duration
export const tsReplacements: Replacement[] = [
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

export default function tsReplace(editor: Editor, index: number, prefix: string) {
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


/**
 * Allow text representations to format a line
 */
export function lineReplace(editor: Editor, index: number, prefix: string) {
  return lineReplacements.some(([regexp, getAttributes]) => {
    const match = prefix.match(regexp);
    if (match) {
      const attributes = getAttributes(match[1]);
      if (!editor.typeset.lines.findByAttributes(attributes)) {
        return false;
      }
      const start = index - prefix.length;
      const change = editor.change
        .delete([start, index])
        .formatLine(index, attributes)
        .select([start, start]);
      editor.update(change);
      return true;
    } else {
      return false;
    }
  });
}

export function linkReplace(editor: Editor, index: number, prefix: string) {
  return linkReplacements.some(([regexp, getAttributes]) => {
    const match = prefix.match(regexp);
    if (match) {
      let text = match[0].slice(0, -1);
      if (text[text.length - 1] === '.') text = text.slice(0, -1);
      const end = index - (match[0].length - text.length);
      const attributes = getAttributes(text);
      if (!editor.typeset.formats.findByAttributes(attributes)) {
        return false;
      }
      editor.formatText(attributes, [end - text.length, end]);
      return true;
    } else {
      return false;
    }
  });
}

export function markReplace(editor: Editor, index: number, prefix: string, wholeText: string) {
  return markReplacements.some(([regexp, getAttributes]) => {
    const match = prefix.match(regexp);
    if (match) {
      let [text, _, matched, last] = match;
      // console.log(last)
      const attributes = getAttributes(matched);
      if (!editor.typeset.formats.findByAttributes(attributes)) {
        return false;
      }
      let selection = index - (text.length - matched.length) + last.length;
      if (last === ' ' && wholeText[index] === ' ') last = '';
      const end = index - last.length;
      editor.insert(matched, attributes, [end - text.length + last.length, end]);
      return true;
    } else {
      return false;
    }
  });
}

export function textReplace(editor: Editor, index: number, prefix: string) {
  return textReplacements.some(([regexp, replaceWith]) => {
    const match = prefix.match(regexp);
    if (match) {
      editor.insert(replaceWith(match[1]), undefined, [index - match[0].length, index]);
      return true;
    } else {
      return false;
    }
  });
}



export const defaultHandlers = [lineReplace, textReplace, linkReplace, tsReplace, markReplace];

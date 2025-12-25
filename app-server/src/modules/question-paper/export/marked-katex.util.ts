import { renderToString } from 'katex';
import { marked } from 'marked';

const extensions = [
  {
    name: 'inline-tex',
    level: 'inline',
    start(src) {
      return src.match(/\$[^$\n]/)?.index;
    },
    tokenizer(src) {
      const rule = /(\$[^$\n]+?\$)/g;
      const match = rule.exec(src);
      if (match) {
        const token = {
          type: 'inline-tex',
          raw: match.input,
          tokens: [],
        };
        const tex = match[1].slice(1, -1).trim();
        const modifiedSrc = match.input.replaceAll(
          match[1],
          renderToString(tex, {
            strict: false,
            displayMode: false,
          }),
        );
        this.lexer.inline(modifiedSrc, token.tokens);
        return token;
      }
      return false;
    },
    renderer(token) {
      return this.parser.parseInline(token.tokens);
    },
  },
  {
    name: 'block-tex',
    level: 'block',
    start(src) {
      return src.match(/\s*\$\$[^$]/)?.index;
    },
    tokenizer(src) {
      const rule = /^(\s*\$\$[^$]+?\$\$\s*)$/m;
      const match = rule.exec(src);
      console.log(match);
      if (match) {
        const token = {
          type: 'block-tex',
          raw: match.input,
          tokens: [],
        };
        const tex = match[1].trim().slice(2, -2).trim();
        console.log(match.input);
        const rendered = renderToString(tex, {
          strict: false,
          displayMode: true,
        });
        token.raw = match.input.replaceAll(match[1], rendered);

        this.lexer.blockTokens(token.raw, token.tokens);
        return token;
      }
      // return false
    },
    renderer(token) {
      console.log(token);
      // return token.raw
      return this.parser.parse(token.tokens);
    },
  },
];

marked.use({ extensions });

export default (text: string): string => marked.parse(text) as string;

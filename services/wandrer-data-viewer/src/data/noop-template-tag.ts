// noop template tag; vscode provides syntax highlighting for sql`...`
const noop = (strings: TemplateStringsArray, ...values: unknown[]) => (
  strings.slice(0, strings.length - 1)
    .reduce((acc, str, i) => acc + str + String(values[i]), '')
    + strings.at(-1)! // eslint-disable-line @typescript-eslint/no-non-null-assertion
);
export default noop;

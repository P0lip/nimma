export type Callback = (scope: EmittedScope) => void;

type JsonPath = (string | number)[];

export type EmittedScope = {
  readonly path: JsonPath;
  readonly value: unknown;
};

export type Options = {
  customShorthands?: Record<string, string> | null;
  module?: 'esm' | 'commonjs';
};

declare class Nimma {
  public readonly sourceCode: string;

  constructor(expressions: string[], opts?: Options);

  public query(input: unknown, callbacks: Record<string, Callback>): void;

  static query(
    input: unknown,
    callbacks: Record<string, Callback>,
    opts?: Options,
  ): (input: unknown) => void;
}

export default Nimma;

export type Callback = (scope: EmittedScope) => void;

type JsonPath = (string | number)[];

export type EmittedScope = {
  readonly path: JsonPath;
  readonly value: unknown;
};

declare class Nimma {
  public readonly sourceCode: string;

  constructor(
    expressions: string[],
    opts?: {
      customShorthands?: Record<string, string> | null;
      module?: 'esm' | 'commonjs';
    },
  );

  public query(input: unknown, callbacks: Record<string, Callback>): void;
}

export default Nimma;

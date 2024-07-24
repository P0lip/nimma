export type Callback = (scope: EmittedScope) => void;

type JsonPath = (string | number)[];

export type EmittedScope = {
  readonly path: JsonPath;
  readonly value: unknown;
};

export type Scope = {
  sandbox: {
    value: unknown;
  };
  path: (string | number)[];
  callbacks: Record<string, Callback>;
};

export type State = {
  value: number;
  initialValue: number;
};

export type CustomShorthand = (
  scope: Scope,
  state: State,
  initialValue: number,
) => void;

export type Options = {
  customShorthands?: Record<string, CustomShorthand>;
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

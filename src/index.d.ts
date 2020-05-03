declare class Path extends Array {}

export type JSONPathExpressionErrorHandler = (ex: Error) => void;
export type JSONPathExpressionMatchHandler = (
  value: unknown,
  path: Path,
) => void;

export class JSONPathExpression {
  constructor(
    pathExpression: string,
    onMatch: JSONPathExpressionMatchHandler,
    onError: JSONPathExpressionErrorHandler,
  );

  public path: string;
  public matches(scope: Scope): boolean;
  public onMatch: JSONPathExpressionMatchHandler;
  public onError: JSONPathExpressionErrorHandler;
}

export function traverse(
  obj: { [key in PropertyKey]: unknown },
  exprs: JSONPathExpression[],
): void;

export class Scope {

}

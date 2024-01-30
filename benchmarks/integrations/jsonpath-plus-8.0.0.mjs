import * as JSONPath from 'https://unpkg.com/jsonpath-plus@8.0.0';

export default (suite, document, expressions) => {
  suite.add('JSONPath-Plus@8.0.0 (resultType=value)', function () {
    for (let i = 0; i < expressions.length; i++) {
      JSONPath.JSONPath({
        json: document,
        path: expressions[i],
        resultType: 'value',
      });
    }
  });

  suite.add('JSONPath-Plus@8.0.0 (resultType=all)', function () {
    for (let i = 0; i < expressions.length; i++) {
      JSONPath.JSONPath({
        json: document,
        path: expressions[i],
        resultType: 'all',
      });
    }
  });
};

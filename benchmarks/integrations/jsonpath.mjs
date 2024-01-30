import * as jp from 'https://unpkg.com/jsonpath';

export default (suite, document, expressions) => {
  suite.add('JSONPath', function () {
    for (let i = 0; i < expressions.length; i++) {
      jp.query(document, expressions[i]);
    }
  });
};

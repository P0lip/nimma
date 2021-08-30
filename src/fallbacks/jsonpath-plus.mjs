import { JSONPath } from 'jsonpath-plus';
import toPath from 'lodash.topath';

import Fallback from '../codegen/fallback.mjs';

export default new Fallback(
  {
    'jsonpath-plus': [
      { imported: 'JSONPath', local: 'JSONPath', value: JSONPath },
    ],
    'lodash.topath': [{ imported: 'default', local: 'toPath', value: toPath }],
  },
  function (input, path, fn) {
    this.JSONPath({
      callback: result =>
        void fn({
          path: this.toPath(result.path.slice(1)),
          value: result.value,
        }),
      json: input,
      path,
      resultType: 'all',
    });
  },
);

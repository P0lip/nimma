import * as assert from 'node:assert/strict';
import { parseArgs } from 'node:util';

import { IsoBench } from 'iso-bench';

import integrations from './integrations/index.mjs';
import scenarios from './scenarios.mjs';
import loadDocument from './utils/load-document.mjs';

const options = {
  document: {
    type: 'string',
  },
  scenario: {
    type: 'string',
  },
};

const { values } = parseArgs({ options });

const scenario = scenarios.find(({ name }) => name === values.scenario);

assert.ok(scenario);

const { expressions } = scenario;

const document = await loadDocument(scenario, values.document);

const suite = new IsoBench('JSONPath vs Nimma vs JSONPath-Plus', 'ops/sec');

for (const integration of scenario.integrations) {
  await integrations[integration](suite, document, expressions);
}

await suite.consoleLog().run();

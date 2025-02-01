import {existsSync, mkdirSync, writeFileSync} from 'node:fs';
import {join} from 'node:path';

import {TEMP_ADD_DIR} from 'test/constants';
import {getPkgTemplate} from 'test/constants/template';
import {RUN_CLI_CMD, testExec} from 'test/helpers/test-exec';

async function testAddAction() {
  const pkg = getPkgTemplate();

  // Create the test temporary directory
  if (!existsSync(TEMP_ADD_DIR)) {
    mkdirSync(TEMP_ADD_DIR);
  }

  // Create the package.json file
  writeFileSync(join(TEMP_ADD_DIR, 'package.json'), pkg);

  await testExec(`${RUN_CLI_CMD} add button`);
}

testAddAction();

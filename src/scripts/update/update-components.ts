import {store} from 'src/constants/store';

import {initCache} from '../cache/cache';
import {isGithubAction, updateComponents} from '../helpers';

if (!isGithubAction) {
  // Won't run on GitHub Actions
  initCache(true);
  // Update beta components
  store.beta = true;
  // Update canary components
  store.canary = true;
  updateComponents({fetchBasic: true});
}

import {isGithubAction, updateComponents} from '../helpers';

if (!isGithubAction) {
  // Won't run on GitHub Actions
  updateComponents();
}

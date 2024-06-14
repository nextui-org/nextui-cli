import type { SAFE_ANY } from './type';

import { type InitActionOptions, templatesMap } from 'src/actions/init-action';

import { AGENTS, type Agent } from './detect';
import { printMostMatchText } from './math-diff';

export function checkInitOptions(template: InitActionOptions['template'], agent: Agent) {
  if (template) {
    if (!Object.keys(templatesMap).includes(template)) {
      printMostMatchText(Object.keys(templatesMap), template)
    }
  }
  if (agent) {
    if (!AGENTS.includes(agent)) {
      printMostMatchText(AGENTS as SAFE_ANY, agent)
    }
  }
}
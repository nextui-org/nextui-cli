import type {SAFE_ANY} from './type';

import path from 'node:path';

import {findUp} from 'find-up';

import {ROOT} from 'src/constants/path';

type TupleToUnion<T extends readonly SAFE_ANY[]> = T[number];

export const AGENTS = ['npm', 'bun', 'pnpm', 'yarn'] as const;

export type Agent = TupleToUnion<typeof AGENTS>;

export const agents = AGENTS;

// the order here matters, more specific one comes first
export const LOCKS: Record<string, Agent> = {
  'bun.lockb': 'bun',
  'npm-shrinkwrap.json': 'npm',
  'package-lock.json': 'npm',
  'pnpm-lock.yaml': 'pnpm',
  'yarn.lock': 'yarn'
};

export async function detect(cwd = ROOT) {
  let agent: Agent | null = null;
  const lockPath = await findUp(Object.keys(LOCKS), {cwd});

  // detect based on lock
  if (!agent && lockPath) {
    agent = LOCKS[path.basename(lockPath)]!;
  }

  return agent;
}

import { Logger } from './logger';

export function getCommandDescAndLog(log: string, desc: string) {
  Logger.gradient(log);

  return desc;
}

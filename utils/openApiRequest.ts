import {Logger} from "./Logger/Logger";

const logger = new Logger('OpenApi');
Logger.useJsonStringify = true;

export const openApiRequest = async <TResult,TParam extends object>(req: (opts: TParam) => Promise<TResult>, opts: TParam): Promise<TResult> => {
  logger.debug('Request: ',opts)
  const result = await req(opts);
  const res = result as any
  if(res.error){
    logger.debug(`Response ${res.status}:`,res.error);
  }
  if(res.status === 200){
    logger.debug('res: 200:',res)
  }
  return res
}
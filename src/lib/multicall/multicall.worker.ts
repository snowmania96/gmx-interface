import { METRIC_EVENT_NAME } from "context/MetricsContext/emitMetricEvent";

import { MAX_TIMEOUT, Multicall } from "./Multicall";
import type { MulticallRequestConfig } from "./types";

async function executeMulticall(chainId: number, request: MulticallRequestConfig<any>) {
  const multicall = await Multicall.getInstance(chainId);

  return multicall?.call(request, MAX_TIMEOUT);
}

self.addEventListener("message", run);

async function run(event) {
  const { PRODUCTION_PREVIEW_KEY, chainId, request, id } = event.data;
  // @ts-ignore
  self.PRODUCTION_PREVIEW_KEY = PRODUCTION_PREVIEW_KEY;

  try {
    const result = await executeMulticall(chainId, request);

    postMessage({
      id,
      result,
    });
  } catch (error) {
    postMessage({ id, error: error });
  }
}

globalThis.addEventListener(METRIC_EVENT_NAME, (event) => {
  postMessage({
    isMetrics: true,
    detail: (event as CustomEvent).detail,
  });
});

// Typescript hack to make it seem this file exports a class
declare class MulticallWorker extends Worker {
  constructor();
}

export default MulticallWorker;

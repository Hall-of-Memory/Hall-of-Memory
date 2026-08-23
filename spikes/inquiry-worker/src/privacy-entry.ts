import coreWorker from './index.ts';
import { handleAdminPrivacyRead, type CoreEnv } from './admin-privacy.ts';

type CoreFetch = typeof coreWorker.fetch;
type CoreContext = Parameters<CoreFetch>[2];

export default {
  async fetch(request: Request, env: CoreEnv, ctx: CoreContext): Promise<Response> {
    const privacyRead = await handleAdminPrivacyRead(request, env);
    if (privacyRead) return privacyRead;
    return coreWorker.fetch(request, env, ctx);
  },
};

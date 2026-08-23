import coreWorker from './index.ts';
import { handleAdminPage } from './admin-page.ts';
import { handleAdminPrivacyRead, type CoreEnv } from './admin-privacy.ts';

type CoreFetch = typeof coreWorker.fetch;
type CoreContext = Parameters<CoreFetch>[2];

export default {
  async fetch(request: Request, env: CoreEnv, ctx: CoreContext): Promise<Response> {
    const adminPage = await handleAdminPage(request, env);
    if (adminPage) return adminPage;
    const privacyRead = await handleAdminPrivacyRead(request, env);
    if (privacyRead) return privacyRead;
    return coreWorker.fetch(request, env, ctx);
  },
};

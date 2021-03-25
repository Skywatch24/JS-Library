import CoreManager from './CoreManager';

const {SITE_URL, LANG_SELECTOR} = CoreManager;

const config = () => ({
  apiURL:
    process.env.NODE_ENV === 'development'
      ? `/api/v2`
      : `https://${CoreManager.get(SITE_URL)}/${CoreManager.get(
          LANG_SELECTOR,
        )}/api/v2`,
});
export default config();

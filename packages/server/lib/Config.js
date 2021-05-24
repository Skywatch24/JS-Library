import {Constants} from '@skywatch/api';
import CoreManager from './CoreManager';

const {SITE_URL} = Constants;

const config = () => ({
  apiURL:
    process.env.NODE_ENV === 'development'
      ? `/api/v2`
      : `https://${CoreManager.get(SITE_URL)}/api/v2`,
});
export default config();

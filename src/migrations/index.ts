import * as migration_20261109_221848_initial from './20261109_221848_initial';
import * as migration_20261110_213121_seo_and_redirects from './20261110_213121_seo_and_redirects';

export const migrations = [
  {
    up: migration_20261109_221848_initial.up,
    down: migration_20261109_221848_initial.down,
    name: '20261109_221848_initial',
  },
  {
    up: migration_20261110_213121_seo_and_redirects.up,
    down: migration_20261110_213121_seo_and_redirects.down,
    name: '20261110_213121_seo_and_redirects'
  },
];

import * as migration_20261008_134508_initial from "./20261008_134508_initial";
import * as migration_20261008_135608_workflow_storage from "./20261008_135608_workflow_storage";
import * as migration_20261008_135925_section_anchors from "./20261008_135925_section_anchors";
import * as migration_20261011_102136_google_integrations from "./20261011_102136_google_integrations";
import * as migration_20261012_080223_newsletter_registrations from "./20261012_080223_newsletter_registrations";

import * as publishedResearch from "./20261012_170000_published_research";
import * as homepageEditorial from "./20261015_090000_homepage_editorial";
import * as homepageHeroMoney from "./20261015_110000_homepage_hero_money";
export const migrations = [
  {
    up: migration_20261008_134508_initial.up,
    down: migration_20261008_134508_initial.down,
    name: "20261008_134508_initial",
  },
  {
    up: migration_20261008_135608_workflow_storage.up,
    down: migration_20261008_135608_workflow_storage.down,
    name: "20261008_135608_workflow_storage",
  },
  {
    up: migration_20261008_135925_section_anchors.up,
    down: migration_20261008_135925_section_anchors.down,
    name: "20261008_135925_section_anchors",
  },
  {
    up: migration_20261011_102136_google_integrations.up,
    down: migration_20261011_102136_google_integrations.down,
    name: "20261011_102136_google_integrations",
  },
  {
    up: migration_20261012_080223_newsletter_registrations.up,
    down: migration_20261012_080223_newsletter_registrations.down,
    name: "20261012_080223_newsletter_registrations",
  },
  {
    up: publishedResearch.up,
    down: publishedResearch.down,
    name: "20261012_170000_published_research",
  },
  {
    up: homepageEditorial.up,
    down: homepageEditorial.down,
    name: "20261015_090000_homepage_editorial",
  },
  {
    up: homepageHeroMoney.up,
    down: homepageHeroMoney.down,
    name: "20261015_110000_homepage_hero_money",
  },
];

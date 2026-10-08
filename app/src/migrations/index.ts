import * as migration_20261008_134508_initial from "./20261008_134508_initial";
import * as migration_20261008_135608_workflow_storage from "./20261008_135608_workflow_storage";
import * as migration_20261008_135925_section_anchors from "./20261008_135925_section_anchors";

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
];

// This file is required for Expo/React Native SQLite migrations - https://orm.drizzle.team/quick-sqlite/expo

import journal from './meta/_journal.json';
import m0000 from './0000_sparkling_silverclaw.sql';
import m0001 from './0001_exercise_seed.sql';
import m0002 from './0002_users.sql';
import m0003 from './0003_exercise_changes.sql';
import m0004 from './0004_exercise_external_id.sql';
import m0005 from './0005_workouts.sql';
import m0006 from './0006_workout_changes.sql';
import m0007 from './0007_external_id_constraints.sql';
import m0008 from './0008_workout_user_id.sql';
import m0009 from './0009_foregin_keys.sql';
import m0010 from './0010_sync_related_fields_on_syncable_entities.sql';
import m0011 from './0011_synced_entities_deletion.sql';

export default {
  journal,
  migrations: {
    m0000,
    m0001,
    m0002,
    m0003,
    m0004,
    m0005,
    m0006,
    m0007,
    m0008,
    m0009,
    m0010,
    m0011,
  },
};

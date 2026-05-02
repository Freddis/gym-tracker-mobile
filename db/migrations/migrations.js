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
import m0012 from './0012_exercise_equipment.sql';
import m0013 from './0013_workout_types.sql';
import m0014 from './0014_exercise_muscles2.sql';
import m0015 from './0015_removing_exessive_external_ids.sql';
import m0016 from './0016_adding_entries.sql';
import m0017 from './0017_entry_time.sql';
import m0018 from './0018_post_entries.sql';
import m0019 from './0019_external_id_renaming.sql';
import m0020 from './0020_extra_fields_for_entries.sql';
import m0021 from './0021_outdoor_run_entries.sql';
import m0022 from './0022_outdoor_walk_entries.sql';
import m0023 from './0023_outdoor_run_entries_restructuring.sql';
import m0024 from './0024_switching_from_id_to_uuid.sql';

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
m0012,
m0013,
m0014,
m0015,
m0016,
m0017,
m0018,
m0019,
m0020,
m0021,
m0022,
m0023,
m0024
    }
  }
  
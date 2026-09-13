import { projects } from '../data/projects.js';
import { racks, lenses } from '../data/racks.js';
import activity from '../data/activity.json';
import uptime from '../data/uptime.json';
import { buildRackModel } from './rackModel.js';

// The one rack model the app uses. Built once at import, and it throws if
// racks.js and projects.js disagree, so a mistake fails loudly in dev.
export const RACK_MODEL = buildRackModel({ projects, racks, lenses, activity, uptime });

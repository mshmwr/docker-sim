import type { Section } from '../core/types';
import { layerCache } from './layer-cache';
import { lifecycleStopKill } from './lifecycle-stop-kill';
import { minimalBaseNoSecrets } from './minimal-base-no-secrets';

export const SECTIONS: Section[] = [lifecycleStopKill, layerCache, minimalBaseNoSecrets];

export const sectionById = (id: string) => SECTIONS.find((s) => s.id === id);

export const sectionsIn = (chapter: number) => SECTIONS.filter((s) => s.chapter === chapter);

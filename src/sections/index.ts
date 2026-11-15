import type { Section } from '../core/types';
import { ghostFiles } from './ghost-files';
import { goScratch } from './go-scratch';
import { measureThenOptimize } from './measure-then-optimize';
import { registryMirrorProxy } from './registry-mirror-proxy';
import { reorderLayersRuby } from './reorder-layers-ruby';
import { buildContextDockerignore } from './build-context-dockerignore';
import { buildxMultiplatform } from './buildx-multiplatform';
import { cmdVsEntrypoint } from './cmd-vs-entrypoint';
import { dockerfileInstructions } from './dockerfile-instructions';
import { multiStage } from './multi-stage';
import { commitExportPrune } from './commit-export-prune';
import { desktopVsEngine } from './desktop-vs-engine';
import { dockerArchitecture } from './docker-architecture';
import { dockerGroupRoot } from './docker-group-root';
import { execNotSsh } from './exec-not-ssh';
import { firstContainer } from './first-container';
import { imageContainerRegistry } from './image-container-registry';
import { imageLayersCow } from './image-layers-cow';
import { installDockerCe } from './install-docker-ce';
import { layerCache } from './layer-cache';
import { lifecycleStopKill } from './lifecycle-stop-kill';
import { minimalBaseNoSecrets } from './minimal-base-no-secrets';
import { observeContainers } from './observe-containers';
import { runFlags } from './run-flags';
import { tagsAndDigest } from './tags-and-digest';
import { vmVsContainer } from './vm-vs-container';
import { whyContainers } from './why-containers';

export const SECTIONS: Section[] = [
  whyContainers,
  imageContainerRegistry,
  imageLayersCow,
  vmVsContainer,
  dockerArchitecture,
  firstContainer,
  desktopVsEngine,
  installDockerCe,
  dockerGroupRoot,
  runFlags,
  observeContainers,
  execNotSsh,
  lifecycleStopKill,
  tagsAndDigest,
  commitExportPrune,
  dockerfileInstructions,
  cmdVsEntrypoint,
  buildContextDockerignore,
  layerCache,
  multiStage,
  buildxMultiplatform,
  measureThenOptimize,
  reorderLayersRuby,
  registryMirrorProxy,
  ghostFiles,
  goScratch,
  minimalBaseNoSecrets,
];

export const sectionById = (id: string) => SECTIONS.find((s) => s.id === id);

export const sectionsIn = (chapter: number) => SECTIONS.filter((s) => s.chapter === chapter);

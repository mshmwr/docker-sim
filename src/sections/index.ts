import type { Section } from '../core/types';
import { buildContextDockerignore } from './build-context-dockerignore';
import { buildxMultiplatform } from './buildx-multiplatform';
import { ciGatekeeper } from './ci-gatekeeper';
import { cmdVsEntrypoint } from './cmd-vs-entrypoint';
import { commitExportPrune } from './commit-export-prune';
import { composeDeclarative } from './compose-declarative';
import { composeLifecycle } from './compose-lifecycle';
import { dependsOnHealthcheck } from './depends-on-healthcheck';
import { desktopVsEngine } from './desktop-vs-engine';
import { dockerArchitecture } from './docker-architecture';
import { dockerGroupRoot } from './docker-group-root';
import { dockerfileInstructions } from './dockerfile-instructions';
import { envOverrideProfiles } from './env-override-profiles';
import { execNotSsh } from './exec-not-ssh';
import { firstContainer } from './first-container';
import { ghostFiles } from './ghost-files';
import { goScratch } from './go-scratch';
import { imageContainerRegistry } from './image-container-registry';
import { imageLayersCow } from './image-layers-cow';
import { installDockerCe } from './install-docker-ce';
import { layerCache } from './layer-cache';
import { lifecycleStopKill } from './lifecycle-stop-kill';
import { measureThenOptimize } from './measure-then-optimize';
import { minimalBaseNoSecrets } from './minimal-base-no-secrets';
import { multiStage } from './multi-stage';
import { networksExposePorts } from './networks-expose-ports';
import { observeContainers } from './observe-containers';
import { privateRegistry } from './private-registry';
import { pushLoginLayers } from './push-login-layers';
import { registryMirrorProxy } from './registry-mirror-proxy';
import { registryPrefix } from './registry-prefix';
import { registryTlsAuth } from './registry-tls-auth';
import { reorderLayersRuby } from './reorder-layers-ruby';
import { runFlags } from './run-flags';
import { serviceNameDns } from './service-name-dns';
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
  composeDeclarative,
  serviceNameDns,
  dependsOnHealthcheck,
  networksExposePorts,
  envOverrideProfiles,
  composeLifecycle,
  registryPrefix,
  pushLoginLayers,
  ciGatekeeper,
  privateRegistry,
  registryTlsAuth,
  minimalBaseNoSecrets,
];

export const sectionById = (id: string) => SECTIONS.find((s) => s.id === id);

export const sectionsIn = (chapter: number) => SECTIONS.filter((s) => s.chapter === chapter);

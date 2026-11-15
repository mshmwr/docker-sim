import type { Section } from '../core/types';
import { desktopVsEngine } from './desktop-vs-engine';
import { dockerArchitecture } from './docker-architecture';
import { dockerGroupRoot } from './docker-group-root';
import { firstContainer } from './first-container';
import { imageContainerRegistry } from './image-container-registry';
import { imageLayersCow } from './image-layers-cow';
import { installDockerCe } from './install-docker-ce';
import { layerCache } from './layer-cache';
import { lifecycleStopKill } from './lifecycle-stop-kill';
import { minimalBaseNoSecrets } from './minimal-base-no-secrets';
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
  lifecycleStopKill,
  layerCache,
  minimalBaseNoSecrets,
];

export const sectionById = (id: string) => SECTIONS.find((s) => s.id === id);

export const sectionsIn = (chapter: number) => SECTIONS.filter((s) => s.chapter === chapter);

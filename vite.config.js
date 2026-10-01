import {defineConfig} from 'vite';
import {physicalSampler} from './packages/physical-sampler/vite.js';
export default defineConfig({plugins:[physicalSampler()]});

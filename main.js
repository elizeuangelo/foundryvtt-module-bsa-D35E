import { D35E } from './module/D35E.js';
Hooks.on('beavers-system-interface.init', async function () {
    beaversSystemInterface.register(new D35E());
});

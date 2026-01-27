import { Plugin } from './types';

class PluginRegistry {
    private plugins: Map<string, Plugin> = new Map();

    register(plugin: Plugin) {
        if (this.plugins.has(plugin.id)) {
            console.warn(`Plugin with id ${plugin.id} is already registered.`);
            return;
        }
        this.plugins.set(plugin.id, plugin);
    }

    getPlugins(): Plugin[] {
        return Array.from(this.plugins.values());
    }

    getPlugin(id: string): Plugin | undefined {
        return this.plugins.get(id);
    }
}

export const pluginRegistry = new PluginRegistry();

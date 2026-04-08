/**
 * ─── COMMAND HANDLER ───
 * Loads and manages commands from the plugins/ directory.
 * Features: hot-reload, aliases, cooldowns, stats, suggestions.
 */

import fs from 'fs';
import path from 'path';
import { pathToFileURL } from 'url';
import { log } from './Logger.js';

class CommandHandler {
    constructor() {
        /** @type {Map<string, object>} command name → plugin */
        this.commands = new Map();
        /** @type {Map<string, string>} alias → command name */
        this.aliases = new Map();
        /** @type {Map<string, string[]>} category → command names */
        this.categories = new Map();
        /** @type {Map<string, { calls: number, errors: number, totalMs: number }>} */
        this.stats = new Map();
        /** @type {Map<string, number>} `userId_cmd` → last usage timestamp */
        this.cooldowns = new Map();
        /** @type {Set<string>} disabled commands */
        this.disabled = new Set();
    }

    /**
     * Load all plugins from the plugins/ directory.
     */
    async loadCommands() {
        const pluginsPath = path.join(process.cwd(), 'plugins');
        if (!fs.existsSync(pluginsPath)) {
            fs.mkdirSync(pluginsPath, { recursive: true });
            log('warn', 'Created empty plugins/ directory');
            return;
        }

        const files = fs.readdirSync(pluginsPath).filter(f => f.endsWith('.js'));
        let loaded = 0;

        for (const file of files) {
            try {
                const filePath = path.join(pluginsPath, file);
                const moduleURL = pathToFileURL(filePath).href;
                const module = await import(moduleURL);
                const plugin = module.default || module;

                // Support both 'handler' and 'execute' for compatibility
                const handler = plugin.handler || plugin.execute;

                if (plugin.command && typeof handler === 'function') {
                    plugin.handler = handler; // Normalize to use 'handler'
                    this._register(plugin);
                    loaded++;
                } else {
                    log('warn', `Plugin ${file} is missing 'command' string or 'handler' function`);
                }
            } catch (err) {
                log('error', `Failed to load plugin ${file}: ${err.message}`);
            }
        }

        log('success', `Loaded ${loaded} commands from ${files.length} plugin files`);
    }

    /**
     * Register a single plugin.
     */
    _register(plugin) {
        const { command, aliases = [], category = 'misc' } = plugin;
        const cmdKey = command.toLowerCase();

        // Init stats
        this.stats.set(cmdKey, { calls: 0, errors: 0, totalMs: 0 });

        // Store command
        this.commands.set(cmdKey, {
            ...plugin,
            command: cmdKey,
            category: category.toLowerCase(),
        });

        // Map aliases
        for (const alias of aliases) {
            this.aliases.set(alias.toLowerCase(), cmdKey);
        }

        // Categorize
        const cat = category.toLowerCase();
        if (!this.categories.has(cat)) {
            this.categories.set(cat, []);
        }
        const catList = this.categories.get(cat);
        if (!catList.includes(cmdKey)) {
            catList.push(cmdKey);
        }
    }

    /**
     * Get a command by text input.
     * @param {string} text - Full message text (e.g., ".ban @user")
     * @param {string[]} prefixes
     * @returns {object|null} The matched command plugin or null
     */
    getCommand(text, prefixes) {
        const usedPrefix = prefixes.find(p => text.startsWith(p));
        if (!usedPrefix) return null;

        const cmdName = text.slice(usedPrefix.length).trim().split(/\s+/)[0].toLowerCase();
        if (!cmdName) return null;

        // Direct match
        if (this.commands.has(cmdName)) {
            return { command: this.commands.get(cmdName), prefix: usedPrefix };
        }

        // Alias match
        if (this.aliases.has(cmdName)) {
            const mainCmd = this.aliases.get(cmdName);
            return { command: this.commands.get(mainCmd), prefix: usedPrefix };
        }

        return null;
    }

    /**
     * Check cooldown for a user+command.
     * @returns {boolean} true if on cooldown (should block)
     */
    isOnCooldown(userId, cmdKey, cooldownMs = 3000) {
        const key = `${userId}_${cmdKey}`;
        const last = this.cooldowns.get(key);
        const now = Date.now();

        if (last && now - last < cooldownMs) {
            return true;
        }

        this.cooldowns.set(key, now);
        
        // Cleanup old entries every 100 additions (prevent memory leak)
        if (this.cooldowns.size > 5000) {
            const oldestThreshold = now - 3600000; // 1 hour
            for (const [key, ts] of this.cooldowns.entries()) {
                if (ts < oldestThreshold) {
                    this.cooldowns.delete(key);
                }
            }
        }
        
        return false;
    }

    /**
     * Record command execution stats.
     */
    recordExecution(cmdKey, durationMs, hadError = false) {
        const s = this.stats.get(cmdKey);
        if (!s) return;
        s.calls++;
        s.totalMs += durationMs;
        if (hadError) s.errors++;
    }

    /**
     * Get all commands grouped by category.
     * @returns {Map<string, object[]>}
     */
    getByCategory() {
        const result = new Map();
        for (const [cat, cmdNames] of this.categories) {
            const cmds = cmdNames
                .map(name => this.commands.get(name))
                .filter(c => c && !this.disabled.has(c.command));
            if (cmds.length > 0) {
                result.set(cat, cmds);
            }
        }
        return result;
    }

    /**
     * Simple Levenshtein for "did you mean?" suggestions.
     */
    _levenshtein(a, b) {
        const tmp = [];
        for (let i = 0; i <= a.length; i++) tmp[i] = [i];
        for (let j = 0; j <= b.length; j++) tmp[0][j] = j;
        for (let i = 1; i <= a.length; i++) {
            for (let j = 1; j <= b.length; j++) {
                tmp[i][j] = Math.min(
                    tmp[i - 1][j] + 1,
                    tmp[i][j - 1] + 1,
                    tmp[i - 1][j - 1] + (a[i - 1] === b[j - 1] ? 0 : 1)
                );
            }
        }
        return tmp[a.length][b.length];
    }

    /**
     * Find a suggestion for a mistyped command.
     */
    findSuggestion(cmdName) {
        const allNames = [...this.commands.keys(), ...this.aliases.keys()];
        let best = null;
        let minDist = 3;
        for (const name of allNames) {
            const d = this._levenshtein(cmdName, name);
            if (d < minDist) {
                minDist = d;
                best = name;
            }
        }
        return best;
    }

    /**
     * Reload all commands from disk.
     */
    async reloadCommands() {
        this.commands.clear();
        this.aliases.clear();
        this.categories.clear();
        this.stats.clear();
        this.cooldowns.clear();
        this.disabled.clear();
        await this.loadCommands();
    }

    /**
     * Watch plugins folder for hot-reload.
     */
    watchPlugins() {
        const pluginsPath = path.join(process.cwd(), 'plugins');
        if (!fs.existsSync(pluginsPath)) return;

        fs.watch(pluginsPath, async (_event, filename) => {
            if (!filename || !filename.endsWith('.js')) return;
            const filePath = path.join(pluginsPath, filename);
            try {
                if (fs.existsSync(filePath)) {
                    // Cache-bust by appending timestamp
                    const moduleURL = pathToFileURL(filePath).href + `?t=${Date.now()}`;
                    const module = await import(moduleURL);
                    const plugin = module.default || module;
                    if (plugin.command && typeof plugin.handler === 'function') {
                        this._register(plugin);
                        log('success', `Hot-reloaded plugin: ${filename}`);
                    }
                }
            } catch (err) {
                log('error', `Hot-reload failed for ${filename}: ${err.message}`);
            }
        });

        log('info', 'Watching plugins/ for changes...');
    }
}

// Singleton
export default new CommandHandler();

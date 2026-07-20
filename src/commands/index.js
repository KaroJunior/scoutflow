// src/commands/index.js
/**
 * Command Registry
 * Manages all available bot commands
 */

const logger = require('../services/logger');

class CommandRegistry {
  constructor(bot, storage) {
    this.bot = bot;
    this.storage = storage;
    this.commands = new Map();
    this.initialized = false;
  }

  initialize() {
    if (this.initialized) {
      logger.warn('Command registry already initialized');
      return;
    }

    // Lazy load commands to avoid circular dependencies
    const StartCommand = require('./start');
    const HelpCommand = require('./help');
    const PingCommand = require('./ping');
    const StatusCommand = require('./status');
    const VersionCommand = require('./version');

    // Register all commands
    const commands = [
      new StartCommand(this.bot, this.storage),
      new HelpCommand(this.bot, this.storage),
      new PingCommand(this.bot, this.storage),
      new StatusCommand(this.bot, this.storage),
      new VersionCommand(this.bot, this.storage)
    ];

    for (const command of commands) {
      this.register(command);
    }

    this.initialized = true;
    logger.info(`Command registry initialized with ${this.commands.size} commands`);
  }

  register(command) {
    if (this.commands.has(command.name)) {
      logger.warn(`Command ${command.name} already registered, overwriting`);
    }

    this.commands.set(command.name, command);
    logger.debug(`Registered command: ${command.name}`);
  }

  get(name) {
    return this.commands.get(name);
  }

  getAll() {
    return Array.from(this.commands.values());
  }

  async execute(ctx, commandName) {
    const command = this.get(commandName);

    if (!command) {
      logger.warn(`Unknown command: ${commandName}`);
      return false;
    }

    try {
      await command.execute(ctx);
      return true;
    } catch (error) {
      logger.error(`Error executing command ${commandName}:`, error);
      await ctx.reply('❌ An error occurred while executing this command.');
      return false;
    }
  }
}

let registryInstance = null;

function getCommandRegistry(bot, storage) {
  if (!registryInstance) {
    registryInstance = new CommandRegistry(bot, storage);
    registryInstance.initialize();
  }
  return registryInstance;
}

module.exports = {
  CommandRegistry,
  getCommandRegistry
};
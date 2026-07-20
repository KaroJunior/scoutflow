/**
 * Command Configuration
 * Defines available bot commands and their metadata
 */

const COMMANDS = {
  start: {
    name: 'start',
    description: 'Start the bot and get introduction',
    requiresAuth: true,
    category: 'general'
  },
  help: {
    name: 'help',
    description: 'Show available commands',
    requiresAuth: true,
    category: 'general'
  },
  ping: {
    name: 'ping',
    description: 'Check bot responsiveness',
    requiresAuth: true,
    category: 'general'
  },
  status: {
    name: 'status',
    description: 'Show application status and statistics',
    requiresAuth: true,
    category: 'monitoring'
  },
  version: {
    name: 'version',
    description: 'Show application version',
    requiresAuth: true,
    category: 'general'
  }
  // Future commands (not yet implemented):
  // groups: {
  //   name: 'groups',
  //   description: 'List monitored Facebook groups',
  //   requiresAuth: true,
  //   category: 'facebook'
  // },
  // addgroup: {
  //   name: 'addgroup',
  //   description: 'Add a Facebook group to monitor',
  //   requiresAuth: true,
  //   category: 'facebook'
  // },
  // removegroup: {
  //   name: 'removegroup',
  //   description: 'Remove a Facebook group from monitoring',
  //   requiresAuth: true,
  //   category: 'facebook'
  // },
  // keywords: {
  //   name: 'keywords',
  //   description: 'Manage keyword list and weights',
  //   requiresAuth: true,
  //   category: 'scoring'
  // },
  // services: {
  //   name: 'services',
  //   description: 'Manage platform services (enable/disable)',
  //   requiresAuth: true,
  //   category: 'administration'
  // },
  // settings: {
  //   name: 'settings',
  //   description: 'View and modify application settings',
  //   requiresAuth: true,
  //   category: 'administration'
  // },
  // stats: {
  //   name: 'stats',
  //   description: 'Show detailed statistics and metrics',
  //   requiresAuth: true,
  //   category: 'monitoring'
  // }
};

function getCommands() {
  return COMMANDS;
}

function getCommand(name) {
  return COMMANDS[name];
}

function getCommandsByCategory(category) {
  return Object.values(COMMANDS).filter(cmd => cmd.category === category);
}

function getAllCommandDescriptions() {
  return Object.values(COMMANDS).map(cmd => `/${cmd.name} - ${cmd.description}`);
}

module.exports = {
  COMMANDS,
  getCommands,
  getCommand,
  getCommandsByCategory,
  getAllCommandDescriptions
};
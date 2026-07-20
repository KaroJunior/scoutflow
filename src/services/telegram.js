/**
 * Telegram Service
 * Wrapper around Telegraf bot for sending messages
 */

const logger = require('./logger');
const { getBot } = require('../bot');

class TelegramService {
  constructor() {
    this.bot = getBot();
    this.adminChatId = process.env.TELEGRAM_ADMIN_CHAT_ID;
  }

  async sendMessage(chatId, text, options = {}) {
    try {
      const result = await this.bot.telegram.sendMessage(chatId, text, {
        parse_mode: 'HTML',
        disable_web_page_preview: true,
        ...options
      });
      logger.debug('Telegram message sent to:', chatId);
      return result;
    } catch (error) {
      logger.error('Failed to send Telegram message:', error);
      throw error;
    }
  }

  async sendToAdmin(text, options = {}) {
    if (!this.adminChatId) {
      logger.warn('Admin chat ID not configured');
      return;
    }
    return this.sendMessage(this.adminChatId, text, options);
  }

  async sendNotification(lead) {
    const message = this.formatNotification(lead);
    return this.sendToAdmin(message, {
      reply_markup: {
        inline_keyboard: [
          [
            { text: '📂 Open Post', url: lead.url },
            { text: '✅ Ignore', callback_data: `ignore_${lead.id}` }
          ]
        ]
      }
    });
  }

  formatNotification(lead) {
    const emoji = lead.score >= 70 ? '🔥' : lead.score >= 50 ? '📌' : '💡';
    const date = new Date(lead.createdAt).toLocaleString();

    return `
${emoji} <b>Potential Lead Found!</b>

<b>Platform:</b> ${lead.platform}
<b>Group:</b> ${lead.group || 'N/A'}
<b>Author:</b> ${lead.author}
<b>Posted:</b> ${date}
<b>Confidence:</b> ${lead.score}/100

<b>Why it matched:</b>
${lead.matchedKeywords?.join(', ') || 'N/A'}

<b>Post Content:</b>
${lead.text?.substring(0, 300)}${lead.text?.length > 300 ? '...' : ''}

💡 <b>Suggested Reply:</b>
"Hi ${lead.author}, I came across your post and I'd love to discuss how I can help with this. I'm a developer with experience in web development and automation. Would you be open to a quick chat?"
    `.trim();
  }

  async answerCallback(callbackQueryId, text, showAlert = false) {
    try {
      await this.bot.telegram.answerCbQuery(callbackQueryId, text, { showAlert });
    } catch (error) {
      logger.error('Failed to answer callback:', error);
    }
  }
}

let telegramService = null;

function getTelegramService() {
  if (!telegramService) {
    telegramService = new TelegramService();
  }
  return telegramService;
}

module.exports = {
  TelegramService,
  getTelegramService
};
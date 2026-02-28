import { config } from '../config.js';

export class TelegramNotifier {
  async send(message: string): Promise<void> {
    if (!config.telegramBotToken || !config.telegramChatId) {
      return;
    }

    await fetch(`https://api.telegram.org/bot${config.telegramBotToken}/sendMessage`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        chat_id: config.telegramChatId,
        text: message,
        parse_mode: 'Markdown'
      })
    });
  }
}

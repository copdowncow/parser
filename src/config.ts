import 'dotenv/config';

const toNumber = (value: string | undefined, fallback: number) => {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
};

const toBoolean = (value: string | undefined, fallback: boolean) => {
  if (value === undefined) return fallback;
  return value.toLowerCase() === 'true';
};

export const config = {
  port: toNumber(process.env.PORT, 3000),
  host: process.env.HOST ?? '0.0.0.0',
  parserIntervalMinutes: toNumber(process.env.PARSER_INTERVAL_MINUTES, 10),
  opportunityAlertThreshold: toNumber(process.env.OPPORTUNITY_ALERT_THRESHOLD, 70),
  telegramBotToken: process.env.TELEGRAM_BOT_TOKEN,
  telegramChatId: process.env.TELEGRAM_CHAT_ID,
  githubOwner: process.env.GITHUB_OWNER ?? 'microsoft',
  githubRepo: process.env.GITHUB_REPO ?? 'TypeScript',
  githubLabel: process.env.GITHUB_LABEL ?? 'Help Wanted',
  githubSourceEnabled: toBoolean(process.env.GITHUB_SOURCE_ENABLED, true),
  storageFilePath: process.env.STORAGE_FILE_PATH ?? 'data/storage.json'
};

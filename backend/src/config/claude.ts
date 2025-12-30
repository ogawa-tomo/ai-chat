import Anthropic from '@anthropic-ai/sdk';
import dotenv from 'dotenv';

dotenv.config();

const apiKey = process.env.ANTHROPIC_API_KEY;
if (!apiKey) {
  throw new Error('ANTHROPIC_API_KEY environment variable is required');
}

export const claude = new Anthropic({
  apiKey,
});

export const claudeConfig = {
  model: process.env.CLAUDE_MODEL || 'claude-3-5-sonnet-20241022',
  maxTokens: parseInt(process.env.CLAUDE_MAX_TOKENS || '4096', 10),
};

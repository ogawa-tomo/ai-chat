import { Response } from 'express';
import Anthropic from '@anthropic-ai/sdk';
import { claude, claudeConfig } from '../config/claude';
import { MessageContent } from '../types/models';
import { AppError } from '../middleware/errorHandler';

export class ClaudeService {
  /**
   * Send message to Claude API and stream response to client via Server-Sent Events
   */
  async streamMessage(
    res: Response,
    messages: MessageContent[],
    model?: string
  ): Promise<string> {
    try {
      // Convert MessageContent to Anthropic message format
      const anthropicMessages = messages.map((msg) => ({
        role: msg.role === 'USER' ? ('user' as const) : ('assistant' as const),
        content: msg.content,
      }));

      // Note: SSE headers should be set by the controller before calling this method

      let fullResponse = '';

      // Create streaming request
      const stream = claude.messages.stream({
        model: model || claudeConfig.model,
        max_tokens: claudeConfig.maxTokens,
        messages: anthropicMessages,
      });

      // Handle text events
      stream.on('text', (text) => {
        fullResponse += text;
        // Send SSE event to client
        res.write(`data: ${JSON.stringify({ type: 'text', content: text })}\n\n`);
      });

      // Handle errors
      stream.on('error', (error) => {
        console.error('Claude API streaming error:', error);

        let errorMessage = 'Stream error occurred';
        if (error instanceof Anthropic.APIError) {
          // Provide more specific error messages
          if (error.status === 400 && error.message.includes('credit balance')) {
            errorMessage = 'Claude API credit balance is too low. Please check your billing settings.';
          } else if (error.status === 401) {
            errorMessage = 'Invalid API key. Please check your configuration.';
          } else if (error.status === 429) {
            errorMessage = 'Rate limit exceeded. Please try again later.';
          } else {
            errorMessage = `Claude API error: ${error.message}`;
          }
        }

        res.write(
          `data: ${JSON.stringify({ type: 'error', message: errorMessage })}\n\n`
        );
        res.end();
      });

      // Wait for stream to complete
      await stream.finalMessage();

      // Send completion event
      res.write(`data: ${JSON.stringify({ type: 'done' })}\n\n`);
      res.end();

      return fullResponse;
    } catch (error) {
      console.error('Claude API error:', error);

      if (error instanceof Anthropic.APIError) {
        throw new AppError(503, 'CLAUDE_API_ERROR', 'Claude API request failed', {
          status: error.status,
          message: error.message,
        });
      }

      throw new AppError(500, 'INTERNAL_SERVER_ERROR', 'Failed to process message');
    }
  }

  /**
   * Send non-streaming message to Claude API (for testing purposes)
   */
  async sendMessage(
    messages: MessageContent[],
    model?: string
  ): Promise<string> {
    try {
      const anthropicMessages = messages.map((msg) => ({
        role: msg.role === 'USER' ? ('user' as const) : ('assistant' as const),
        content: msg.content,
      }));

      const response = await claude.messages.create({
        model: model || claudeConfig.model,
        max_tokens: claudeConfig.maxTokens,
        messages: anthropicMessages,
      });

      // Extract text content from response
      const textContent = response.content.find((block) => block.type === 'text');
      if (!textContent || textContent.type !== 'text') {
        throw new Error('No text content in response');
      }

      return textContent.text;
    } catch (error) {
      console.error('Claude API error:', error);

      if (error instanceof Anthropic.APIError) {
        throw new AppError(503, 'CLAUDE_API_ERROR', 'Claude API request failed', {
          status: error.status,
          message: error.message,
        });
      }

      throw new AppError(500, 'INTERNAL_SERVER_ERROR', 'Failed to process message');
    }
  }
}

export default new ClaudeService();

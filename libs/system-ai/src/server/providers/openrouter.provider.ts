import { OpenAiCompatibleProvider } from './openai.provider';

const OPENROUTER_BASE_URL = 'https://openrouter.ai/api/v1';

export class OpenRouterProvider extends OpenAiCompatibleProvider {
  constructor(
    apiKey: string,
    baseUrl: string = OPENROUTER_BASE_URL,
  ) {
    super({
      name: 'openrouter',
      apiKey,
      baseUrl,
      headers: {
        'HTTP-Referer': 'https://try.ikary.co',
        'X-Title': 'Ikary Try',
      },
    });
  }
}

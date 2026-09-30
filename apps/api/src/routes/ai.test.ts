import { describe, it, expect, vi, beforeEach } from 'vitest';
import { Hono } from 'hono';
import { aiRouter } from './ai';

describe('AI Route - /api/ai/story-evaluate', () => {
  let app: Hono<any>;
  let mockAiRun: any;
  let mockEnv: any;

  beforeEach(() => {
    vi.clearAllMocks();
    mockAiRun = vi.fn();
    mockEnv = {
      AI: {
        run: mockAiRun
      }
    };
    app = new Hono();
    app.route('/api/ai', aiRouter);
  });

  it('should return 400 when story or question is missing', async () => {
    const res = await app.request('/api/ai/story-evaluate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ story: null, question: 'ok adama isabet etti mi?' })
    }, mockEnv);

    expect(res.status).toBe(400);
    const json: any = await res.json();
    expect(json.error).toBe('Story and question are required');
  });

  it('should pass riddle premise and secret backstory to AI and return clean EVET answer', async () => {
    mockAiRun.mockResolvedValueOnce({
      response: JSON.stringify({
        thought: 'Riddle premise states arrow hit the man. Secret truth confirms arrow struck the venomous bite.',
        status: 'valid',
        answer: 'EVET',
        explanation: ''
      })
    });

    const story = {
      id: 'apple-shoot',
      promptTr: 'Bir okçu adamın başındaki elmayı vuramaz, oku adama isabet ettirir. Vurulan adam "Teşekkür ederim" der. Neden?',
      fullStoryTr: 'Adam zehirli bir yılan tarafından ısırılmıştı, ok zehirli bölgeyi kanatarak zehri dışarı çıkardı.',
      keyFacts: ['yılan', 'zehir']
    };

    const res = await app.request('/api/ai/story-evaluate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ story, question: 'Ok adama isabet etti mi?' })
    }, mockEnv);

    expect(res.status).toBe(200);
    const json: any = await res.json();
    expect(json.answer).toBe('EVET');
    expect(json.status).toBe('valid');

    // Verify AI received both riddle premise and secret backstory
    expect(mockAiRun).toHaveBeenCalledTimes(1);
    const callArgs = mockAiRun.mock.calls[0];
    const systemContent = callArgs[1].messages[0].content;
    expect(systemContent).toContain('Bir okçu adamın başındaki elmayı vuramaz');
    expect(systemContent).toContain('Adam zehirli bir yılan tarafından ısırılmıştı');
    expect(systemContent).toContain('Ok adama isabet etti mi?');
    expect(callArgs[1].temperature).toBe(0.1);
  });

  it('should return HAYIR for false attribute questions like "Ok zehirli mi?"', async () => {
    mockAiRun.mockResolvedValueOnce({
      response: JSON.stringify({
        thought: 'The snake was poisonous and the wound was venomous, but the arrow itself was not poisoned.',
        status: 'valid',
        answer: 'HAYIR',
        explanation: ''
      })
    });

    const story = {
      id: 'apple-shoot',
      promptTr: 'Bir okçu adamın başındaki elmayı vuramaz, oku adama isabet ettirir. Vurulan adam "Teşekkür ederim" der. Neden?',
      fullStoryTr: 'Adam zehirli bir yılan tarafından ısırılmıştı, ok zehirli bölgeyi kanatarak zehri dışarı çıkardı.',
      keyFacts: ['yılan', 'zehir']
    };

    const res = await app.request('/api/ai/story-evaluate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ story, question: 'Ok zehirli mi?' })
    }, mockEnv);

    expect(res.status).toBe(200);
    const json: any = await res.json();
    expect(json.answer).toBe('HAYIR');
    expect(json.status).toBe('valid');
  });

  it('should return warning for open-ended questions like "Neden teşekkür etti?"', async () => {
    mockAiRun.mockResolvedValueOnce({
      response: JSON.stringify({
        thought: 'Question starts with Neden, requiring explanation instead of Yes/No.',
        status: 'warning',
        answer: '⚠️ UYARI: Soru Şekli Geçersiz',
        explanation: 'Lütfen sadece Evet veya Hayır cevabı verilebilecek sorular sorun!'
      })
    });

    const story = {
      id: 'apple-shoot',
      promptTr: 'Bir okçu adamın başındaki elmayı vuramaz, oku adama isabet ettirir. Vurulan adam "Teşekkür ederim" der. Neden?',
      fullStoryTr: 'Adam zehirli bir yılan tarafından ısırılmıştı, ok zehirli bölgeyi kanatarak zehri dışarı çıkardı.',
    };

    const res = await app.request('/api/ai/story-evaluate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ story, question: 'Neden teşekkür etti?' })
    }, mockEnv);

    expect(res.status).toBe(200);
    const json: any = await res.json();
    expect(json.status).toBe('warning');
    expect(json.answer).toContain('UYARI');
  });
});

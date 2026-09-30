import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import StoryPuzzle, { SURRENDER_LOCKOUT_MS } from './StoryPuzzle';
import { STORIES, normalizePuzzleText, evaluateStoryQuestion } from './storyPuzzlesData';

describe('Story Puzzle - Lateral Thinking Evaluation Engine', () => {
  describe('Turkish Text Normalization', () => {
    it('should correctly normalize Turkish characters and casing', () => {
      expect(normalizePuzzleText('OK ADAMA İSABET ETTİ Mİ?')).toBe('ok adama isabet etti mi');
      expect(normalizePuzzleText('OK ZEHİRLİ Mİ?')).toBe('ok zehirli mi');
      expect(normalizePuzzleText('YILAN MI ISIRDI?')).toBe('yilan mi isirdi');
      expect(normalizePuzzleText('ÇÖLDEKİ YANIK KİBRİT')).toBe('coldeki yanik kibrit');
    });
  });

  describe('Story: Okçu ve Elma (apple-shoot) - User Scenario', () => {
    const story = STORIES.find(s => s.id === 'apple-shoot');
    expect(story).toBeDefined();

    it('should answer EVET to "ok adama isabet etti mi" (as stated in riddle premise and backstory)', () => {
      const result = evaluateStoryQuestion(story, 'ok adama isabet etti mi', true);
      expect(result.status).toBe('valid');
      expect(result.answer).toBe('EVET');
    });

    it('should answer EVET to "OK ADAMA İSABET ETTİ Mİ?" in uppercase with question mark', () => {
      const result = evaluateStoryQuestion(story, 'OK ADAMA İSABET ETTİ Mİ?', true);
      expect(result.status).toBe('valid');
      expect(result.answer).toBe('EVET');
    });

    it('should answer HAYIR to "ok zehirli mi" (because snake had venom, not the arrow)', () => {
      const result = evaluateStoryQuestion(story, 'ok zehirli mi', true);
      expect(result.status).toBe('valid');
      expect(result.answer).toBe('HAYIR');
    });

    it('should answer HAYIR to "ok zehirli miydi" or "zehirli ok mu"', () => {
      expect(evaluateStoryQuestion(story, 'ok zehirli miydi', true).answer).toBe('HAYIR');
      expect(evaluateStoryQuestion(story, 'zehirli ok mu', true).answer).toBe('HAYIR');
      expect(evaluateStoryQuestion(story, 'okta zehir var mıydı', true).answer).toBe('HAYIR');
    });

    it('should answer EVET to "adam zehirlendi mi"', () => {
      const result = evaluateStoryQuestion(story, 'adam zehirlendi mi', true);
      expect(result.status).toBe('valid');
      expect(result.answer).toBe('EVET');
    });

    it('should answer HAYIR to "okçu elmayı vurdu mu"', () => {
      const result = evaluateStoryQuestion(story, 'okçu elmayı vurdu mu', true);
      expect(result.status).toBe('valid');
      expect(result.answer).toBe('HAYIR');
    });

    it('should answer HAYIR to "okçu bilerek mi vurdu" or "kasıtlı mıydı"', () => {
      expect(evaluateStoryQuestion(story, 'okçu bilerek mi vurdu', true).answer).toBe('HAYIR');
      expect(evaluateStoryQuestion(story, 'kasıtlı mı vurdu', true).answer).toBe('HAYIR');
    });

    it('should answer EVET to "adamı yılan mı ısırdı"', () => {
      const result = evaluateStoryQuestion(story, 'adamı yılan mı ısırdı', true);
      expect(result.status).toBe('valid');
      expect(result.answer).toBe('EVET');
    });

    it('should answer EVET to "zehir dışarı çıktı mı"', () => {
      const result = evaluateStoryQuestion(story, 'zehir dışarı çıktı mı', true);
      expect(result.status).toBe('valid');
      expect(result.answer).toBe('EVET');
    });

    it('should answer Önemsiz to irrelevant questions like "ok rengi neydi?"', () => {
      const result = evaluateStoryQuestion(story, 'ok rengi neydi?', true);
      expect(result.status).toBe('irrelevant');
      expect(result.answer).toBe('Önemsiz');
    });

    it('should return warning for open-ended questions like "Neden teşekkür etti?"', () => {
      const result = evaluateStoryQuestion(story, 'Neden teşekkür etti?', true);
      expect(result.status).toBe('warning');
      expect(result.answer).toContain('UYARI');
    });

    it('should answer correctly in English mode', () => {
      expect(evaluateStoryQuestion(story, 'Did the arrow hit the man?', false).answer).toBe('YES');
      expect(evaluateStoryQuestion(story, 'Was the arrow poisoned?', false).answer).toBe('NO');
      expect(evaluateStoryQuestion(story, 'Was the man poisoned?', false).answer).toBe('YES');
      expect(evaluateStoryQuestion(story, 'Did he die?', false).answer).toBe('NO');
    });
  });

  describe('Other Classic Stories Ground Truth', () => {
    it('Story 1 (seagull-meat): should reject born blind and verify human flesh', () => {
      const story = STORIES.find(s => s.id === 'seagull-meat');
      expect(evaluateStoryQuestion(story, 'Adam doğuştan mı kördü?', true).answer).toBe('HAYIR');
      expect(evaluateStoryQuestion(story, 'Adada karısının etini mi yedi?', true).answer).toBe('EVET');
      expect(evaluateStoryQuestion(story, 'Uçak kazası mı oldu?', true).answer).toBe('EVET');
      expect(evaluateStoryQuestion(story, 'Adam karısını mı öldürdü?', true).answer).toBe('HAYIR');
    });

    it('Story 2 (elevator-man): should verify dwarf attribute and reject exercise', () => {
      const story = STORIES.find(s => s.id === 'elevator-man');
      expect(evaluateStoryQuestion(story, 'Adam spor olsun diye mi yürüyordu?', true).answer).toBe('HAYIR');
      expect(evaluateStoryQuestion(story, 'Adam cüce miydi?', true).answer).toBe('EVET');
      expect(evaluateStoryQuestion(story, '10. kat düğmesine yetişemiyor mu?', true).answer).toBe('EVET');
    });

    it('Story 3 (bar-water): should verify hiccups and reject thirst/murder', () => {
      const story = STORIES.find(s => s.id === 'bar-water');
      expect(evaluateStoryQuestion(story, 'Adam susamış mıydı?', true).answer).toBe('HAYIR');
      expect(evaluateStoryQuestion(story, 'Adamın hıçkırığı mı vardı?', true).answer).toBe('EVET');
      expect(evaluateStoryQuestion(story, 'Barmen adamı korkutmak mı istedi?', true).answer).toBe('EVET');
    });

    it('Story 6 (ice-block): should verify ice melted and reject murder', () => {
      const story = STORIES.find(s => s.id === 'ice-block');
      expect(evaluateStoryQuestion(story, 'Olay bir cinayet mi?', true).answer).toBe('HAYIR');
      expect(evaluateStoryQuestion(story, 'Adam buz kalıbı üstüne mi çıktı?', true).answer).toBe('EVET');
      expect(evaluateStoryQuestion(story, 'Buz eridi mi?', true).answer).toBe('EVET');
    });

    it('Story 10 (push-car): should verify Monopoly board game and reject real car', () => {
      const story = STORIES.find(s => s.id === 'push-car');
      expect(evaluateStoryQuestion(story, 'Gerçek bir araba mıydı?', true).answer).toBe('HAYIR');
      expect(evaluateStoryQuestion(story, 'Bu bir masa oyunu mu?', true).answer).toBe('EVET');
      expect(evaluateStoryQuestion(story, 'Monopoly mi oynuyordu?', true).answer).toBe('EVET');
    });
  });

  describe('Story Puzzle Component - 24-Hour Surrender Lockout Flow', () => {
    beforeEach(() => {
      localStorage.clear();
      vi.restoreAllMocks();
    });

    it('should lock input, disable solving, and permanently show backstory when user surrenders', async () => {
      // Mock window.confirm to return true for surrender confirmation
      vi.spyOn(window, 'confirm').mockReturnValue(true);

      render(
        <MemoryRouter>
          <StoryPuzzle />
        </MemoryRouter>
      );

      // Surrender button should be visible
      const surrenderBtn = screen.getByRole('button', { name: /(?:Tam Hikayeyi Göster \(Teslim Ol\)|Reveal Full Story)/i });
      expect(surrenderBtn).toBeInTheDocument();

      // Click surrender
      await userEvent.click(surrenderBtn);

      // 1. Olay hep gösterilmiş olsun (Backstory displayed)
      expect(screen.getByText(/(?:Gerçek Hikaye Arka Planı \(Olay\)|Full Story Backstory)/i)).toBeInTheDocument();

      // 2. Yazma kısmı kilitlenmiş olsun (Input disabled with lock message)
      const input = screen.getByPlaceholderText(/🔒 (?:Teslim oldunuz|Surrendered)/i);
      expect(input).toBeDisabled();

      // 3. O hikayeyi çözemesin (Cannot solve, locked badge shown instead of guess button)
      expect(screen.getByText(/(?:Teslim Olundu - Çözülemez|Surrendered - Locked)/i)).toBeInTheDocument();
      expect(screen.queryByRole('button', { name: /(?:Hikayeyi Tahmin Et \/ Çöz|Solve \/ Guess Story)/i })).not.toBeInTheDocument();

      // 4. Stored in localStorage
      const surrenders = JSON.parse(localStorage.getItem('story_puzzle_surrenders_v1') || '{}');
      expect(Object.keys(surrenders).length).toBeGreaterThan(0);
    });

    it('should stay locked when loading a story surrendered less than 24 hours ago', () => {
      const map = {};
      STORIES.forEach(s => {
        map[s.id] = Date.now() - 1000 * 60 * 60; // 1 hour ago (within 24h)
      });
      localStorage.setItem('story_puzzle_surrenders_v1', JSON.stringify(map));

      render(
        <MemoryRouter>
          <StoryPuzzle />
        </MemoryRouter>
      );

      // Should be locked immediately on mount
      expect(screen.getByText(/(?:Teslim Olundu - Çözülemez|Surrendered - Locked)/i)).toBeInTheDocument();
      expect(screen.getByPlaceholderText(/🔒 (?:Teslim oldunuz|Surrendered)/i)).toBeDisabled();
      expect(screen.getByText(/(?:Gerçek Hikaye Arka Planı \(Olay\)|Full Story Backstory)/i)).toBeInTheDocument();
    });

    it('should automatically reactivate after 24 hours (lock expired)', () => {
      const map = {};
      STORIES.forEach(s => {
        map[s.id] = Date.now() - (SURRENDER_LOCKOUT_MS + 10000); // 24 hours + 10s ago
      });
      localStorage.setItem('story_puzzle_surrenders_v1', JSON.stringify(map));

      render(
        <MemoryRouter>
          <StoryPuzzle />
        </MemoryRouter>
      );

      // Should NOT be locked
      expect(screen.queryByText(/(?:Teslim Olundu - Çözülemez|Surrendered - Locked)/i)).not.toBeInTheDocument();
      expect(screen.getByPlaceholderText(/(?:Evet\/Hayır|Ask a yes\/no)/i)).not.toBeDisabled();
      expect(screen.getByRole('button', { name: /(?:Hikayeyi Tahmin Et \/ Çöz|Solve \/ Guess Story)/i })).toBeInTheDocument();
    });
  });
});

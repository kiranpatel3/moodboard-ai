import { beforeEach, describe, expect, it, jest } from '@jest/globals';
import { configureStore } from '@reduxjs/toolkit';
import boardReducer, {
  addCard,
  addConnection,
  commitSelectedOptions,
  generateCardRelation,
  generateStarterDeck,
  toggleOptionSelection,
  updateConnectionDescription,
  type AvailableOptions,
  type BoardState,
  type NewCard,
  type NewConnection,
  type StoryCard,
} from './boardSlice';

const sampleCard: NewCard = {
  type: 'character',
  title: 'Mira Ashford',
  content: 'A cartographer who maps emotional fault lines.',
  tags: ['protagonist', 'mystery'],
};

const sampleConnection: NewConnection = {
  fromId: 'card-a',
  toId: 'card-b',
  description: 'Childhood friends turned rivals.',
};

const aiGeneratedDescription =
  'Mira\'s maps begin to fracture inside the Glass Quarter, suggesting the setting is actively rewriting her personal history.';

function createTestStore(preloadedState?: { board: BoardState }) {
  return configureStore({
    reducer: { board: boardReducer },
    preloadedState,
  });
}

function seedBoardState(overrides: Partial<BoardState> = {}): BoardState {
  return {
    cards: [],
    connections: [],
    availableOptions: {
      characters: [],
      plots: [],
      settings: [],
    },
    selectedOptionIds: [],
    isGeneratingStarterDeck: false,
    starterDeckError: null,
    isGeneratingRelation: false,
    relationError: null,
    ...overrides,
  };
}

const sampleAvailableOptions: AvailableOptions = {
  characters: [
    {
      id: 'option-character-1',
      type: 'character',
      title: 'Mira Ashford',
      content: 'A cartographer hero.',
      tags: ['protagonist'],
    },
  ],
  plots: [
    {
      id: 'option-plot-1',
      type: 'plot',
      title: 'The Cartographer\'s Debt',
      content: 'A mystery plot thread.',
      tags: ['mystery'],
    },
  ],
  settings: [
    {
      id: 'option-setting-1',
      type: 'setting',
      title: 'The Glass Quarter',
      content: 'Mirrored towers in the city.',
      tags: ['urban'],
    },
  ],
};

describe('boardSlice', () => {
  beforeEach(() => {
    jest.restoreAllMocks();
  });

  describe('initial state', () => {
    it('returns empty cards and connections for undefined state', () => {
      const state = boardReducer(undefined, { type: '@@INIT' });

      expect(state).toEqual({
        cards: [],
        connections: [],
        availableOptions: {
          characters: [],
          plots: [],
          settings: [],
        },
        selectedOptionIds: [],
        isGeneratingStarterDeck: false,
        starterDeckError: null,
        isGeneratingRelation: false,
        relationError: null,
      });
    });

    it('ignores unknown actions and preserves existing state', () => {
      const existingState = seedBoardState({
        cards: [
          {
            id: 'card-1',
            type: 'plot',
            title: 'Existing',
            content: 'Existing content',
            tags: [],
          },
        ],
      });

      const state = boardReducer(existingState, { type: 'board/unknown' });

      expect(state).toEqual(existingState);
    });
  });

  describe('addCard', () => {
    it('adds a card with a generated id and preserves payload fields', () => {
      jest
        .spyOn(crypto, 'randomUUID')
        .mockReturnValue('11111111-1111-4111-8111-111111111111');

      const state = boardReducer(seedBoardState(), addCard(sampleCard));

      expect(state.cards).toHaveLength(1);
      expect(state.cards[0]).toEqual({
        id: '11111111-1111-4111-8111-111111111111',
        ...sampleCard,
      });
      expect(state.connections).toEqual([]);
    });

    it('appends multiple cards without altering prior entries', () => {
      jest
        .spyOn(crypto, 'randomUUID')
        .mockReturnValueOnce('11111111-1111-4111-8111-111111111111')
        .mockReturnValueOnce('22222222-2222-4222-8222-222222222222');

      let state = boardReducer(seedBoardState(), addCard(sampleCard));

      const secondCard: NewCard = {
        type: 'setting',
        title: 'The Glass Quarter',
        content: 'Mirrored towers refract memory into prismatic corridors.',
        tags: ['urban', 'sci-fi'],
      };

      state = boardReducer(state, addCard(secondCard));

      expect(state.cards).toHaveLength(2);
      expect(state.cards[0].id).toBe('11111111-1111-4111-8111-111111111111');
      expect(state.cards[1]).toEqual({
        id: '22222222-2222-4222-8222-222222222222',
        ...secondCard,
      });
    });

    it('does not mutate cards added in a previous state snapshot', () => {
      jest
        .spyOn(crypto, 'randomUUID')
        .mockReturnValue('11111111-1111-4111-8111-111111111111');

      const previousState = seedBoardState();
      const nextState = boardReducer(previousState, addCard(sampleCard));

      expect(previousState.cards).toHaveLength(0);
      expect(nextState.cards).toHaveLength(1);
    });
  });

  describe('addConnection', () => {
    it('adds a connection with a generated id and preserves payload fields', () => {
      jest
        .spyOn(crypto, 'randomUUID')
        .mockReturnValue('33333333-3333-4333-8333-333333333333');

      const state = boardReducer(
        seedBoardState(),
        addConnection(sampleConnection),
      );

      expect(state.connections).toHaveLength(1);
      expect(state.connections[0]).toEqual({
        id: '33333333-3333-4333-8333-333333333333',
        ...sampleConnection,
      });
      expect(state.cards).toEqual([]);
    });

    it('keeps cards unchanged when adding a connection', () => {
      jest
        .spyOn(crypto, 'randomUUID')
        .mockReturnValue('33333333-3333-4333-8333-333333333333');

      const existingState = seedBoardState({
        cards: [
          {
            id: 'card-a',
            type: 'character',
            title: 'Mira',
            content: 'Hero',
            tags: [],
          },
        ],
      });

      const state = boardReducer(existingState, addConnection(sampleConnection));

      expect(state.cards).toEqual(existingState.cards);
      expect(state.connections).toHaveLength(1);
    });
  });

  describe('updateConnectionDescription (reducer branch)', () => {
    it('updates the description for a matching connection on fulfilled', () => {
      const existingState = seedBoardState({
        connections: [
          {
            id: 'connection-1',
            fromId: 'card-a',
            toId: 'card-b',
            description: 'Draft connection',
          },
        ],
      });

      const state = boardReducer(
        existingState,
        updateConnectionDescription.fulfilled(
          { id: 'connection-1', description: aiGeneratedDescription },
          'request-1',
          { id: 'connection-1', description: aiGeneratedDescription },
        ),
      );

      expect(state.connections[0].description).toBe(aiGeneratedDescription);
      expect(state.connections[0].fromId).toBe('card-a');
      expect(state.connections[0].toId).toBe('card-b');
    });

    it('leaves state unchanged when fulfilled payload targets an unknown connection', () => {
      const existingState = seedBoardState({
        connections: [
          {
            id: 'connection-1',
            fromId: 'card-a',
            toId: 'card-b',
            description: 'Draft connection',
          },
        ],
      });

      const state = boardReducer(
        existingState,
        updateConnectionDescription.fulfilled(
          { id: 'missing-connection', description: aiGeneratedDescription },
          'request-2',
          { id: 'missing-connection', description: aiGeneratedDescription },
        ),
      );

      expect(state).toEqual(existingState);
    });
  });

  describe('updateConnectionDescription (async thunk integration)', () => {
    const mockFetch = jest.fn();

    beforeEach(() => {
      global.fetch = mockFetch as unknown as typeof fetch;
    });

    it('injects an async AI payload and updates connection state after resolution', async () => {
      jest
        .spyOn(crypto, 'randomUUID')
        .mockReturnValue('44444444-4444-4444-8444-444444444444');

      mockFetch.mockImplementation(
        () =>
          new Promise((resolve) => {
            setTimeout(() => {
              resolve({
                ok: true,
                json: async () => ({
                  id: '44444444-4444-4444-8444-444444444444',
                  description: aiGeneratedDescription,
                }),
              } as Response);
            }, 25);
          }),
      );

      const store = createTestStore();
      store.dispatch(addConnection(sampleConnection));

      const pendingAction = store.dispatch(
        updateConnectionDescription({
          id: '44444444-4444-4444-8444-444444444444',
          description: aiGeneratedDescription,
        }),
      );

      expect(store.getState().board.connections[0].description).toBe(
        sampleConnection.description,
      );

      const result = await pendingAction;

      expect(updateConnectionDescription.fulfilled.match(result)).toBe(true);
      expect(store.getState().board.connections[0].description).toBe(
        aiGeneratedDescription,
      );
      expect(mockFetch).toHaveBeenCalledWith(
        'http://localhost:3001/connections/44444444-4444-4444-8444-444444444444',
        {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ description: aiGeneratedDescription }),
        },
      );
    });

    it('preserves existing connection state when async AI injection fails', async () => {
      jest
        .spyOn(crypto, 'randomUUID')
        .mockReturnValue('55555555-5555-4555-8555-555555555555');

      mockFetch.mockResolvedValue({
        ok: false,
        status: 502,
      } as Response);

      const store = createTestStore();
      store.dispatch(addConnection(sampleConnection));

      const result = await store.dispatch(
        updateConnectionDescription({
          id: '55555555-5555-4555-8555-555555555555',
          description: aiGeneratedDescription,
        }),
      );

      expect(updateConnectionDescription.rejected.match(result)).toBe(true);
      expect(result.payload).toBe('Failed to update connection description');
      expect(store.getState().board.connections[0].description).toBe(
        sampleConnection.description,
      );
    });

    it('handles multiple sequential async injections without corrupting unrelated connections', async () => {
      jest
        .spyOn(crypto, 'randomUUID')
        .mockReturnValueOnce('66666666-6666-4666-8666-666666666666')
        .mockReturnValueOnce('77777777-7777-4777-8777-777777777777');

      mockFetch.mockResolvedValue({ ok: true } as Response);

      const store = createTestStore();
      store.dispatch(
        addConnection({
          fromId: 'card-a',
          toId: 'card-b',
          description: 'First draft',
        }),
      );
      store.dispatch(
        addConnection({
          fromId: 'card-b',
          toId: 'card-c',
          description: 'Second draft',
        }),
      );

      await store.dispatch(
        updateConnectionDescription({
          id: '66666666-6666-4666-8666-666666666666',
          description: 'First AI rewrite',
        }),
      );

      await store.dispatch(
        updateConnectionDescription({
          id: '77777777-7777-4777-8777-777777777777',
          description: 'Second AI rewrite',
        }),
      );

      const { connections } = store.getState().board;

      expect(connections[0].description).toBe('First AI rewrite');
      expect(connections[1].description).toBe('Second AI rewrite');
    });
  });

  describe('curation flow', () => {
    it('toggleOptionSelection adds and removes option ids', () => {
      let state = boardReducer(
        seedBoardState(),
        toggleOptionSelection('option-character-1'),
      );

      expect(state.selectedOptionIds).toEqual(['option-character-1']);

      state = boardReducer(state, toggleOptionSelection('option-character-1'));

      expect(state.selectedOptionIds).toEqual([]);
    });

    it('commitSelectedOptions moves selected cards into the active board and clears options', () => {
      const state = boardReducer(
        seedBoardState({
          availableOptions: sampleAvailableOptions,
          selectedOptionIds: ['option-character-1', 'option-setting-1'],
        }),
        commitSelectedOptions(),
      );

      expect(state.cards).toHaveLength(2);
      expect(state.cards.map((card) => card.id)).toEqual([
        'option-character-1',
        'option-setting-1',
      ]);
      expect(state.availableOptions).toEqual({
        characters: [],
        plots: [],
        settings: [],
      });
      expect(state.selectedOptionIds).toEqual([]);
    });

    it('generateStarterDeck fulfilled populates availableOptions without replacing active cards', () => {
      const existingCard: StoryCard = {
        id: 'active-card-1',
        type: 'character',
        title: 'Existing Hero',
        content: 'Already on the board.',
        tags: ['existing'],
      };

      const state = boardReducer(
        seedBoardState({
          cards: [existingCard],
        }),
        generateStarterDeck.fulfilled(sampleAvailableOptions, 'request-1', 'Cyberpunk'),
      );

      expect(state.cards).toEqual([existingCard]);
      expect(state.availableOptions).toEqual(sampleAvailableOptions);
      expect(state.selectedOptionIds).toEqual([]);
    });
  });

  describe('generateCardRelation (async thunk integration)', () => {
    const mockFetch = jest.fn();

    beforeEach(() => {
      global.fetch = mockFetch as unknown as typeof fetch;
      mockFetch.mockReset();
    });

    it('sets loading state while pending and appends a connection on fulfillment', async () => {
      jest
        .spyOn(crypto, 'randomUUID')
        .mockReturnValueOnce('11111111-1111-4111-8111-111111111111')
        .mockReturnValueOnce('22222222-2222-4222-8222-222222222222')
        .mockReturnValueOnce('33333333-3333-4333-8333-333333333333');

      mockFetch.mockImplementation(
        () =>
          new Promise((resolve) => {
            setTimeout(() => {
              resolve({
                ok: true,
                json: async () => ({
                  relationDescription: aiGeneratedDescription,
                  suggestedTags: ['mystery', 'urban'],
                }),
              } as Response);
            }, 25);
          }),
      );

      const store = createTestStore();
      store.dispatch(addCard(sampleCard));
      store.dispatch(
        addCard({
          type: 'setting',
          title: 'The Glass Quarter',
          content: 'Mirrored towers refract memory into prismatic corridors.',
          tags: ['urban', 'sci-fi'],
        }),
      );

      const [cardA, cardB] = store.getState().board.cards;
      const pendingAction = store.dispatch(
        generateCardRelation({ cardAId: cardA.id, cardBId: cardB.id }),
      );

      expect(store.getState().board.isGeneratingRelation).toBe(true);
      expect(store.getState().board.relationError).toBeNull();
      expect(store.getState().board.connections).toHaveLength(0);

      const result = await pendingAction;

      expect(generateCardRelation.fulfilled.match(result)).toBe(true);
      expect(store.getState().board.isGeneratingRelation).toBe(false);
      expect(store.getState().board.relationError).toBeNull();
      expect(store.getState().board.connections).toHaveLength(1);
      expect(store.getState().board.connections[0]).toEqual({
        id: '33333333-3333-4333-8333-333333333333',
        fromId: cardA.id,
        toId: cardB.id,
        description: aiGeneratedDescription,
        suggestedTags: ['mystery', 'urban'],
      });
      expect(mockFetch).toHaveBeenCalledWith(
        'http://localhost:3001/api/generate-relation',
        expect.objectContaining({
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
        }),
      );
    });

    it('captures server errors without crashing state', async () => {
      mockFetch.mockResolvedValue({
        ok: false,
        json: async () => ({ error: 'AI generation service is unavailable.' }),
      } as Response);

      const store = createTestStore({
        board: seedBoardState({
          cards: [
            {
              id: 'card-a',
              type: 'character',
              title: 'Mira',
              content: 'Hero',
              tags: [],
            },
            {
              id: 'card-b',
              type: 'setting',
              title: 'Quarter',
              content: 'City',
              tags: [],
            },
          ],
        }),
      });

      const result = await store.dispatch(
        generateCardRelation({ cardAId: 'card-a', cardBId: 'card-b' }),
      );

      expect(generateCardRelation.rejected.match(result)).toBe(true);
      expect(store.getState().board.isGeneratingRelation).toBe(false);
      expect(store.getState().board.relationError).toBe(
        'AI generation service is unavailable.',
      );
      expect(store.getState().board.connections).toHaveLength(0);
    });

    it('rejects when one or both cards cannot be found', async () => {
      const store = createTestStore();

      const result = await store.dispatch(
        generateCardRelation({ cardAId: 'missing-a', cardBId: 'missing-b' }),
      );

      expect(generateCardRelation.rejected.match(result)).toBe(true);
      expect(result.payload).toBe('One or both cards could not be found.');
      expect(store.getState().board.relationError).toBe(
        'One or both cards could not be found.',
      );
      expect(mockFetch).not.toHaveBeenCalled();
    });
  });

  describe('store-level card and connection workflows', () => {
    it('supports adding cards and connections through configureStore dispatch', () => {
      jest
        .spyOn(crypto, 'randomUUID')
        .mockReturnValueOnce('88888888-8888-4888-8888-888888888888')
        .mockReturnValueOnce('99999999-9999-4999-8999-999999999999');

      const store = createTestStore();

      store.dispatch(addCard(sampleCard));
      store.dispatch(
        addConnection({
          fromId: '88888888-8888-4888-8888-888888888888',
          toId: '88888888-8888-4888-8888-888888888888',
          description: 'Self-reflective arc',
        }),
      );

      const { cards, connections } = store.getState().board;

      expect(cards).toHaveLength(1);
      expect(connections).toHaveLength(1);
      expect(connections[0].fromId).toBe(cards[0].id);
    });
  });
});

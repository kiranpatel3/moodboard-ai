import {
  createAsyncThunk,
  createSelector,
  createSlice,
  type PayloadAction,
} from '@reduxjs/toolkit';

export type CardType = 'character' | 'setting' | 'plot';

export interface StoryCard {
  id: string;
  type: CardType;
  title: string;
  content: string;
  tags: string[];
}

export type Card = StoryCard;

export interface Connection {
  id: string;
  fromId: string;
  toId: string;
  description: string;
  suggestedTags?: string[];
}

export interface AvailableOptions {
  characters: StoryCard[];
  plots: StoryCard[];
  settings: StoryCard[];
}

export interface GenesisFoundation {
  genre: string;
  characters: StoryCard[];
  plots: StoryCard[];
  settings: StoryCard[];
  cardIds: string[];
}

export interface BoardState {
  cards: Card[];
  connections: Connection[];
  availableOptions: AvailableOptions;
  selectedOptionIds: string[];
  selectedGenre: string | null;
  genesisFoundation: GenesisFoundation | null;
  workbenchSlotA: StoryCard | null;
  workbenchSlotB: StoryCard | null;
  isGeneratingStarterDeck: boolean;
  starterDeckError: string | null;
  isGeneratingRelation: boolean;
  relationError: string | null;
}

export type NewCard = Omit<Card, 'id'>;
export type NewConnection = Omit<Connection, 'id'>;

export interface UpdateConnectionDescriptionPayload {
  id: string;
  description: string;
}

export interface GenerateCardRelationArgs {
  cardAId: string;
  cardBId: string;
}

export interface GenerateCardRelationResponse {
  relationDescription: string;
  suggestedTags: string[];
}

export interface StarterDeckResponse {
  characters: StoryCard[];
  plots: StoryCard[];
  settings: StoryCard[];
}

const API_BASE_URL = (
  import.meta.env.VITE_API_URL ?? 'http://localhost:5000'
).replace(/\/$/, '');

const GENERATE_RELATION_URL = `${API_BASE_URL}/api/generate-relation`;
const GENERATE_STARTER_DECK_URL = `${API_BASE_URL}/api/generate-starter-deck`;

const emptyAvailableOptions = (): AvailableOptions => ({
  characters: [],
  plots: [],
  settings: [],
});

const initialState: BoardState = {
  cards: [],
  connections: [],
  availableOptions: emptyAvailableOptions(),
  selectedOptionIds: [],
  selectedGenre: null,
  genesisFoundation: null,
  workbenchSlotA: null,
  workbenchSlotB: null,
  isGeneratingStarterDeck: false,
  starterDeckError: null,
  isGeneratingRelation: false,
  relationError: null,
};

function toCardPayload(card: Card) {
  return {
    title: card.title,
    content: card.content,
    type: card.type,
    tags: card.tags,
  };
}

function getAllAvailableOptionCards(options: AvailableOptions): StoryCard[] {
  return [
    ...options.characters,
    ...options.plots,
    ...options.settings,
  ];
}

function isStoryCard(value: unknown, expectedType: CardType): value is StoryCard {
  if (!value || typeof value !== 'object') {
    return false;
  }

  const record = value as Record<string, unknown>;

  return (
    typeof record.title === 'string' &&
    record.title.trim().length > 0 &&
    typeof record.content === 'string' &&
    record.content.trim().length > 0 &&
    record.type === expectedType &&
    Array.isArray(record.tags) &&
    record.tags.every((tag) => typeof tag === 'string') &&
    (record.id === undefined || typeof record.id === 'string')
  );
}

function normalizeStoryCards(
  cards: unknown,
  expectedType: CardType,
): StoryCard[] {
  if (!Array.isArray(cards)) {
    return [];
  }

  return cards
    .filter((card) => isStoryCard(card, expectedType))
    .map((card) => ({
      id: card.id ?? crypto.randomUUID(),
      type: expectedType,
      title: card.title.trim(),
      content: card.content.trim(),
      tags: card.tags.map((tag) => tag.trim()),
    }));
}

function parseStarterDeckResponse(payload: unknown): StarterDeckResponse | null {
  if (!payload || typeof payload !== 'object') {
    return null;
  }

  const record = payload as Record<string, unknown>;

  return {
    characters: normalizeStoryCards(record.characters, 'character'),
    plots: normalizeStoryCards(record.plots, 'plot'),
    settings: normalizeStoryCards(record.settings, 'setting'),
  };
}

export const generateStarterDeck = createAsyncThunk<
  AvailableOptions,
  string,
  { rejectValue: string }
>('board/generateStarterDeck', async (genre, { rejectWithValue }) => {
  try {
    const response = await fetch(GENERATE_STARTER_DECK_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ genre }),
    });

    if (!response.ok) {
      let errorMessage = 'Failed to generate starter deck.';

      try {
        const errorBody: unknown = await response.json();

        if (
          errorBody &&
          typeof errorBody === 'object' &&
          'error' in errorBody &&
          typeof errorBody.error === 'string'
        ) {
          errorMessage = errorBody.error;
        }
      } catch {
        // Keep the default error message when the body is not JSON.
      }

      return rejectWithValue(errorMessage);
    }

    const payload: unknown = await response.json();
    const starterDeck = parseStarterDeckResponse(payload);

    if (!starterDeck) {
      return rejectWithValue('Received an invalid starter deck payload from the server.');
    }

    const totalCards =
      starterDeck.characters.length +
      starterDeck.plots.length +
      starterDeck.settings.length;

    if (totalCards === 0) {
      return rejectWithValue('Starter deck did not include any story cards.');
    }

    return starterDeck;
  } catch {
    return rejectWithValue(
      'Network error while generating starter deck. Please try again.',
    );
  }
});

export const generateCardRelation = createAsyncThunk<
  Connection,
  GenerateCardRelationArgs,
  { rejectValue: string; state: { board: BoardState } }
>(
  'board/generateCardRelation',
  async ({ cardAId, cardBId }, { getState, rejectWithValue }) => {
    const { cards } = getState().board;
    const cardA = cards.find((card) => card.id === cardAId);
    const cardB = cards.find((card) => card.id === cardBId);

    if (!cardA || !cardB) {
      return rejectWithValue('One or both cards could not be found.');
    }

    try {
      const response = await fetch(GENERATE_RELATION_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          cardA: toCardPayload(cardA),
          cardB: toCardPayload(cardB),
        }),
      });

      if (!response.ok) {
        let errorMessage = 'Failed to generate card relation.';

        try {
          const errorBody: unknown = await response.json();

          if (
            errorBody &&
            typeof errorBody === 'object' &&
            'error' in errorBody &&
            typeof errorBody.error === 'string'
          ) {
            errorMessage = errorBody.error;
          }
        } catch {
          // Keep the default error message when the body is not JSON.
        }

        return rejectWithValue(errorMessage);
      }

      const payload: unknown = await response.json();

      if (
        !payload ||
        typeof payload !== 'object' ||
        !('relationDescription' in payload) ||
        !('suggestedTags' in payload) ||
        typeof payload.relationDescription !== 'string' ||
        !Array.isArray(payload.suggestedTags) ||
        !payload.suggestedTags.every((tag) => typeof tag === 'string')
      ) {
        return rejectWithValue('Received an invalid relation payload from the server.');
      }

      const relation = payload as GenerateCardRelationResponse;

      return {
        id: crypto.randomUUID(),
        fromId: cardAId,
        toId: cardBId,
        description: relation.relationDescription,
        suggestedTags: relation.suggestedTags,
      };
    } catch {
      return rejectWithValue(
        'Network error while generating card relation. Please try again.',
      );
    }
  },
);

export const updateConnectionDescription = createAsyncThunk<
  UpdateConnectionDescriptionPayload,
  UpdateConnectionDescriptionPayload,
  { rejectValue: string }
>(
  'board/updateConnectionDescription',
  async ({ id, description }, { rejectWithValue }) => {
    const response = await fetch(
      `${API_BASE_URL}/connections/${id}`,
      {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ description }),
      },
    );

    if (!response.ok) {
      return rejectWithValue('Failed to update connection description');
    }

    return { id, description };
  },
);

function clearWorkbenchState(state: BoardState) {
  state.workbenchSlotA = null;
  state.workbenchSlotB = null;
}

const boardSlice = createSlice({
  name: 'board',
  initialState,
  reducers: {
    addCard: (state, action: PayloadAction<NewCard>) => {
      state.cards.push({
        ...action.payload,
        id: crypto.randomUUID(),
      });
    },
    addConnection: (state, action: PayloadAction<NewConnection>) => {
      state.connections.push({
        ...action.payload,
        id: crypto.randomUUID(),
      });
    },
    toggleOptionSelection: (state, action: PayloadAction<string>) => {
      const optionId = action.payload;
      const selectedIndex = state.selectedOptionIds.indexOf(optionId);

      if (selectedIndex >= 0) {
        state.selectedOptionIds.splice(selectedIndex, 1);
        return;
      }

      state.selectedOptionIds.push(optionId);
    },
    commitSelectedOptions: (state) => {
      const selectedCards = getAllAvailableOptionCards(state.availableOptions).filter(
        (card) => state.selectedOptionIds.includes(card.id),
      );

      const characters = selectedCards.filter((card) => card.type === 'character');
      const plots = selectedCards.filter((card) => card.type === 'plot');
      const settings = selectedCards.filter((card) => card.type === 'setting');

      state.genesisFoundation = {
        genre: state.selectedGenre ?? 'Unknown',
        characters,
        plots,
        settings,
        cardIds: selectedCards.map((card) => card.id),
      };

      state.cards.push(...selectedCards);
      state.availableOptions = emptyAvailableOptions();
      state.selectedOptionIds = [];
    },
    placeInSlotA: (state, action: PayloadAction<StoryCard>) => {
      state.workbenchSlotA = action.payload;
    },
    placeInSlotB: (state, action: PayloadAction<StoryCard>) => {
      state.workbenchSlotB = action.payload;
    },
    clearWorkbenchSlots: (state) => {
      clearWorkbenchState(state);
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(generateStarterDeck.pending, (state, action) => {
        state.isGeneratingStarterDeck = true;
        state.starterDeckError = null;
        state.selectedGenre = action.meta.arg;
        state.availableOptions = emptyAvailableOptions();
        state.selectedOptionIds = [];
      })
      .addCase(generateStarterDeck.fulfilled, (state, action) => {
        state.isGeneratingStarterDeck = false;
        state.starterDeckError = null;
        state.availableOptions = action.payload;
        state.selectedOptionIds = [];
      })
      .addCase(generateStarterDeck.rejected, (state, action) => {
        state.isGeneratingStarterDeck = false;
        state.starterDeckError =
          action.payload ?? 'Failed to generate starter deck.';
      })
      .addCase(generateCardRelation.pending, (state) => {
        state.isGeneratingRelation = true;
        state.relationError = null;
      })
      .addCase(generateCardRelation.fulfilled, (state, action) => {
        state.isGeneratingRelation = false;
        state.relationError = null;
        state.connections.push(action.payload);
        clearWorkbenchState(state);
      })
      .addCase(generateCardRelation.rejected, (state, action) => {
        state.isGeneratingRelation = false;
        state.relationError =
          action.payload ?? 'Failed to generate card relation.';
      })
      .addCase(updateConnectionDescription.fulfilled, (state, action) => {
        const connection = state.connections.find(
          (item) => item.id === action.payload.id,
        );

        if (connection) {
          connection.description = action.payload.description;
        }
      });
  },
});

export const {
  addCard,
  addConnection,
  toggleOptionSelection,
  commitSelectedOptions,
  placeInSlotA,
  placeInSlotB,
  clearWorkbenchSlots,
} = boardSlice.actions;

type BoardRootState = { board: BoardState };

export const selectSelectedGenre = (state: BoardRootState) =>
  state.board.selectedGenre;

export const selectGenesisFoundation = (state: BoardRootState) =>
  state.board.genesisFoundation;

export const selectMoodboardCanvasCards = createSelector(
  [
    (state: BoardRootState) => state.board.cards,
    (state: BoardRootState) => state.board.genesisFoundation,
  ],
  (cards, genesisFoundation): Card[] => {
    if (!genesisFoundation) {
      return cards;
    }

    const genesisIds = new Set(genesisFoundation.cardIds);
    return cards.filter((card) => !genesisIds.has(card.id));
  },
);

export const selectSelectedCardsData = createSelector(
  [
    (state: BoardRootState) => state.board.selectedOptionIds,
    (state: BoardRootState) => state.board.availableOptions,
  ],
  (selectedOptionIds, availableOptions): StoryCard[] => {
    const cardById = new Map(
      getAllAvailableOptionCards(availableOptions).map((card) => [card.id, card]),
    );

    return selectedOptionIds
      .map((id) => cardById.get(id))
      .filter((card): card is StoryCard => Boolean(card));
  },
);

export default boardSlice.reducer;

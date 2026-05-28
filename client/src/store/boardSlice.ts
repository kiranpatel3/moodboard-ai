import {
  createAsyncThunk,
  createSlice,
  type PayloadAction,
} from '@reduxjs/toolkit';

export type CardType = 'character' | 'setting' | 'plot';

export interface Card {
  id: string;
  type: CardType;
  title: string;
  content: string;
  tags: string[];
}

export interface Connection {
  id: string;
  fromId: string;
  toId: string;
  description: string;
  suggestedTags?: string[];
}

export interface BoardState {
  cards: Card[];
  connections: Connection[];
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

const GENERATE_RELATION_URL = 'http://localhost:3001/api/generate-relation';

const initialState: BoardState = {
  cards: [],
  connections: [],
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
      `${import.meta.env.VITE_API_URL}/connections/${id}`,
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
  },
  extraReducers: (builder) => {
    builder
      .addCase(generateCardRelation.pending, (state) => {
        state.isGeneratingRelation = true;
        state.relationError = null;
      })
      .addCase(generateCardRelation.fulfilled, (state, action) => {
        state.isGeneratingRelation = false;
        state.relationError = null;
        state.connections.push(action.payload);
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

export const { addCard, addConnection } = boardSlice.actions;
export default boardSlice.reducer;

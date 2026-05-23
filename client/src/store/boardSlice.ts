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
}

export interface BoardState {
  cards: Card[];
  connections: Connection[];
}

export type NewCard = Omit<Card, 'id'>;
export type NewConnection = Omit<Connection, 'id'>;

export interface UpdateConnectionDescriptionPayload {
  id: string;
  description: string;
}

const initialState: BoardState = {
  cards: [],
  connections: [],
};

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
    builder.addCase(updateConnectionDescription.fulfilled, (state, action) => {
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

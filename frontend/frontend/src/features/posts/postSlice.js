import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { getFeedAPI, getPostBySlugAPI } from './postAPI';

export const fetchFeed = createAsyncThunk(
  'posts/fetchFeed',
  async (page, { rejectWithValue }) => {
    try {
      const { data } = await getFeedAPI(page);
      return data.data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || 'Failed to load feed');
    }
  }
);

export const fetchPostBySlug = createAsyncThunk(
  'posts/fetchBySlug',
  async (slug, { rejectWithValue }) => {
    try {
      const { data } = await getPostBySlugAPI(slug);
      return data.data; // { post, locked }
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || 'Post not found');
    }
  }
);

const postSlice = createSlice({
  name: 'posts',
  initialState: {
    feed: [],
    feedPage: 1,
    feedStatus: 'idle',
    current: null,
    currentLocked: false,
    currentStatus: 'idle',
    error: null,
  },
  reducers: {
    clearCurrentPost: (state) => {
      state.current = null;
      state.currentLocked = false;
      state.currentStatus = 'idle';
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchFeed.pending, (state) => {
        state.feedStatus = 'loading';
      })
      .addCase(fetchFeed.fulfilled, (state, action) => {
        state.feedStatus = 'succeeded';
        state.feed = action.payload.posts;
        state.feedPage = action.payload.page;
      })
      .addCase(fetchFeed.rejected, (state, action) => {
        state.feedStatus = 'failed';
        state.error = action.payload;
      })
      .addCase(fetchPostBySlug.pending, (state) => {
        state.currentStatus = 'loading';
      })
      .addCase(fetchPostBySlug.fulfilled, (state, action) => {
        state.currentStatus = 'succeeded';
        state.current = action.payload.post;
        state.currentLocked = action.payload.locked;
      })
      .addCase(fetchPostBySlug.rejected, (state, action) => {
        state.currentStatus = 'failed';
        state.error = action.payload;
      });
  },
});

export const { clearCurrentPost } = postSlice.actions;
export default postSlice.reducer;
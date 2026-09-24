import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import {
  getNotificationsAPI,
  markNotificationReadAPI,
  markAllNotificationsReadAPI,
} from './notificationAPI';

export const fetchNotifications = createAsyncThunk(
  'notifications/fetch',
  async (page = 1) => {
    const { data } = await getNotificationsAPI(page);
    return data.data;
  }
);

export const markAsRead = createAsyncThunk('notifications/markRead', async (id) => {
  await markNotificationReadAPI(id);
  return id;
});

export const markAllAsRead = createAsyncThunk('notifications/markAllRead', async () => {
  await markAllNotificationsReadAPI();
});

const notificationSlice = createSlice({
  name: 'notifications',
  initialState: {
    items: [],
    unreadCount: 0,
    status: 'idle',
  },
  reducers: {
    // Called when a 'notification:new' socket event arrives — prepend it live,
    // no refetch needed
    receiveLiveNotification: (state, action) => {
      state.items.unshift(action.payload);
      state.unreadCount += 1;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchNotifications.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(fetchNotifications.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.items = action.payload.notifications;
        state.unreadCount = action.payload.unreadCount;
      })
      .addCase(markAsRead.fulfilled, (state, action) => {
        const notif = state.items.find((n) => n.id === action.payload);
        if (notif && !notif.is_read) {
          notif.is_read = true;
          state.unreadCount = Math.max(0, state.unreadCount - 1);
        }
      })
      .addCase(markAllAsRead.fulfilled, (state) => {
        state.items.forEach((n) => (n.is_read = true));
        state.unreadCount = 0;
      });
  },
});

export const { receiveLiveNotification } = notificationSlice.actions;
export default notificationSlice.reducer;
import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { Product } from '../../types';
import { wishlistService } from '../../services/wishlistService';

interface WishlistState {
    items: Product[];
    loading: boolean;
    error: string | null;
    fetched: boolean;
}

const initialState: WishlistState = {
    items: [],
    loading: false,
    error: null,
    fetched: false,
};

// Async Thunks
export const fetchWishlist = createAsyncThunk(
    'wishlist/fetchWishlist',
    async (userId: string, { rejectWithValue }) => {
        try {
            return await wishlistService.fetchWishlist(userId);
        } catch (error: any) {
            return rejectWithValue(error.message);
        }
    }
);

export const syncWishlist = createAsyncThunk(
    'wishlist/syncWishlist',
    async (_, { getState, rejectWithValue }) => {
        try {
            const state = getState() as any;
            const userId = state.auth.user?.uid;
            const items = state.wishlist.items;

            if (userId) {
                await wishlistService.saveWishlist(userId, items);
            }
        } catch (error: any) {
            return rejectWithValue(error.message);
        }
    }
);

const wishlistSlice = createSlice({
    name: 'wishlist',
    initialState,
    reducers: {
        toggleWishlist: (state, action: PayloadAction<Product>) => {
            const index = state.items.findIndex((item) => item.id === action.payload.id);
            if (index >= 0) {
                state.items.splice(index, 1);
            } else {
                state.items.push(action.payload);
            }
        },
        clearWishlist: (state) => {
            state.items = [];
        },
        resetWishlist: () => {
            return initialState;
        }
    },
    extraReducers: (builder) => {
        builder
            .addCase(fetchWishlist.pending, (state) => {
                state.loading = true;
            })
            .addCase(fetchWishlist.fulfilled, (state, action) => {
                state.items = action.payload;
                state.loading = false;
                state.fetched = true;
            })
            .addCase(fetchWishlist.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload as string;
            });
    },
});

export const { toggleWishlist, clearWishlist, resetWishlist } = wishlistSlice.actions;
export default wishlistSlice.reducer;

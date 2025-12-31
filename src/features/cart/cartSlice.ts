import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { CartItem, Product } from '../../types';
import { cartService } from '../../services/cartService';
// import type { RootState } from '../../store/store'; // Removing circular dependency

interface CartState {
    items: CartItem[];
    isOpen: boolean;
    loading: boolean;
    error: string | null;
    fetched: boolean;
}

const initialState: CartState = {
    items: [],
    isOpen: false,
    loading: false,
    error: null,
    fetched: false,
};

// Async Thunks
export const fetchCart = createAsyncThunk(
    'cart/fetchCart',
    async (userId: string, { rejectWithValue }) => {
        try {
            return await cartService.fetchCart(userId);
        } catch (error: any) {
            return rejectWithValue(error.message);
        }
    }
);

export const syncCart = createAsyncThunk(
    'cart/syncCart',
    async (_, { getState, rejectWithValue }) => {
        try {
            const state = getState() as any; // Using any to avoid circular dependency with RootState
            const userId = state.auth.user?.uid;
            const items = state.cart.items;

            if (userId) {
                await cartService.saveCart(userId, items);
            }
        } catch (error: any) {
            return rejectWithValue(error.message);
        }
    }
);

const cartSlice = createSlice({
    name: 'cart',
    initialState,
    reducers: {
        addToCart: (state, action: PayloadAction<Product>) => {
            const existingItem = state.items.find((item) => item.id === action.payload.id);
            if (existingItem) {
                existingItem.quantity += 1;
            } else {
                state.items.push({ ...action.payload, quantity: 1 });
            }
        },
        removeFromCart: (state, action: PayloadAction<string>) => {
            state.items = state.items.filter((item) => item.id !== action.payload);
        },
        updateQuantity: (state, action: PayloadAction<{ id: string; quantity: number }>) => {
            const item = state.items.find((item) => item.id === action.payload.id);
            if (item) {
                item.quantity = Math.max(0, action.payload.quantity);
                if (item.quantity === 0) {
                    state.items = state.items.filter((i) => i.id !== action.payload.id);
                }
            }
        },
        clearCart: (state) => {
            state.items = [];
        },
        toggleCart: (state) => {
            state.isOpen = !state.isOpen;
        },
        resetCart: () => {
            return initialState;
        }
    },
    extraReducers: (builder) => {
        builder
            .addCase(fetchCart.pending, (state) => {
                state.loading = true;
            })
            .addCase(fetchCart.fulfilled, (state, action) => {
                state.items = action.payload;
                state.loading = false;
                state.fetched = true;
            })
            .addCase(fetchCart.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload as string;
            });
    },
});

export const { addToCart, removeFromCart, updateQuantity, clearCart, toggleCart, resetCart } = cartSlice.actions;
export default cartSlice.reducer;

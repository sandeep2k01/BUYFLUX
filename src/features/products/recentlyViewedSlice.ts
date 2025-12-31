import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { Product } from '../../types';

interface RecentlyViewedState {
    items: Product[];
}

const initialState: RecentlyViewedState = {
    items: JSON.parse(localStorage.getItem('recentlyViewed') || '[]'),
};

const recentlyViewedSlice = createSlice({
    name: 'recentlyViewed',
    initialState,
    reducers: {
        addToRecentlyViewed: (state, action: PayloadAction<Product>) => {
            const product = action.payload;
            // Remove if already exists to move to top
            state.items = state.items.filter(item => item.id !== product.id);
            // Add to beginning
            state.items.unshift(product);
            // Limit to 10 items
            state.items = state.items.slice(0, 10);
            localStorage.setItem('recentlyViewed', JSON.stringify(state.items));
        },
        clearRecentlyViewed: (state) => {
            state.items = [];
            localStorage.removeItem('recentlyViewed');
        }
    }
});

export const { addToRecentlyViewed, clearRecentlyViewed } = recentlyViewedSlice.actions;
export default recentlyViewedSlice.reducer;

import { describe, it, expect } from 'vitest';
import cartReducer, { addToCart, removeFromCart, updateQuantity, clearCart } from '../features/cart/cartSlice';
import { Product } from '../types';

describe('Cart Redux Slice', () => {
    const initialState = {
        items: [],
        isOpen: false,
        loading: false,
        error: null,
        fetched: false,
    };

    const mockProduct: Product = {
        id: '1',
        title: 'Modern Jacket',
        price: 1200,
        description: 'High end apparel',
        category: 'clothing',
        image: 'test.jpg',
        rating: { rate: 4.5, count: 10 },
        stock: 5
    };

    it('should handle adding a product to the cart', () => {
        const nextState = cartReducer(initialState as any, addToCart(mockProduct));
        expect(nextState.items).toHaveLength(1);
        expect(nextState.items[0].id).toBe('1');
        expect(nextState.items[0].quantity).toBe(1);
    });

    it('should increment quantity if same product is added twice', () => {
        let state = cartReducer(initialState as any, addToCart(mockProduct));
        state = cartReducer(state, addToCart(mockProduct));
        expect(state.items).toHaveLength(1);
        expect(state.items[0].quantity).toBe(2);
    });

    it('should handle removing a product', () => {
        const stateWithItem = {
            ...initialState,
            items: [{ ...mockProduct, quantity: 1 }]
        };
        const nextState = cartReducer(stateWithItem as any, removeFromCart('1'));
        expect(nextState.items).toHaveLength(0);
    });

    it('should update item quantity', () => {
        const stateWithItem = {
            ...initialState,
            items: [{ ...mockProduct, quantity: 1 }]
        };
        const nextState = cartReducer(stateWithItem as any, updateQuantity({ id: '1', quantity: 5 }));
        expect(nextState.items[0].quantity).toBe(5);
    });

    it('should clear the cart', () => {
        const stateWithItem = {
            ...initialState,
            items: [{ ...mockProduct, quantity: 1 }]
        };
        const nextState = cartReducer(stateWithItem as any, clearCart());
        expect(nextState.items).toHaveLength(0);
    });
});

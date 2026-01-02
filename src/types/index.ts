export interface Product {
    id: string;
    title: string;
    price: number;
    description: string;
    category: string;
    image: string;
    rating: {
        rate: number;
        count: number;
    };
    brand?: string;
    discountPercentage?: number;
}

export interface CartItem extends Product {
    quantity: number;
}

export interface Address {
    id: string;
    isDefault: boolean;
    name: string;
    street: string;
    city: string;
    state: string;
    zipCode: string;
    locality?: string;
    mobile: string;
    type: 'Home' | 'Work';
}

export interface UserProfile {
    uid: string;
    email: string | null;
    displayName: string | null;
    photoURL: string | null;
    emailVerified?: boolean;
    createdAt?: string;
    mobile?: string;
    gender?: string;
    dob?: string;
    location?: string;
    alternateMobile?: string;
    hintName?: string;
    addresses?: Address[];
}

export interface AuthState {
    user: UserProfile | null;
    loading: boolean;
    error: string | null;
}

export interface OrderItem extends CartItem { }

export interface Order {
    id: string;
    userId: string;
    userEmail?: string;
    items: OrderItem[];
    totalAmount: number;
    shippingAddress: Address;
    status: 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
    paymentMethod: 'card' | 'upi' | 'cod';
    paymentStatus: 'pending' | 'completed' | 'failed';
    createdAt: string;
}

export interface OrderState {
    orders: Order[];
    loading: boolean;
    error: string | null;
}
export interface Review {
    id: string;
    productId: string;
    userId: string;
    userName: string;
    userPhoto?: string;
    rating: number;
    comment: string;
    images?: string[];
    createdAt: string;
}

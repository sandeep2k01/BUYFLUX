# Implementation Plan - Modern E-Commerce Upgrade

This plan outlines the steps to upgrade the application with UX "Wow" factors, an Admin Panel, and real backend integration.

## Phase 1: UX "Wow" Factors
- [ ] **Toast Notifications**: Replace standard alerts with `sonner` for beautiful toast notifications.
    - [ ] Install `sonner`.
    - [ ] Add `<Toaster />` to `App.tsx`.
    - [ ] Integrate into `cartSlice`/`components` (e.g., "Added to bag").
- [ ] **Skeleton Loading**: create a shimmer loading effect for products.
    - [ ] Create `components/ui/Skeleton.tsx`.
    - [ ] Use in `ProductListingPage` while `loading` is true.

## Phase 2: Admin Panel & Product Management
- [ ] **Admin Dashboard Integration**:
    - [ ] Create `pages/admin/AdminDashboard.tsx` layout.
    - [ ] Create `pages/admin/AddProductPage.tsx` with image upload.
    - [ ] Use `productService.addProduct` to upload to Firebase.
- [ ] **Route Configuration**:
    - [ ] Add `/admin` and `/admin/add-product` routes in `App.tsx`.

## Phase 3: Hybrid Product Backend
- [ ] **Update Product Slice**:
    - [ ] Modify `fetchProducts` in `productSlice.ts` to fetch from **BOTH** `dummyjson` and Firebase (`productService.getProducts`).
    - [ ] Merge the arrays so user-added products appear alongside API products.

## Phase 4: Additional Authenticity (Reviews & Wishlist)
- [ ] **Wishlist System**:
    - [ ] Ensure `WishlistPage` is fully functional with Redux.
    - [ ] Add "Heart" icon toggle to Product Cards.

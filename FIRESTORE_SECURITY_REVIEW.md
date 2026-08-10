# Firestore access review

## Collections used by the app

- `products`: public storefront reads of active products; admin creates, updates, and deletes.
- `sectionBanners`: public storefront reads; admin updates.
- `siteContent/homePopup`: one public home-page promotion; admin creates, replaces, or removes it.
- `users`: private profile, saved addresses, cart and order summaries; each user reads and updates only their own document.
- `orders`: contains delivery and payment data; only the order owner and the designated admin may read it. The current checkout sends guest orders, so guest checkout must be changed to require sign-in before these rules are deployed.

## Query compatibility

- Public product requests filter `active == true`, which is permitted by the product read rule.
- Admin product requests may list all products.
- Storefront sections (men / women / accessories) load active products with an
  `active == true` query, then filter by section/gender in the client. Do not use
  an unfiltered `getDocs(products)` for guests — security rules reject it, and
  that previously made accessories appear only for the admin account.
- An authenticated user can query only their own orders with `where("userId", "==", uid)`.

## Security review / attack checks

- Public reads cannot list inactive products; admin reads are token-email based.
- Product and banner writes require the fixed Firebase Auth email and are schema checked on both create and update.
- A user document cannot be created with an admin role, and non-admin owners cannot change the `uid`, `email`, `role`, or creation timestamp.
- Orders cannot be read by another customer and cannot be updated by customers after creation.
- Storage uploads and deletes are admin-only and restricted to image MIME types under the expected folders.
- The public popup document only contains a bounded image URL and Storage path; it carries no customer data.

## Important limitation

Firestore Security Rules cannot iterate through arbitrary nested list/map values. The rules bound all list sizes and validate the surrounding schema, but do not fully validate every nested product image/color or saved-address map. Before a high-volume launch, move sensitive order creation/payment verification to a Cloud Function and add backend validation.

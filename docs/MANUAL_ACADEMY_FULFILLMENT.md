# Manual Academy Order Fulfillment (Fallback)

Use this process when the webhook or automated email fails, or for orders that predate automation. Normal flow is: Stripe webhook creates `AcademyPurchase` and triggers the confirmation email; the customer opens **My Library** and downloads the PDF. If that did not happen, fulfill manually as below.

## Step 1: Check Stripe Dashboard

1. Go to [dashboard.stripe.com](https://dashboard.stripe.com) → **Payments**.
2. Find the successful payment for the Academy product.
3. Note the **customer email** and **metadata** (product slug is in `metadata.productId` or similar).

## Step 2: Send PDF via Email

1. Open your email client.
2. Compose a new email to the customer.
3. **Subject:** `Your Bornfidis Academy Manual — [Product Title]`
4. **Body (example):**

   ```
   Hi [Customer Name],

   Thank you for purchasing [Product Name] from Bornfidis Academy.

   Your manual is attached to this email as a PDF. You have lifetime access and will receive free updates.

   You can also sign in at platform.bornfidis.com and go to My Library to download it anytime.

   If you have any questions or need support, reply to this email or contact support@bornfidis.com.

   Blessings,
   [Your name]
   Bornfidis Provisions
   ```

5. Attach the correct PDF from `storage/academy-products/` (see that folder’s README for filenames).
6. Send.

## Step 3: (Optional) Record fulfillment

- In Stripe, add a note to the payment: e.g. `PDF delivered via email on [date]`.
- Optionally keep a spreadsheet of orders and fulfillment status.

## When automation is in place

The app already creates an `AcademyPurchase` record and sends a confirmation email via the Academy webhook. Manual fulfillment is only for edge cases (e.g. webhook down, customer did not receive email, or pre-launch orders).

# Requirements Document

## Introduction

This feature integrates Khalti's web payment gateway into the vehicle rental booking flow. Currently, when a user selects Khalti as their payment method and submits the booking form, the booking is created with `status='pending'` and no actual payment is processed. This feature changes that flow so that:

1. The booking record is created in a new `payment_pending` state.
2. The user is redirected to Khalti's hosted checkout page (which includes a QR code option) for the exact booking total.
3. Khalti redirects the user back to the application after payment.
4. The backend verifies the payment with Khalti's Lookup API before marking the booking as `pending` (awaiting admin confirmation).
5. If payment fails or is cancelled, the booking is cleaned up and the user is informed.

The integration uses Khalti's standard Web Checkout (v2) API, which handles QR generation, card, and wallet payments within Khalti's hosted page.

---

## Glossary

- **Booking_Form**: The React page at `src/pages/Booking.jsx` where users fill in trip details and select a payment method.
- **Booking_Service**: The frontend service at `src/services/bookingService.js` that makes API calls to the backend.
- **Bookings_API**: The PHP endpoint at `backend/user/bookings.php` that creates and manages booking records.
- **Khalti_Initiation_API**: The new PHP endpoint at `backend/payment/khalti_initiate.php` that calls Khalti's `/epayment/initiate/` endpoint and returns a `payment_url`.
- **Khalti_Verification_API**: The new PHP endpoint at `backend/payment/khalti_verify.php` that calls Khalti's `/epayment/lookup/` endpoint to confirm payment status.
- **Khalti_Gateway**: Khalti's external hosted checkout service at `https://a.khalti.com` (production) or `https://dev.khalti.com` (sandbox).
- **Payment_Callback_Page**: The React page (or route) that Khalti redirects the user back to after payment, responsible for triggering server-side verification.
- **pidx**: The unique payment identifier returned by Khalti's initiation endpoint, used to look up and verify a payment.
- **purchase_order_id**: The application's booking ID, passed to Khalti as a reference to correlate payments with bookings.
- **payment_pending**: A new booking status indicating the booking record exists but payment has not yet been verified.

---

## Requirements

### Requirement 1: Conditional Khalti Payment Initiation

**User Story:** As a user, I want the booking process to automatically start a Khalti payment when I select Khalti and confirm my booking, so that I can pay the exact booking total without manually entering an amount.

#### Acceptance Criteria

1. WHEN a user submits the booking form with `payment_method = 'khalti'`, THE Booking_Form SHALL call the Bookings_API to create a booking record before initiating payment.
2. WHEN a user submits the booking form with `payment_method = 'esewa'` or any non-Khalti method, THE Booking_Form SHALL follow the existing confirmation flow without triggering Khalti payment.
3. WHEN the Bookings_API creates a booking for a Khalti payment, THE Bookings_API SHALL set the booking `status` to `'payment_pending'`.
4. WHEN a booking with `status = 'payment_pending'` is created, THE Booking_Form SHALL immediately call the Khalti_Initiation_API with the `booking_id` and `total_price`.
5. WHEN the Khalti_Initiation_API returns a `payment_url`, THE Booking_Form SHALL redirect the browser to that `payment_url` within 2 seconds.
6. IF the Bookings_API returns an error during booking creation, THEN THE Booking_Form SHALL display the error message and SHALL NOT proceed to payment initiation.

---

### Requirement 2: Khalti Payment Initiation Backend

**User Story:** As a developer, I want a backend endpoint that initiates a Khalti payment session for a given booking, so that the frontend can redirect the user to Khalti's hosted checkout.

#### Acceptance Criteria

1. THE Khalti_Initiation_API SHALL accept a POST request containing `booking_id` and `amount` (in NPR).
2. WHEN a valid request is received, THE Khalti_Initiation_API SHALL call the Khalti_Gateway initiation endpoint with `amount` converted to paisa (NPR × 100), `purchase_order_id` set to the `booking_id`, `purchase_order_name` set to a human-readable booking description, and a `return_url` pointing to the Payment_Callback_Page.
3. WHEN the Khalti_Gateway returns a successful response, THE Khalti_Initiation_API SHALL return a JSON response containing the `pidx` and `payment_url`.
4. THE Khalti_Initiation_API SHALL store the `pidx` against the `booking_id` in the database so it can be used for verification.
5. IF the Khalti_Gateway returns an error, THEN THE Khalti_Initiation_API SHALL return a JSON error response with HTTP status 502 and a descriptive `message`.
6. IF the `booking_id` does not exist or does not have `status = 'payment_pending'`, THEN THE Khalti_Initiation_API SHALL return a JSON error response with HTTP status 400.
7. THE Khalti_Initiation_API SHALL read the Khalti secret key from a server-side configuration file and SHALL NOT expose the key in any response.

---

### Requirement 3: Payment Callback Handling

**User Story:** As a user, I want to be automatically returned to the application after completing or cancelling payment on Khalti, so that my booking status is updated without manual action.

#### Acceptance Criteria

1. WHEN the Khalti_Gateway redirects the user back to the application, THE Payment_Callback_Page SHALL extract the `pidx`, `status`, and `purchase_order_id` query parameters from the URL.
2. WHEN the `status` parameter is `'Completed'`, THE Payment_Callback_Page SHALL call the Khalti_Verification_API with the extracted `pidx`.
3. WHEN the `status` parameter is `'User canceled'` or any non-`'Completed'` value, THE Payment_Callback_Page SHALL display a payment cancellation message and SHALL provide a button to return to the booking form.
4. WHILE the Khalti_Verification_API call is in progress, THE Payment_Callback_Page SHALL display a loading indicator to the user.
5. IF the `pidx` or `purchase_order_id` parameters are missing from the callback URL, THEN THE Payment_Callback_Page SHALL display an error message and SHALL provide a link to `/my-bookings`.

---

### Requirement 4: Server-Side Payment Verification

**User Story:** As a system operator, I want all Khalti payments to be verified server-side before a booking is confirmed, so that no booking is marked as paid based solely on client-side data.

#### Acceptance Criteria

1. THE Khalti_Verification_API SHALL accept a POST request containing `pidx`.
2. WHEN a valid `pidx` is received, THE Khalti_Verification_API SHALL call the Khalti_Gateway lookup endpoint with the `pidx` to retrieve the authoritative payment status.
3. WHEN the Khalti_Gateway lookup returns `status = 'Completed'` and the `purchase_order_id` matches an existing booking with `status = 'payment_pending'`, THE Khalti_Verification_API SHALL update the booking `status` to `'pending'` and SHALL record the `pidx` and `transaction_id` against the booking.
4. WHEN verification succeeds, THE Khalti_Verification_API SHALL return a JSON response containing `success: true`, `booking_id`, and `message`.
5. IF the Khalti_Gateway lookup returns any status other than `'Completed'`, THEN THE Khalti_Verification_API SHALL return a JSON error response with `success: false` and SHALL NOT update the booking status.
6. IF the `pidx` does not match any booking in the database, THEN THE Khalti_Verification_API SHALL return a JSON error response with HTTP status 404.
7. THE Khalti_Verification_API SHALL be idempotent: calling it multiple times with the same `pidx` for an already-verified booking SHALL return `success: true` without duplicating database updates.

---

### Requirement 5: Post-Verification User Redirect

**User Story:** As a user, I want to be redirected to a success page after my payment is verified, so that I know my booking is confirmed and can view my booking details.

#### Acceptance Criteria

1. WHEN the Khalti_Verification_API returns `success: true`, THE Payment_Callback_Page SHALL redirect the user to `/my-bookings` with a success query parameter.
2. WHEN the user arrives at `/my-bookings` with a success query parameter, THE My_Bookings_Page SHALL display a success notification showing the booking reference number.
3. IF the Khalti_Verification_API returns `success: false`, THEN THE Payment_Callback_Page SHALL display a payment failure message including the reason returned by the API.
4. IF the Khalti_Verification_API returns `success: false`, THEN THE Payment_Callback_Page SHALL provide a button that navigates the user back to the booking form for the same vehicle.

---

### Requirement 6: Failed or Cancelled Payment Cleanup

**User Story:** As a system operator, I want bookings that were never paid to be cleaned up, so that unpaid `payment_pending` bookings do not accumulate or block vehicle availability.

#### Acceptance Criteria

1. WHEN a user cancels payment on the Khalti_Gateway and is redirected back, THE Payment_Callback_Page SHALL call the Bookings_API to cancel the `payment_pending` booking.
2. WHEN the Bookings_API receives a cancel request for a booking with `status = 'payment_pending'`, THE Bookings_API SHALL update the booking `status` to `'cancelled'`.
3. IF the Khalti_Verification_API determines payment was not completed, THEN THE Khalti_Verification_API SHALL update the booking `status` to `'cancelled'`.
4. THE Bookings_API SHALL allow cancellation of `payment_pending` bookings in addition to the existing cancellable statuses.

---

### Requirement 7: Database Schema Extension

**User Story:** As a developer, I want the database to store Khalti payment identifiers alongside bookings, so that payments can be traced, verified, and audited.

#### Acceptance Criteria

1. THE Database SHALL be extended to add `payment_pending` as a valid value in the `bookings.status` ENUM, alongside the existing values.
2. THE Database SHALL store a `khalti_pidx` column (VARCHAR, nullable) on the `bookings` table to hold the Khalti payment identifier.
3. THE Database SHALL store a `khalti_transaction_id` column (VARCHAR, nullable) on the `bookings` table to hold the Khalti transaction ID returned after successful verification.
4. WHEN a `khalti_pidx` is stored, THE Database SHALL enforce uniqueness on the `khalti_pidx` column to prevent duplicate payment records.

---

### Requirement 8: Security and Configuration

**User Story:** As a system operator, I want Khalti API credentials to be stored securely and all payment amounts to be validated server-side, so that the payment flow cannot be tampered with by a malicious client.

#### Acceptance Criteria

1. THE Khalti_Initiation_API SHALL validate that the `amount` in the request matches the `total_price` stored in the database for the given `booking_id`, and SHALL use the database value when calling the Khalti_Gateway.
2. THE Khalti_Initiation_API SHALL read the Khalti secret key exclusively from a PHP configuration file that is excluded from version control.
3. IF a request to the Khalti_Initiation_API or Khalti_Verification_API is made for a booking that does not belong to the authenticated user, THEN THE API SHALL return HTTP status 403.
4. THE Khalti_Verification_API SHALL verify the `amount` returned by the Khalti_Gateway lookup matches the `total_price` stored in the database before marking the booking as verified.

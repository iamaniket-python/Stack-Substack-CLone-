import LegalLayout from './LegalLayout';
import {
  BUSINESS_NAME,
  SUPPORT_EMAIL,
  REFUND_REQUEST_WINDOW_DAYS,
} from '../../config/legal';

const RefundPolicy = () => {
  return (
    <LegalLayout title="Refund & Cancellation Policy">
      <p>
        {BUSINESS_NAME} sells access to digital content. Because access is
        delivered instantly, payments are generally non-refundable, except in
        the cases below.
      </p>

      <h2>1. When we refund</h2>
      <ul>
        <li>You were charged more than once for the same purchase.</li>
        <li>
          Money was debited from your account but your subscription was not
          activated.
        </li>
      </ul>

      <h2>2. When we do not refund</h2>
      <ul>
        <li>You changed your mind after access was granted.</li>
        <li>You did not use, or no longer need, the subscription.</li>
        <li>Your account was suspended for violating our Terms.</li>
      </ul>

      <h2>3. How to request a refund</h2>
      <p>
        Email <a href={`mailto:${SUPPORT_EMAIL}`}>{SUPPORT_EMAIL}</a> within{' '}
        {REFUND_REQUEST_WINDOW_DAYS} days of the payment. Include your
        registered email and the Razorpay payment ID. We will review your
        request and reply as soon as possible.
      </p>

      <h2>4. Refund timeline</h2>
      <p>
        Approved refunds are sent to your original payment method. It usually
        takes 5 to 7 business days to reflect, depending on your bank.
      </p>

      <h2>5. Cancellation</h2>
      <p>
        Current subscriptions are one-time payments and do not renew
        automatically, so there is nothing to cancel. Your access continues
        until the end of the period you paid for.
      </p>

      <h2>6. Contact</h2>
      <p>
        <a href={`mailto:${SUPPORT_EMAIL}`}>{SUPPORT_EMAIL}</a>
      </p>
    </LegalLayout>
  );
};

export default RefundPolicy;
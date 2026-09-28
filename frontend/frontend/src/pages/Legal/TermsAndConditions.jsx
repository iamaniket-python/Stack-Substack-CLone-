import LegalLayout from './LegalLayout';
import { BUSINESS_NAME, SUPPORT_EMAIL } from '../../config/legal';

const TermsAndConditions = () => {
  return (
    <LegalLayout title="Terms & Conditions">
      <p>
        These Terms govern your use of {BUSINESS_NAME}. By creating an account or
        using the service, you agree to them.
      </p>

      <h2>1. Your account</h2>
      <ul>
        <li>You must provide accurate information and be at least 18 years old.</li>
        <li>You are responsible for keeping your password secure.</li>
        <li>You are responsible for all activity under your account.</li>
      </ul>

      <h2>2. Your content</h2>
      <ul>
        <li>You own the content you publish.</li>
        <li>
          You give {BUSINESS_NAME} a non-exclusive licence to host, display and
          distribute your content on the platform so the service can work.
        </li>
        <li>You are responsible for your content and for having the right to post it.</li>
      </ul>

      <h2>3. Acceptable use</h2>
      <p>You agree not to:</p>
      <ul>
        <li>Post illegal, hateful, harassing or infringing content.</li>
        <li>Spam, scrape or attempt to disrupt or break into the service.</li>
        <li>Impersonate others or misuse other users&apos; information.</li>
      </ul>
      <p>
        We may remove content or suspend accounts that violate these Terms.
      </p>

      <h2>4. Paid subscriptions</h2>
      <ul>
        <li>Prices are shown in Indian Rupees (INR) at checkout.</li>
        <li>Payments are processed securely by Razorpay.</li>
        <li>
          A paid subscription gives access to paid content for the period shown
          at checkout. Refunds are covered in our Refund &amp; Cancellation
          Policy.
        </li>
      </ul>

      <h2>5. Termination</h2>
      <p>
        You may stop using {BUSINESS_NAME} at any time. We may suspend or
        terminate accounts that breach these Terms.
      </p>

      <h2>6. Disclaimer</h2>
      <p>
        The service is provided &quot;as is&quot; without warranties of any
        kind. We do not guarantee it will always be uninterrupted or error-free.
      </p>

      <h2>7. Limitation of liability</h2>
      <p>
        To the extent permitted by law, {BUSINESS_NAME} is not liable for
        indirect or consequential losses arising from your use of the service.
      </p>

      <h2>8. Governing law</h2>
      <p>These Terms are governed by the laws of India.</p>

      <h2>9. Changes</h2>
      <p>
        We may update these Terms. Continued use after changes means you accept
        the updated Terms.
      </p>

      <h2>10. Contact</h2>
      <p>
        <a href={`mailto:${SUPPORT_EMAIL}`}>{SUPPORT_EMAIL}</a>
      </p>
    </LegalLayout>
  );
};

export default TermsAndConditions;
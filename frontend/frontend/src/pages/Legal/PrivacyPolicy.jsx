import LegalLayout from './LegalLayout';
import { BUSINESS_NAME, SUPPORT_EMAIL } from '../../config/legal';

const PrivacyPolicy = () => {
  return (
    <LegalLayout title="Privacy Policy">
      <p>
        This Privacy Policy explains what information {BUSINESS_NAME} collects,
        how we use it, and the choices you have. By using {BUSINESS_NAME} you
        agree to this policy.
      </p>

      <h2>1. Information we collect</h2>
      <ul>
        <li>
          <strong>Account details:</strong> your name, email address and
          password. Passwords are stored only as a one-way hash, never in plain
          text.
        </li>
        <li>
          <strong>Profile details:</strong> avatar, bio and other information
          you choose to add.
        </li>
        <li>
          <strong>Content you create:</strong> posts, comments, likes, stories
          and messages, along with images you upload.
        </li>
        <li>
          <strong>Payment information:</strong> payments are processed by
          Razorpay. We do not see or store your card, UPI or bank details. We
          keep only order and payment IDs, amount and status.
        </li>
        <li>
          <strong>Technical data:</strong> IP address and basic request logs,
          used for security, abuse prevention and rate limiting.
        </li>
      </ul>

      <h2>2. How we use your information</h2>
      <ul>
        <li>To create and secure your account and keep you logged in.</li>
        <li>To publish your content and show it to other users.</li>
        <li>To process subscriptions and payments.</li>
        <li>To send notifications and messages you ask for.</li>
        <li>To detect abuse, fix bugs and improve the service.</li>
      </ul>

      <h2>3. Cookies and local storage</h2>
      <ul>
        <li>
          We use one strictly necessary cookie to keep you signed in. It is
          httpOnly and secure, and it is not used for tracking or advertising.
        </li>
        <li>
          Your browser local storage may hold small conveniences such as recent
          search history. It stays on your device.
        </li>
        <li>We do not use advertising cookies.</li>
      </ul>

      <h2>4. Third-party services</h2>
      <p>
        We rely on trusted providers to run {BUSINESS_NAME}: Razorpay
        (payments), Cloudinary (image storage), Neon (database), Render and
        Vercel (hosting), and an email delivery provider when we send you
        emails. They process data only to provide their service to us.
      </p>

      <h2>5. Sharing of information</h2>
      <p>
        We do not sell your personal information. Posts, comments and profile
        details you make public are visible to others. We may disclose
        information if required by law or to protect our users and service.
      </p>

      <h2>6. Data retention and deletion</h2>
      <p>
        We keep your information while your account is active. You can ask us to
        delete your account and associated data by emailing us. Some records
        (for example payment records) may be retained as required by law.
      </p>

      <h2>7. Security</h2>
      <p>
        We use HTTPS, hashed passwords, httpOnly cookies and rate limiting to
        protect your data. No system is perfectly secure, so we cannot guarantee
        absolute security.
      </p>

      <h2>8. Your choices</h2>
      <p>
        You can access, correct or delete your information, or withdraw
        consent, by contacting us at the email below.
      </p>

      <h2>9. Children</h2>
      <p>
        {BUSINESS_NAME} is not intended for children under 18. If you believe a
        child has given us personal information, please contact us and we will
        remove it.
      </p>

      <h2>10. Changes to this policy</h2>
      <p>
        We may update this policy from time to time. The date at the top shows
        when it was last changed.
      </p>

      <h2>11. Contact</h2>
      <p>
        Questions or requests: <a href={`mailto:${SUPPORT_EMAIL}`}>{SUPPORT_EMAIL}</a>
      </p>
    </LegalLayout>
  );
};

export default PrivacyPolicy;
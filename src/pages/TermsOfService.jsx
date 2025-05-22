import React from 'react';

const TermsOfService = () => {
  return (
    <div className="terms-of-service-page">
      <div className="container">
        <div className="page-header">
          <h1>Terms of Service</h1>
          <p>Last updated: {new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}</p>
        </div>

        <div className="policy-content">
          <section>
            <h2>1. Agreement to Terms</h2>
            <p>
              By accessing or using MediConnect, you agree to be bound by these Terms of Service and all applicable laws and regulations. If you do not agree with any of these terms, you are prohibited from using or accessing this service.
            </p>
          </section>

          <section>
            <h2>2. Description of Service</h2>
            <p>
              MediConnect is a healthcare platform that connects patients with healthcare providers, facilitates appointment scheduling, and provides secure communication channels for healthcare-related services.
            </p>
            <p>
              The service includes features for appointment management, medical record access, secure messaging, and other healthcare coordination tools. We reserve the right to modify, suspend, or discontinue any aspect of the service at any time.
            </p>
          </section>

          <section>
            <h2>3. User Accounts</h2>
            <p>
              To access certain features of our service, you must register for an account. You are responsible for maintaining the confidentiality of your account information and for all activities that occur under your account.
            </p>
            <p>
              You agree to:
            </p>
            <ul>
              <li>Provide accurate, current, and complete information during registration</li>
              <li>Maintain and promptly update your account information</li>
              <li>Keep your password secure and confidential</li>
              <li>Notify us immediately of any unauthorized use of your account</li>
              <li>Be responsible for all activities that occur under your account</li>
            </ul>
          </section>

          <section>
            <h2>4. Medical Disclaimer</h2>
            <p>
              MediConnect does not provide medical advice, diagnosis, or treatment. The content available through our service is for informational purposes only and is not a substitute for professional medical advice, diagnosis, or treatment.
            </p>
            <p>
              Always seek the advice of your physician or other qualified healthcare provider with any questions you may have regarding a medical condition. Never disregard professional medical advice or delay seeking it because of information you have obtained through our service.
            </p>
          </section>

          <section>
            <h2>5. User Conduct</h2>
            <p>
              When using our service, you agree not to:
            </p>
            <ul>
              <li>Violate any applicable laws or regulations</li>
              <li>Infringe on the rights of others</li>
              <li>Submit false or misleading information</li>
              <li>Impersonate any person or entity</li>
              <li>Interfere with or disrupt the service or servers</li>
              <li>Attempt to gain unauthorized access to any part of the service</li>
              <li>Use the service for any illegal or unauthorized purpose</li>
              <li>Harass, abuse, or harm another person</li>
              <li>Distribute spam, chain letters, or other unsolicited communications</li>
              <li>Distribute viruses or other malicious code</li>
            </ul>
          </section>

          <section>
            <h2>6. Intellectual Property</h2>
            <p>
              The service and its original content, features, and functionality are owned by MediConnect and are protected by international copyright, trademark, patent, trade secret, and other intellectual property laws.
            </p>
            <p>
              You may not reproduce, distribute, modify, create derivative works of, publicly display, publicly perform, republish, download, store, or transmit any of the material on our service without our prior written consent.
            </p>
          </section>

          <section>
            <h2>7. Privacy</h2>
            <p>
              Your use of our service is also governed by our Privacy Policy, which is incorporated into these Terms by reference. Please review our Privacy Policy to understand how we collect, use, and protect your information.
            </p>
          </section>

          <section>
            <h2>8. Limitation of Liability</h2>
            <p>
              In no event shall MediConnect, its directors, employees, partners, agents, suppliers, or affiliates be liable for any indirect, incidental, special, consequential, or punitive damages, including without limitation, loss of profits, data, use, goodwill, or other intangible losses, resulting from:
            </p>
            <ul>
              <li>Your access to or use of or inability to access or use the service</li>
              <li>Any conduct or content of any third party on the service</li>
              <li>Any content obtained from the service</li>
              <li>Unauthorized access, use, or alteration of your transmissions or content</li>
            </ul>
          </section>

          <section>
            <h2>9. Termination</h2>
            <p>
              We may terminate or suspend your account and bar access to the service immediately, without prior notice or liability, under our sole discretion, for any reason whatsoever and without limitation, including but not limited to a breach of the Terms.
            </p>
            <p>
              If you wish to terminate your account, you may simply discontinue using the service or contact us to request account deletion.
            </p>
          </section>

          <section>
            <h2>10. Changes to Terms</h2>
            <p>
              We reserve the right to modify or replace these Terms at any time. If a revision is material, we will provide at least 30 days' notice prior to any new terms taking effect. What constitutes a material change will be determined at our sole discretion.
            </p>
            <p>
              By continuing to access or use our service after any revisions become effective, you agree to be bound by the revised terms. If you do not agree to the new terms, you are no longer authorized to use the service.
            </p>
          </section>

          <section>
            <h2>11. Governing Law</h2>
            <p>
              These Terms shall be governed and construed in accordance with the laws of the jurisdiction where MediConnect is established, without regard to its conflict of law provisions.
            </p>
            <p>
              Our failure to enforce any right or provision of these Terms will not be considered a waiver of those rights. If any provision of these Terms is held to be invalid or unenforceable by a court, the remaining provisions of these Terms will remain in effect.
            </p>
          </section>

          <section>
            <h2>12. Contact Information</h2>
            <p>
              If you have any questions about these Terms, please contact us:
            </p>
            <p>
              <strong>Email:</strong> terms@mediconnect.com<br />
              <strong>Address:</strong> 123 Healthcare Ave, Medical District, City, 12345<br />
              <strong>Phone:</strong> +1 (555) 123-4567
            </p>
          </section>
        </div>
      </div>
    </div>
  );
};

export default TermsOfService; 
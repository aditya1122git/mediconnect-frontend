import React from 'react';

const PrivacyPolicy = () => {
  return (
    <div className="privacy-policy-page">
      <div className="container">
        <div className="page-header">
          <h1>Privacy Policy</h1>
          <p>Last updated: {new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}</p>
        </div>

        <div className="policy-content">
          <section>
            <h2>1. Introduction</h2>
            <p>
              At MediConnect, we respect your privacy and are committed to protecting your personal data. This Privacy Policy will inform you about how we look after your personal data when you visit our website and use our services and tell you about your privacy rights and how the law protects you.
            </p>
            <p>
              We ask that you read this Privacy Policy carefully as it contains important information about who we are, how and why we collect, store, use and share personal information, your rights in relation to your personal information, and how to contact us.
            </p>
          </section>

          <section>
            <h2>2. Data We Collect</h2>
            <p>We may collect, use, store and transfer different kinds of personal data about you including:</p>
            <ul>
              <li><strong>Identity Data</strong> - includes first name, last name, username or similar identifier, date of birth, and gender.</li>
              <li><strong>Contact Data</strong> - includes billing address, delivery address, email address, and telephone numbers.</li>
              <li><strong>Health Data</strong> - includes medical records, health measurements, diagnoses, treatment plans, and other health-related information you provide.</li>
              <li><strong>Technical Data</strong> - includes internet protocol (IP) address, your login data, browser type and version, time zone setting and location, browser plug-in types and versions, operating system and platform, and other technology on the devices you use to access our services.</li>
              <li><strong>Usage Data</strong> - includes information about how you use our website and services.</li>
            </ul>
          </section>

          <section>
            <h2>3. How We Use Your Data</h2>
            <p>We will only use your personal data when the law allows us to. Most commonly, we will use your personal data in the following circumstances:</p>
            <ul>
              <li>To register you as a new user.</li>
              <li>To provide healthcare services to you.</li>
              <li>To facilitate communication between you and healthcare providers.</li>
              <li>To manage appointments and health records.</li>
              <li>To improve our services and develop new features.</li>
              <li>To provide customer support and respond to your inquiries.</li>
              <li>To notify you about changes to our services.</li>
              <li>To comply with legal and regulatory obligations.</li>
            </ul>
          </section>

          <section>
            <h2>4. Data Security</h2>
            <p>
              We have implemented appropriate security measures to prevent your personal data from being accidentally lost, used, or accessed in an unauthorized way, altered, or disclosed. We limit access to your personal data to those employees, agents, contractors, and other third parties who have a business need to know.
            </p>
            <p>
              We have procedures in place to deal with any suspected personal data breach and will notify you and any applicable regulator of a breach where we are legally required to do so.
            </p>
          </section>

          <section>
            <h2>5. Data Retention</h2>
            <p>
              We will only retain your personal data for as long as necessary to fulfill the purposes we collected it for, including for the purposes of satisfying any legal, accounting, or reporting requirements.
            </p>
            <p>
              Health records are subject to specific regulatory retention periods, which may vary by jurisdiction. We follow applicable laws and regulations regarding the retention of healthcare data.
            </p>
          </section>

          <section>
            <h2>6. Your Legal Rights</h2>
            <p>
              Under certain circumstances, you have rights under data protection laws in relation to your personal data, including:
            </p>
            <ul>
              <li>The right to request access to your personal data.</li>
              <li>The right to request correction of your personal data.</li>
              <li>The right to request erasure of your personal data.</li>
              <li>The right to object to processing of your personal data.</li>
              <li>The right to request restriction of processing your personal data.</li>
              <li>The right to request the transfer of your personal data.</li>
              <li>The right to withdraw consent.</li>
            </ul>
            <p>
              If you wish to exercise any of these rights, please contact us using the details provided below.
            </p>
          </section>

          <section>
            <h2>7. Third-Party Links</h2>
            <p>
              Our website and services may include links to third-party websites, plug-ins, and applications. Clicking on those links or enabling those connections may allow third parties to collect or share data about you. We do not control these third-party websites and are not responsible for their privacy statements.
            </p>
          </section>

          <section>
            <h2>8. Changes to This Privacy Policy</h2>
            <p>
              We may update this Privacy Policy from time to time. We will notify you of any changes by posting the new Privacy Policy on this page and updating the "last updated" date at the top of this Privacy Policy.
            </p>
            <p>
              You are advised to review this Privacy Policy periodically for any changes. Changes to this Privacy Policy are effective when they are posted on this page.
            </p>
          </section>

          <section>
            <h2>9. Contact Us</h2>
            <p>
              If you have any questions about this Privacy Policy or our privacy practices, please contact our Data Privacy Officer:
            </p>
            <p>
              <strong>Email:</strong> privacy@mediconnect.com<br />
              <strong>Address:</strong> 123 Healthcare Ave, Medical District, City, 12345<br />
              <strong>Phone:</strong> +1 (555) 123-4567
            </p>
          </section>
        </div>
      </div>
    </div>
  );
};

export default PrivacyPolicy; 
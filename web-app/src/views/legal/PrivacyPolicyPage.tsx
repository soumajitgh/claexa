import React from 'react';
import {Separator} from '@/components/ui/separator';

const PrivacyPolicyPage: React.FC = () => (
  <div>
    <h1 className="text-3xl font-bold mb-6 text-gray-800">Privacy Policy</h1>
    <p className="mb-4 text-gray-600"><strong>Effective Date:</strong> May 31, 2025</p>

    <Separator className={"my-6"}/>

      <p className="mb-4 text-gray-700">Claexa AI ("we," "our," or "us") operates the Claexa AI web application, a
        platform of AI tools designed for students and educators. This Privacy Policy describes how we collect, use, and
        share your personal information when you use our services.</p>
      <p className="mb-6 text-gray-700">Your privacy is important to us. By accessing or using Claexa AI, you agree to
        the terms of this Privacy Policy.</p>

      <section className="mb-8">
        <h2 className="text-2xl font-semibold mb-4 text-gray-800">1. Information We Collect</h2>
        <p className="mb-4 text-gray-700">We collect various types of information to provide and improve our services to
          you.</p>

        <h3 className="text-xl font-semibold mb-3 text-gray-700">1.1. Information You Provide Directly</h3>
        <p className="mb-2 text-gray-700">When you sign up for or use Claexa AI, we collect information that you provide
          or that is provided to us via third-party services:</p>
        <ul className="list-disc list-inside mb-4 pl-4 text-gray-700 space-y-1">
          <li>
            <strong>Google Sign-In Data:</strong> When you sign in using Google, we access and store basic information
            from your Google profile, including:
            <ul className="list-circle list-inside ml-6 mt-2 pl-4 space-y-1">
              <li>Your Name (First and Last)</li>
              <li>Your Email Address</li>
              <li>Your Google User ID</li>
              <li>Your Profile Picture URL (if you choose to display it)</li>
            </ul>
          </li>
          <li className="mt-2">We do not access or store your phone number from your Google profile.</li>
        </ul>

        <h3 className="text-xl font-semibold mb-3 text-gray-700">1.2. User-Generated Content and Uploaded Media</h3>
        <p className="mb-2 text-gray-700">We collect content that you create, input, or upload when using our AI
          tools:</p>
        <ul className="list-disc list-inside mb-4 pl-4 text-gray-700 space-y-1">
          <li><strong>Text Inputs:</strong> This includes any text-based queries, prompts, essays, research outlines,
            creative writing pieces, code snippets, or other educational content that you provide to our AI tools.
          </li>
          <li><strong>Uploaded Media:</strong> You may upload images and PDF files to Claexa AI. This uploaded media is
            stored on our servers.
          </li>
        </ul>

        <h3 className="text-xl font-semibold mb-3 text-gray-700">1.3. Usage Data</h3>
        <p className="mb-2 text-gray-700">We automatically collect certain information about your interaction with and
          use of Claexa AI ("Usage Data"). This includes:</p>
        <ul className="list-disc list-inside mb-4 pl-4 text-gray-700 space-y-1">
          <li><strong>Interaction Data:</strong> Information about how you use our platform, such as the specific AI
            tools and features you access and use, the frequency of your usage, and the number of AI requests or
            generations you make.
          </li>
          <li><strong>Technical Data:</strong> Your IP address, device type (e.g., desktop, mobile, tablet), browser
            type, operating system, and referring URLs (the website you came from).
          </li>
          <li><strong>Cookies and Tracking Technologies:</strong> We use cookies and similar tracking technologies to
            understand how you interact with our services, remember your preferences, and for analytical purposes.
          </li>
        </ul>

        <h3 className="text-xl font-semibold mb-3 text-gray-700">1.4. Payment Information</h3>
        <p className="mb-2 text-gray-700">If you subscribe to premium features or make purchases through Claexa AI:</p>
        <ul className="list-disc list-inside mb-4 pl-4 text-gray-700 space-y-1">
          <li><strong>Payment Processing:</strong> We use Cashfree Payments as our third-party payment processor. When
            you make a payment, your sensitive payment information (such as credit card numbers, expiry dates, or CVVs)
            is collected and processed directly by Cashfree Payments. Claexa AI does not store or directly handle any of
            your sensitive payment card information on its servers.
          </li>
        </ul>
      </section>

      <section className="mb-8">
        <h2 className="text-2xl font-semibold mb-4 text-gray-800">2. How We Use Your Information</h2>
        <p className="mb-4 text-gray-700">We use the information we collect for various purposes, primarily to provide,
          maintain, and improve Claexa AI, as well as for security and compliance.</p>
        <ul className="list-disc list-inside mb-4 pl-4 text-gray-700 space-y-2">
          <li><strong>To Provide and Maintain Our Services:</strong> We use your Google Sign-In data to create and
            manage your user account, enable your access to Claexa AI, and personalize your experience (e.g., by
            displaying your name). We use your user-generated content and uploaded media to deliver the core
            functionality of our AI tools, such as processing your text inputs, analyzing your uploaded images and PDFs,
            and generating AI responses or insights as per your requests.
          </li>
          <li><strong>To Improve and Personalize Services:</strong> We use Usage Data to understand how our platform is
            used, analyze user behavior, identify popular features, diagnose technical issues, and make improvements to
            Claexa AI's functionality and user experience. This helps us to enhance the relevance and quality of the AI
            tools for students and educators.
          </li>
          <li><strong>To Process Payments:</strong> Your payment information is used by Cashfree Payments to process
            your premium subscriptions or purchases securely.
          </li>
          <li><strong>For Security and Fraud Prevention:</strong> We use collected data, including IP addresses and
            usage patterns, to monitor for and prevent fraudulent activities, unauthorized access, and to protect the
            security and integrity of Claexa AI and its users.
          </li>
          <li><strong>For Legal Compliance:</strong> We may use your information to comply with applicable laws,
            regulations, legal processes, or governmental requests.
          </li>
        </ul>
      </section>

      <section className="mb-8">
        <h2 className="text-2xl font-semibold mb-4 text-gray-800">3. Compliance with Google API Services User Data Policy – Limited Use</h2>
        

        <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-md">
          <p className="text-sm font-semibold text-gray-800 mb-2">Affirmative Statement on Limited Use Compliance:</p>
          <p className="text-sm text-gray-700">
            <strong>Claexa AI's use and transfer to any other app of information received from Google APIs will adhere to the 
            <a 
              href="https://developers.google.com/workspace/workspace-api-user-data-developer-policy" 
              target="_blank" 
              rel="noopener noreferrer" 
              className="text-blue-600 hover:underline font-medium mx-1"
            >
              Workspace API User Data and Developer Policy
            </a>, including the 
            <a 
              href="https://developers.google.com/workspace/workspace-api-user-data-developer-policy#limited-use" 
              target="_blank" 
              rel="noopener noreferrer" 
              className="text-blue-600 hover:underline font-medium mx-1"
            >
              Limited Use requirements
            </a>, and the 
            <a 
              href="https://developers.google.com/photos/support/api-policy#limited_use_of_user_data" 
              target="_blank" 
              rel="noopener noreferrer" 
              className="text-blue-600 hover:underline font-medium mx-1"
            >
              Limited Use requirements of the Photos API User Data and Developer Policy
            </a>.</strong>
          </p>
        </div>

        <p className="mb-4 text-gray-700">Claexa AI's use and transfer to any other app of information received from Google APIs will adhere to the 
          <a 
            href="https://developers.google.com/terms/api-services-user-data-policy" 
            target="_blank" 
            rel="noopener noreferrer" 
            className="text-blue-600 hover:underline font-medium mx-1"
          >
            Google API Services User Data Policy
          </a>, including the 
          <a 
            href="https://developers.google.com/terms/api-services-user-data-policy#additional_requirements_for_specific_api_scopes" 
            target="_blank" 
            rel="noopener noreferrer" 
            className="text-blue-600 hover:underline font-medium mx-1"
          >
            Limited Use requirements
          </a>. Specifically:</p>

        <ul className="list-disc list-inside mb-4 pl-4 text-gray-700 space-y-2">
          <li>We only use the data obtained from Google APIs (e.g., user's email, profile name for account creation/management, and content uploaded for AI processing) for providing and improving the user-facing features of Claexa AI. This means your data is used exclusively to deliver the AI tools and educational functionalities you interact with, such as processing your queries, generating content, or analyzing uploaded documents.</li>
          <li>We do not transfer or sell user data obtained from Google APIs to third parties for advertising, market research, or any other purpose unrelated to providing Claexa AI's core services.</li>
          <li>We do not use data obtained from Google APIs for serving advertisements.</li>
          <li>Human access to user data obtained from Google APIs is strictly limited. This access is only permitted when absolutely necessary for security reasons (e.g., investigating abuse), to comply with applicable law, or with your explicit consent for specific troubleshooting or support requests. All human access is logged and audited.</li>
        </ul>
      </section>

      <section className="mb-8">
        <h2 className="text-2xl font-semibold mb-4 text-gray-800">4. How We Share Your Information</h2>
        <p className="mb-4 text-gray-700">We may share your information in certain circumstances, as described
          below:</p>
        <ul className="list-disc list-inside mb-4 pl-4 text-gray-700 space-y-2">
          <li><strong>With AI Model Providers:</strong> Your uploaded media (images and PDFs) and user-generated content
            are shared with our AI model providers to enable them to perform the requested AI analysis and processing.
            Where feasible, we anonymize or de-identify any personally identifiable information (PII) within images/PDFs
            before sending them to model providers. Our agreements with model providers generally stipulate that they do
            not retain a copy of the media or processed data beyond what is necessary to perform the service. However,
            we encourage you to review the privacy policies of the specific AI model providers we utilize for their data
            retention practices.
          </li>
          <li><strong>With Payment Processors:</strong> Your payment information is shared with Cashfree Payments to
            facilitate secure transaction processing.
          </li>
          <li><strong>With Analytics Providers:</strong> We may share Usage Data with third-party analytics services
            (e.g., Google Analytics) to help us understand user behavior and improve our services. This data is
            typically aggregated or anonymized.
          </li>
          <li><strong>For Legal Reasons:</strong> We may disclose your information if required to do so by law or in
            response to valid requests by public authorities (e.g., a court order or government agency).
          </li>
          <li><strong>In Business Transfers:</strong> In the event of a merger, acquisition, reorganization, or sale of
            all or a portion of our assets, your information may be transferred as part of that transaction. We will
            notify you via email and/or a prominent notice on our website of any such change in ownership or control of
            your personal information.
          </li>
        </ul>
      </section>

      <section className="mb-8">
        <h2 className="text-2xl font-semibold mb-4 text-gray-800">5. Data Retention</h2>
        <p className="mb-4 text-gray-700">We retain your personal information for as long as necessary to provide you
          with Claexa AI services, fulfill the purposes outlined in this Privacy Policy, and comply with our legal
          obligations.</p>
        <ul className="list-disc list-inside mb-4 pl-4 text-gray-700 space-y-2">
          <li><strong>User Accounts &amp; Google Sign-In Data:</strong> We retain this data for as long as your account
            is active. If you delete your account, we will delete your Google Sign-In data within a reasonable period,
            typically within 30 to 90 days, unless a longer retention period is required or permitted by law for legal,
            tax, or regulatory reasons.
          </li>
          <li><strong>User-Generated Content &amp; Uploaded Media:</strong> Your text inputs and uploaded media (images,
            PDFs) are retained for as long as your account is active to provide you with access to your past
            interactions and content. Upon account deletion, this content will be removed from our servers within a
            reasonable timeframe, typically within 30 to 90 days, unless legal obligations require longer retention.
          </li>
          <li><strong>Usage Data:</strong> Aggregated and anonymized usage statistics may be retained indefinitely for
            analytical purposes to improve our services. Raw usage data, such as IP addresses, is typically retained for
            a shorter period, usually up to 90 days, for security, troubleshooting, and immediate analytical needs,
            after which it is anonymized or deleted.
          </li>
        </ul>
      </section>

      <section className="mb-8">
        <h2 className="text-2xl font-semibold mb-4 text-gray-800">6. Your Data Protection Rights</h2>
        <p className="mb-4 text-gray-700">You have certain rights regarding your personal data. To exercise any of these
          rights, please contact us using the details provided in the "Contact Us" section below.</p>
        <ul className="list-disc list-inside mb-4 pl-4 text-gray-700 space-y-2">
          <li><strong>Right to Access:</strong> You have the right to request a copy of the personal data we hold about
            you.
          </li>
          <li><strong>Right to Rectification/Correction:</strong> You have the right to request that we correct any
            inaccurate or incomplete personal data we hold about you. You may be able to update some of your information
            directly through your account settings.
          </li>
          <li><strong>Right to Erasure (Right to be Forgotten):</strong> You have the right to request the deletion of
            your personal data under certain circumstances. Please note that we may be required to retain certain
            information by law.
          </li>
          <li><strong>Right to Object/Restriction of Processing:</strong> You have the right to object to or request the
            restriction of the processing of your personal data under certain conditions.
          </li>
          <li><strong>Right to Data Portability:</strong> You have the right to receive your personal data in a
            structured, commonly used, and machine-readable format, and to transmit that data to another controller,
            where technically feasible.
          </li>
        </ul>
      </section>

      <section className="mb-8">
        <h2 className="text-2xl font-semibold mb-4 text-gray-800">7. Children's Privacy</h2>
        <p className="mb-4 text-gray-700">Claexa AI is designed for students and educators. We do not knowingly collect
          personal data from children under the age of 13 without verifiable parental consent. If we become aware that
          we have collected personal data from a child under 13 without appropriate consent, we will take steps to
          delete that information as quickly as possible. If you believe we might have any information from or about a
          child under 13, please contact us immediately.</p>
      </section>

      <section className="mb-8">
        <h2 className="text-2xl font-semibold mb-4 text-gray-800">8. Changes to This Privacy Policy</h2>
        <p className="mb-4 text-gray-700">We may update our Privacy Policy from time to time. We will notify you of any
          changes by posting the new Privacy Policy on this page and updating the "Effective Date" at the top. You are
          advised to review this Privacy Policy periodically for any changes. Changes to this Privacy Policy are
          effective when they are posted on this page.</p>
      </section>

      <section className="mb-6">
        <h2 className="text-2xl font-semibold mb-4 text-gray-800">9. Contact Us</h2>
        <p className="mb-2 text-gray-700">If you have any questions about this Privacy Policy, please contact us:</p>
        <ul className="list-disc list-inside mb-4 pl-4 text-gray-700 space-y-1">
          <li>By email: claexa.ai.mail@gmail.com</li>
        </ul>
      </section>
      
      <p className="text-sm text-gray-600 text-center mb-4">© 2025 Claexa AI. All rights reserved</p>
    </div>
);

export default PrivacyPolicyPage;

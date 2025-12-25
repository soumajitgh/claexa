import React from 'react';
import {Separator} from '@/components/ui/separator';

const RefundPolicyPage: React.FC = () => (
  <div className="text-gray-700">
    <h1 className="text-3xl font-bold mb-6 text-gray-800">Refund Policy</h1>
    <Separator className={"my-6"}/>

    <p className="mb-4">This Refund Policy ("Policy") applies to all purchases made through the Claexa AI web application ("Claexa AI," "we," "our," or "us").</p>

    <section className="mb-8">
      <h2 className="text-2xl font-semibold mb-4 text-gray-800">1. No Refunds</h2>
      <p className="mb-4">All sales and subscriptions for Claexa AI services are final.</p>
      <p className="mb-4">Claexa AI operates on a strict no-refund policy. This means that once a payment has been made for any premium features, subscriptions, or other services offered on Claexa AI, no refunds, partial refunds, or credits will be issued, regardless of the reason for cancellation, non-use, or dissatisfaction.</p>
      <p className="mb-6">By making a purchase on Claexa AI, you acknowledge and agree to this no-refund policy. We encourage users to carefully review our service offerings and terms before completing any purchase.</p>
    </section>
      <section className="mb-8">
        <h2 className="text-2xl font-semibold mb-4 text-gray-800">1. No Refunds</h2>
        <p className="mb-4">All sales and subscriptions for Claexa AI services are final.</p>
        <p className="mb-4">Claexa AI operates on a strict no-refund policy. This means that once a payment has been made for any premium features, subscriptions, or other services offered on Claexa AI, no refunds, partial refunds, or credits will be issued, regardless of the reason for cancellation, non-use, or dissatisfaction.</p>
        <p className="mb-6">By making a purchase on Claexa AI, you acknowledge and agree to this no-refund policy. We encourage users to carefully review our service offerings and terms before completing any purchase.</p>
      </section>

      <section className="mb-6">
        <h2 className="text-2xl font-semibold mb-4 text-gray-800">2. Contact Us</h2>
        <p className="mb-2">If you have any questions about this Refund Policy, please contact us:</p>
        <ul className="list-disc list-inside pl-4 space-y-1">
          <li>By email: <a href="mailto:claexa.ai.mail@gmail.com" className="text-blue-600 hover:underline">claexa.ai.mail@gmail.com</a></li>
        </ul>
      </section>
    </div>
);

export default RefundPolicyPage;


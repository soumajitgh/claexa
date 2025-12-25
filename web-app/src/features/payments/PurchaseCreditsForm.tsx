import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Check, CreditCard } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

interface CreditPackage {
  id: string;
  name: string;
  credits: number;
  price: number;
  popular?: boolean;
  features: string[];
}

const creditPackages: CreditPackage[] = [
  {
    id: "starter",
    name: "Starter Pack",
    credits: 50,
    price: 499,
    features: [
      "50 AI-generated questions",
      "Basic question types",
      "PDF export",
      "Email support",
    ],
  },
  {
    id: "professional",
    name: "Professional Pack",
    credits: 200,
    price: 1499,
    popular: true,
    features: [
      "200 AI-generated questions",
      "All question types",
      "PDF & Word export",
      "Priority support",
      "Custom templates",
    ],
  },
  {
    id: "enterprise",
    name: "Enterprise Pack",
    credits: 500,
    price: 2999,
    features: [
      "500 AI-generated questions",
      "All question types",
      "Multiple export formats",
      "Priority support",
      "Custom templates",
      "Team collaboration",
    ],
  },
];

export function PurchaseCreditsForm() {
  const [selectedPackage, setSelectedPackage] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  const handlePurchase = async (packageId: string) => {
    setIsProcessing(true);
    setSelectedPackage(packageId);

    try {
      // Mock payment processing
      await new Promise((resolve) => setTimeout(resolve, 2000));

      const pkg = creditPackages.find((p) => p.id === packageId);
      toast.success(
        `Successfully purchased ${pkg?.name}! ${pkg?.credits} credits added to your account.`
      );
    } catch (error) {
      toast.error("Payment failed. Please try again.");
    } finally {
      setIsProcessing(false);
      setSelectedPackage(null);
    }
  };

  return (
    <div className="space-y-6">
      <div className="text-center space-y-2">
        <h2 className="text-2xl font-bold">Purchase Credits</h2>
        <p className="text-muted-foreground">
          Choose a credit package to generate AI-powered question papers
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {creditPackages.map((pkg) => (
          <Card
            key={pkg.id}
            className={`relative ${
              pkg.popular ? "border-primary shadow-lg" : ""
            }`}
          >
            {pkg.popular && (
              <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                <Badge className="bg-primary text-primary-foreground px-3 py-1">
                  Most Popular
                </Badge>
              </div>
            )}

            <CardHeader className="text-center pb-2">
              <CardTitle className="text-xl">{pkg.name}</CardTitle>
              <CardDescription>
                <span className="text-3xl font-bold text-foreground">
                  ₹{pkg.price}
                </span>
                <span className="text-muted-foreground">
                  {" "}
                  / {pkg.credits} credits
                </span>
              </CardDescription>
              <div className="text-sm text-muted-foreground">
                ₹{(pkg.price / pkg.credits).toFixed(1)} per credit
              </div>
            </CardHeader>

            <CardContent className="space-y-4">
              <div className="space-y-2">
                {pkg.features.map((feature, index) => (
                  <div key={index} className="flex items-center gap-2 text-sm">
                    <Check className="h-4 w-4 text-green-500 flex-shrink-0" />
                    <span>{feature}</span>
                  </div>
                ))}
              </div>

              <Button
                className="w-full"
                variant={pkg.popular ? "default" : "outline"}
                onClick={() => handlePurchase(pkg.id)}
                disabled={isProcessing}
              >
                {isProcessing && selectedPackage === pkg.id ? (
                  "Processing..."
                ) : (
                  <>
                    <CreditCard className="h-4 w-4 mr-2" />
                    Purchase {pkg.credits} Credits
                  </>
                )}
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="bg-muted/50 rounded-lg p-4 text-center text-sm text-muted-foreground">
        <p>
          💳 Secure payment powered by Razorpay • 🔒 SSL encrypted • 💯 100%
          refund policy
        </p>
      </div>
    </div>
  );
}

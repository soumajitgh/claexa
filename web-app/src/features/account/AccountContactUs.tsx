import { Button } from "@/components/ui/button";
import { Mail, Phone, MessageSquare } from "lucide-react";
import { useState } from "react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useAuth } from "@/context/auth";

export function AccountContactUs() {
  const [isMailDialogOpen, setIsMailDialogOpen] = useState(false);
  const { currentUser } = useAuth();

  // Pre-fill user information if available
  const [formData, setFormData] = useState({
    name: currentUser?.profile?.fullName || "",
    email: currentUser?.email || "",
    userId: currentUser?.id || "",
    message: "",
  });

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const openGmail = () => {
    const email = "claexa.ai.mail@gmail.com";
    const subject = "Contact from Claexa AI Platform";

    // Format the body with user information and message
    const body = [
      `Name: ${formData.name}`,
      `Email: ${formData.email}`,
      `User ID: ${formData.userId}`,
      "",
      "--- Message ---",
      formData.message,
    ].join("\n");

    // Open Gmail directly
    window.open(
      `https://mail.google.com/mail/?view=cm&fs=1&to=${email}&su=${encodeURIComponent(
        subject
      )}&body=${encodeURIComponent(body)}`,
      "_blank"
    );
    setIsMailDialogOpen(false);
  };

  return (
    <div className="space-y-4 sm:space-y-6">
      <div className="space-y-1 sm:space-y-2">
        <h2 className="text-lg sm:text-xl font-semibold">Contact Us</h2>
        <p className="text-xs sm:text-sm text-muted-foreground">
          Have questions or need assistance? Our team is here to help! Use any
          of the contact methods below to reach us.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
        <div className="border rounded-lg p-4 sm:p-6 hover:shadow-md transition-shadow">
          <div className="flex items-start gap-3 sm:gap-4">
            <div className="p-2 rounded-full bg-primary/10 flex-shrink-0">
              <Mail className="h-4 w-4 sm:h-5 sm:w-5 text-primary" />
            </div>
            <div className="min-w-0 flex-1">
              <h3 className="font-medium mb-1 text-sm sm:text-base">
                Email Us
              </h3>
              <p className="text-xs sm:text-sm text-muted-foreground mb-2 sm:mb-3">
                For general inquiries and support
              </p>
              <a
                href="mailto:support@claexa.com"
                className="text-primary font-medium hover:underline text-xs sm:text-sm break-all"
              >
                support@claexa.com
              </a>
            </div>
          </div>
        </div>

        <div className="border rounded-lg p-4 sm:p-6 hover:shadow-md transition-shadow">
          <div className="flex items-start gap-3 sm:gap-4">
            <div className="p-2 rounded-full bg-primary/10 flex-shrink-0">
              <Phone className="h-4 w-4 sm:h-5 sm:w-5 text-primary" />
            </div>
            <div className="min-w-0 flex-1">
              <h3 className="font-medium mb-1 text-sm sm:text-base">Call Us</h3>
              <p className="text-xs sm:text-sm text-muted-foreground mb-2 sm:mb-3">
                For urgent matters and direct assistance
              </p>
              <a
                href="tel:+919339427224"
                className="text-primary font-medium hover:underline text-xs sm:text-sm"
              >
                +91 9339427224
              </a>
            </div>
          </div>
        </div>
      </div>

      <div className="border rounded-lg p-4 sm:p-6 hover:shadow-md transition-shadow">
        <div className="flex items-start gap-3 sm:gap-4">
          <div className="p-2 rounded-full bg-primary/10 flex-shrink-0">
            <MessageSquare className="h-4 w-4 sm:h-5 sm:w-5 text-primary" />
          </div>
          <div className="flex-grow min-w-0">
            <h3 className="font-medium mb-1 text-sm sm:text-base">
              Send Us a Message
            </h3>
            <p className="text-xs sm:text-sm text-muted-foreground mb-3 sm:mb-4">
              We typically respond within 24 hours during business days
            </p>
            <Button
              onClick={() => setIsMailDialogOpen(true)}
              className="w-full sm:w-auto text-sm"
              size="sm"
            >
              <Mail className="mr-2 h-3 w-3 sm:h-4 sm:w-4" />
              Compose Email
            </Button>
          </div>
        </div>
      </div>

      {/* Email Confirmation Dialog */}
      <Dialog open={isMailDialogOpen} onOpenChange={setIsMailDialogOpen}>
        <DialogContent className="sm:max-w-[425px] mx-4 sm:mx-0 max-h-[90vh] overflow-y-auto">
          <DialogHeader className="space-y-2">
            <DialogTitle className="text-lg sm:text-xl">
              Compose Email
            </DialogTitle>
            <DialogDescription className="text-sm sm:text-base">
              You're about to compose an email to our support team at
              claexa.ai.mail@gmail.com. Gmail will open in a new tab.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-3 sm:space-y-4 py-2">
            <div>
              <Label htmlFor="name" className="text-sm font-medium">
                Name
              </Label>
              <Input
                id="name"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                className="mt-1"
                placeholder="Your full name"
              />
            </div>

            <div>
              <Label htmlFor="email" className="text-sm font-medium">
                Email
              </Label>
              <Input
                id="email"
                name="email"
                type="email"
                value={formData.email}
                onChange={handleInputChange}
                className="mt-1"
                placeholder="your.email@example.com"
              />
            </div>

            <div>
              <Label htmlFor="userId" className="text-sm font-medium">
                User ID
              </Label>
              <Input
                id="userId"
                name="userId"
                value={formData.userId}
                onChange={handleInputChange}
                className="mt-1 font-mono text-xs"
                placeholder="Your user ID"
              />
            </div>

            <div>
              <Label htmlFor="message" className="text-sm font-medium">
                Message
              </Label>
              <Textarea
                id="message"
                name="message"
                value={formData.message}
                onChange={handleInputChange}
                rows={4}
                className="mt-1 resize-none"
                placeholder="Describe your question or issue..."
              />
            </div>
          </div>
          <DialogFooter className="flex flex-col sm:flex-row gap-2 sm:gap-0 pt-2">
            <Button
              variant="outline"
              onClick={() => setIsMailDialogOpen(false)}
              className="w-full sm:w-auto"
            >
              Cancel
            </Button>
            <Button onClick={openGmail} className="w-full sm:w-auto">
              Open Gmail
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs.tsx";
import { User, MessageCircle, Mail } from "lucide-react";
import { useAuth } from "@/context/auth";
import { AccountInfo } from "@/features/account/AccountInfo";
import { InvitesTab } from "@/features/account/InvitesTab";
import { AccountContactUs } from "@/features/account/AccountContactUs";

export default function AccountView() {
  // Auth still imported in case future conditional logic required; unused currently.
  useAuth();

  // We have 3 tabs now: Account, Invites, Contact (Usage & Payments disabled)

  return (
    <Tabs defaultValue="account" className="w-full">
      <TabsList className="grid w-full grid-cols-3 h-10">
        <TabsTrigger
          value="account"
          className="flex flex-row items-center gap-2 py-1.5 text-sm"
        >
          <User className="h-4 w-4" />
          <span>Account</span>
        </TabsTrigger>

        <TabsTrigger
          value="invites"
          className="flex flex-row items-center gap-2 py-1.5 text-sm"
        >
          <Mail className="h-4 w-4" />
          <span>Invites</span>
        </TabsTrigger>

        {/* Usage tab removed while usage features disabled */}

        <TabsTrigger
          value="contact"
          className="flex flex-row items-center gap-2 py-1.5 text-sm"
        >
          <MessageCircle className="h-4 w-4" />
          <span>Contact Us</span>
        </TabsTrigger>
      </TabsList>

      <TabsContent value="account" className="mt-3">
        <AccountInfo />
      </TabsContent>
      <TabsContent value="invites" className="mt-3">
        <InvitesTab />
      </TabsContent>
      {/* Usage content removed */}
      <TabsContent value="contact" className="mt-3">
        <AccountContactUs />
      </TabsContent>
    </Tabs>
  );
}

import { redirect } from "next/navigation";

import { getCurrentUser } from "@/lib/session";
import { constructMetadata } from "@/lib/utils";
import { DeleteAccountSection } from "@/components/dashboard/delete-account";
import { DashboardHeader } from "@/components/dashboard/header";
import { UserNameForm } from "@/components/forms/user-name-form";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { JobWebsiteIntegrationsSection } from "@/components/settings/job-website-integrations";
import { OAuthCallbackHandler } from "@/components/settings/oauth-callback-handler";

export const metadata = constructMetadata({
  title: "Settings – Entretien AI",
  description: "Configure your account and website settings.",
});

export default async function SettingsPage({
  searchParams,
}: {
  searchParams: { [key: string]: string | string[] | undefined };
}) {
  const user = await getCurrentUser();

  if (!user?.id) redirect("/login");

  // Extract OAuth callback parameters
  const success = searchParams.success;
  const error = searchParams.error;
  const provider = searchParams.provider as string | undefined;

  return (
    <>
      <DashboardHeader
        heading="Settings"
        text="Manage account and website settings."
      />
      {/* Handle OAuth callback responses */}
      {(success || error) && provider && (
        <OAuthCallbackHandler 
          success={success !== undefined} 
          error={error as string | undefined} 
          provider={provider} 
        />
      )}
      <Tabs 
        defaultValue={searchParams.tab as string || "account"} 
        className="w-full"
      >
        <TabsList className="mb-4">
          <TabsTrigger value="account">Account</TabsTrigger>
          <TabsTrigger value="integrations">Job Website Integrations</TabsTrigger>
        </TabsList>
        <TabsContent value="account" className="space-y-4">
          <div className="divide-y divide-muted pb-10">
            <UserNameForm user={{ id: user.id, name: user.name || "" }} />
            {/* <UserRoleForm user={{ id: user.id, role: user.role }} /> */}
            <DeleteAccountSection />
          </div>
        </TabsContent>
        <TabsContent value="integrations" className="space-y-4">
          <JobWebsiteIntegrationsSection organizationId={user.organizationId} />
        </TabsContent>
      </Tabs>
    </>
  );
}

import { PageHeader } from "@/components/layout/page-header";
import { AddClientWizard } from "@/components/wizard/add-client-wizard";

export const metadata = { title: "Add Client" };

export default function NewClientPage() {
  return (
    <div>
      <PageHeader
        title="Add Client"
        description="Profile, measurements, and first order in four steps. Nothing is saved until you confirm."
      />
      <AddClientWizard />
    </div>
  );
}

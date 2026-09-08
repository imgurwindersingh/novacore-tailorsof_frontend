import { redirect } from "next/navigation";
import Image from "next/image";
import { LoginForm } from "@/components/auth/login-form";
import { getSession } from "@/lib/session";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export const metadata = {
  title: "Sign in",
};

export default async function LoginPage() {
  const session = await getSession();
  if (session) redirect("/dashboard");

  return (
    <main className="relative flex flex-1 items-center justify-center overflow-hidden p-6">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            "radial-gradient(600px 320px at 20% 0%, color-mix(in oklab, var(--primary) 14%, transparent), transparent 60%), radial-gradient(520px 300px at 85% 110%, color-mix(in oklab, var(--accent) 35%, transparent), transparent 60%)",
        }}
      />
      <Card className="relative w-full max-w-sm shadow-lg shadow-black/5">
        <CardHeader className="text-center">
          <Image
            src="/logo.png"
            alt="Bluestar Tailors"
            width={52}
            height={52}
            style={{ width: "auto", height: "52px" }}
            className="mx-auto mb-2 object-contain"
            priority
          />
          <CardTitle className="text-2xl">Bluestar Tailors</CardTitle>
          <CardDescription>Sign in to manage your tailoring shop</CardDescription>
        </CardHeader>
        <CardContent>
          <LoginForm />
        </CardContent>
      </Card>
    </main>
  );
}

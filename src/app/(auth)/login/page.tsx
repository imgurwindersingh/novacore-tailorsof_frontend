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
    <main className="flex flex-1 items-center justify-center p-6">
      <Card className="w-full max-w-sm">
        <CardHeader className="text-center">
          <Image
            src="/logo.png"
            alt="Bluestar Tailors"
            width={48}
            height={48}
            style={{ width: "auto", height: "48px" }}
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

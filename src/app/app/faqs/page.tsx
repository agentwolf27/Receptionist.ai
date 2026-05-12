import { HelpCircle } from "lucide-react";
import { getCurrentBusinessOrRedirect } from "@/lib/data/business";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import { deleteFAQAction } from "../actions";
import { CreateFAQForm } from "./create-faq-form";

export default async function FAQsPage() {
  const business = await getCurrentBusinessOrRedirect();
  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">FAQs</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Train the AI on the most common questions. It only answers from these.
        </p>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Add FAQ</CardTitle>
          <CardDescription>Keep answers short and concrete.</CardDescription>
        </CardHeader>
        <CardContent>
          <CreateFAQForm />
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle>Your FAQs</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {business.faqs.length === 0 ? (
            <EmptyState
              icon={<HelpCircle className="h-5 w-5" />}
              title="No FAQs yet"
              description="Add at least 3-5 common questions so the AI can answer confidently."
            />
          ) : (
            <ul className="divide-y">
              {business.faqs.map((f) => (
                <li key={f.id} className="flex items-start justify-between gap-4 py-3">
                  <div className="min-w-0">
                    <p className="font-medium">{f.question}</p>
                    <p className="mt-1 text-sm text-muted-foreground">{f.answer}</p>
                  </div>
                  <form action={deleteFAQAction}>
                    <input type="hidden" name="id" value={f.id} />
                    <Button variant="ghost" size="sm" type="submit">
                      Delete
                    </Button>
                  </form>
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

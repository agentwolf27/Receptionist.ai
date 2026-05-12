import { Wrench } from "lucide-react";
import { getCurrentBusinessOrRedirect } from "@/lib/data/business";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { EmptyState } from "@/components/ui/empty-state";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { formatCurrency } from "@/lib/utils";
import {
  deleteAppointmentTypeAction,
  deleteServiceAction,
} from "../actions";
import { CreateServiceForm } from "./create-service-form";
import { CreateAppointmentTypeForm } from "./create-appointment-type-form";

export default async function ServicesPage() {
  const business = await getCurrentBusinessOrRedirect();
  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Services & Appointments</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Define what the AI receptionist can sell and book.
        </p>
      </div>
      <Tabs defaultValue="services">
        <TabsList>
          <TabsTrigger value="services">Services</TabsTrigger>
          <TabsTrigger value="appointment-types">Appointment types</TabsTrigger>
        </TabsList>

        <TabsContent value="services">
          <Card>
            <CardHeader>
              <CardTitle>Services</CardTitle>
              <CardDescription>
                What you offer to customers. The AI can describe and book these.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <CreateServiceForm />
              {business.services.length === 0 ? (
                <EmptyState
                  icon={<Wrench className="h-5 w-5" />}
                  title="No services yet"
                  description="Add your first service above. The AI will use it to answer questions and offer bookings."
                />
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Name</TableHead>
                      <TableHead>Duration</TableHead>
                      <TableHead>Price</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead />
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {business.services.map((s) => (
                      <TableRow key={s.id}>
                        <TableCell className="font-medium">
                          {s.name}
                          {s.description ? (
                            <p className="text-xs text-muted-foreground">{s.description}</p>
                          ) : null}
                        </TableCell>
                        <TableCell>{s.durationMinutes} min</TableCell>
                        <TableCell>{formatCurrency(s.priceCents)}</TableCell>
                        <TableCell>
                          <Badge variant={s.isActive ? "success" : "secondary"}>
                            {s.isActive ? "Active" : "Hidden"}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          <form action={deleteServiceAction}>
                            <input type="hidden" name="id" value={s.id} />
                            <Button variant="ghost" size="sm" type="submit">
                              Delete
                            </Button>
                          </form>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="appointment-types">
          <Card>
            <CardHeader>
              <CardTitle>Appointment types</CardTitle>
              <CardDescription>
                Bookable slots. Each type has a duration and optional buffer.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <CreateAppointmentTypeForm services={business.services} />
              {business.appointmentTypes.length === 0 ? (
                <EmptyState
                  icon={<Wrench className="h-5 w-5" />}
                  title="No appointment types yet"
                  description="Examples: 'New patient consultation', 'Cleaning', 'Oil change'."
                />
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Name</TableHead>
                      <TableHead>Duration</TableHead>
                      <TableHead>Buffer</TableHead>
                      <TableHead>Linked service</TableHead>
                      <TableHead />
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {business.appointmentTypes.map((t) => {
                      const linked = business.services.find((s) => s.id === t.serviceId);
                      return (
                        <TableRow key={t.id}>
                          <TableCell className="font-medium">{t.name}</TableCell>
                          <TableCell>{t.durationMinutes} min</TableCell>
                          <TableCell>{t.bufferMinutes} min</TableCell>
                          <TableCell>{linked?.name ?? "—"}</TableCell>
                          <TableCell className="text-right">
                            <form action={deleteAppointmentTypeAction}>
                              <input type="hidden" name="id" value={t.id} />
                              <Button variant="ghost" size="sm" type="submit">
                                Delete
                              </Button>
                            </form>
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

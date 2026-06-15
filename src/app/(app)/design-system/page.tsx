"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Spinner } from "@/components/ui/spinner";
import { toast } from "sonner";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";

export default function DesignSystemPage() {
  const [loading, setLoading] = useState(false);

  const simulateLoading = () => {
    setLoading(true);
    setTimeout(() => setLoading(false), 2000);
  };

  const notify = (type: 'success' | 'error' | 'info' | 'warning') => {
    switch (type) {
      case 'success':
        toast.success("Action completed successfully.");
        break;
      case 'error':
        toast.error("Something went wrong!");
        break;
      case 'warning':
        toast.warning("You are about to delete this item.");
        break;
      case 'info':
      default:
        toast("This is a generic notification.");
        break;
    }
  };

  return (
    <div className="p-8 md:p-12 space-y-16 max-w-6xl mx-auto">
      <div className="space-y-4 text-center">
        <h1 className="text-4xl font-bold tracking-tight text-gradient">Design System</h1>
        <p className="text-muted-foreground max-w-xl mx-auto text-lg">
          These are the foundational UI components that will be used across the application to ensure consistency and a premium feel.
        </p>
      </div>

      <section className="space-y-6">
        <h2 className="text-2xl font-semibold border-b pb-2 border-border">Buttons & Actions</h2>
        <div className="flex flex-wrap items-center gap-6">
          <Button>Default Primary</Button>
          <Button variant="secondary">Secondary</Button>
          <Button variant="outline">Outline</Button>
          <Button variant="ghost">Ghost</Button>
          <Button variant="destructive">Destructive</Button>
          <Button variant="link">Link Button</Button>
        </div>
        <div className="flex flex-wrap items-center gap-6">
          <Button size="sm">Small Size</Button>
          <Button size="default">Default Size</Button>
          <Button size="lg">Large Size</Button>
          <Button isLoading={true}>Always Loading</Button>
          <Button isLoading={loading} onClick={simulateLoading}>Click to Load (2s)</Button>
        </div>
      </section>

      <section className="space-y-6">
        <h2 className="text-2xl font-semibold border-b pb-2 border-border">Typography & Badges</h2>
        <div className="flex flex-wrap items-center gap-6">
          <Badge>Default Badge</Badge>
          <Badge variant="secondary">Secondary Badge</Badge>
          <Badge variant="outline">Outline Badge</Badge>
          <Badge variant="safe">Safe (In Stock)</Badge>
          <Badge variant="warning">Warning (Low Stock)</Badge>
          <Badge variant="critical">Critical (Expired)</Badge>
        </div>
      </section>

      <section className="space-y-6">
        <h2 className="text-2xl font-semibold border-b pb-2 border-border">Inputs & Forms</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="space-y-2">
            <Label htmlFor="standard">Standard Input</Label>
            <Input id="standard" placeholder="Type something..." />
            <p className="text-xs text-muted-foreground">Standard description text.</p>
          </div>
          <div className="space-y-2">
            <Label htmlFor="error">Error State</Label>
            <Input id="error" placeholder="Invalid input..." aria-invalid={true} defaultValue="wrong email!" />
            <p className="text-xs text-destructive">This email is already in use.</p>
          </div>
          <div className="space-y-2">
            <Label htmlFor="disabled">Disabled State</Label>
            <Input id="disabled" disabled placeholder="You cannot type here." />
          </div>
        </div>
      </section>

      <section className="space-y-6">
        <h2 className="text-2xl font-semibold border-b pb-2 border-border">Cards & Surfaces</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Standard Card</CardTitle>
              <CardDescription>A simple container for content.</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm">Cards provide flexible and extensible content containers with multiple variants.</p>
            </CardContent>
            <CardFooter>
              <Button variant="outline" className="w-full">Action</Button>
            </CardFooter>
          </Card>
          
          <Card className="glass">
            <CardHeader>
              <CardTitle>Glass Card</CardTitle>
              <CardDescription>Uses backdrop blur effect.</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm">The &quot;glass&quot; utility class makes it semi-transparent and blurry.</p>
            </CardContent>
          </Card>

          <Card className="border-primary/50 shadow-[0_0_15px_rgba(var(--primary),0.2)]">
            <CardHeader>
              <CardTitle className="text-primary">Highlighted Card</CardTitle>
              <CardDescription>Draws attention to important info.</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex justify-center items-center h-16">
                <Spinner size="lg" className="text-primary" />
              </div>
            </CardContent>
          </Card>
        </div>
      </section>

      <section className="space-y-6">
        <h2 className="text-2xl font-semibold border-b pb-2 border-border">Modals & Dialogs</h2>
        <div>
          <Dialog>
            <DialogTrigger render={<Button>Open Modal Dialog</Button>} />
            <DialogContent className="sm:max-w-[425px]">
              <DialogHeader>
                <DialogTitle>Edit profile</DialogTitle>
                <DialogDescription>
                  Make changes to your profile here. Click save when you&apos;re done.
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Name</Label>
                  <Input id="name" defaultValue="Admin User" />
                </div>
              </div>
              <DialogFooter>
                <Button type="submit">Save changes</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </section>

      <section className="space-y-6">
        <h2 className="text-2xl font-semibold border-b pb-2 border-border">Toasts & Notifications</h2>
        <div className="flex flex-wrap items-center gap-4">
          <Button variant="outline" onClick={() => notify('success')}>Show Success</Button>
          <Button variant="outline" onClick={() => notify('error')}>Show Error</Button>
          <Button variant="outline" onClick={() => notify('warning')}>Show Warning</Button>
          <Button variant="outline" onClick={() => notify('info')}>Show Info</Button>
        </div>
      </section>

      <section className="space-y-6">
        <h2 className="text-2xl font-semibold border-b pb-2 border-border">Data Tables</h2>
        <div className="border rounded-xl bg-card overflow-hidden">
          <Table>
            <TableHeader className="bg-muted/50">
              <TableRow>
                <TableHead className="w-[100px]">Invoice</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Method</TableHead>
                <TableHead className="text-right">Amount</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              <TableRow>
                <TableCell className="font-medium">INV001</TableCell>
                <TableCell><Badge variant="safe">Paid</Badge></TableCell>
                <TableCell>Credit Card</TableCell>
                <TableCell className="text-right text-gradient font-bold">$250.00</TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="font-medium">INV002</TableCell>
                <TableCell><Badge variant="warning">Pending</Badge></TableCell>
                <TableCell>PayPal</TableCell>
                <TableCell className="text-right font-bold">$150.00</TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="font-medium">INV003</TableCell>
                <TableCell><Badge variant="critical">Overdue</Badge></TableCell>
                <TableCell>Bank Transfer</TableCell>
                <TableCell className="text-right font-bold">$350.00</TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </div>
      </section>
    </div>
  );
}

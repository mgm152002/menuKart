import Link from 'next/link';
import { Button } from '@/components/ui/button';

export default function LandingPage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 p-4 sm:p-8">
      <main className="flex w-full max-w-4xl flex-col items-center justify-center text-center">
        <h1 className="mb-6 text-4xl font-extrabold tracking-tight text-gray-900 sm:text-5xl md:text-6xl">
          MenuKart: Your Digital Menu, Simplified.
        </h1>
        <p className="mb-8 max-w-2xl text-lg text-gray-700 sm:text-xl">
          Revolutionize your restaurant's operations with a modern, interactive digital menu. 
          Manage items, track orders, gather feedback, and delight your customers.
        </p>
        <div className="flex flex-col space-y-4 sm:flex-row sm:space-x-4 sm:space-y-0">
          <Link href="/login" passHref>
            <Button className="w-full bg-black text-white hover:bg-gray-800 sm:w-auto px-8 py-3 text-lg">
              Admin Login / Signup
            </Button>
          </Link>
          <Link href="#" passHref>
            <Button variant="outline" className="w-full border-black text-black hover:bg-gray-100 sm:w-auto px-8 py-3 text-lg">
              Scan QR Code (Customer)
            </Button>
          </Link>
        </div>
      </main>

      {/* Optional: Add a section for key features or testimonials here */}
      {/* <section className="mt-16 w-full max-w-4xl">
        <h2 className="mb-8 text-3xl font-bold text-gray-800">Why Choose MenuKart?</h2>
        <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
          <Card className="p-6">
            <CardHeader><CardTitle>Easy Menu Management</CardTitle></CardHeader>
            <CardContent>Update your menu in real-time with a few clicks.</CardContent>
          </Card>
          <Card className="p-6">
            <CardHeader><CardTitle>Seamless Ordering</CardTitle></CardHeader>
            <CardContent>Customers can browse and order directly from their phones.</CardContent>
          </Card>
          <Card className="p-6">
            <CardHeader><CardTitle>Valuable Insights</CardTitle></CardHeader>
            <CardContent>Track popular items and customer feedback.</CardContent>
          </Card>
        </div>
      </section> */}
    </div>
  );
}

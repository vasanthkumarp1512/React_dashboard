import Link from "next/link";
import { Shield, ArrowRight } from "lucide-react";

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-white">
      {/* Navigation */}
      <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 flex justify-between items-center">
        <div className="flex items-center gap-2 text-2xl font-bold text-indigo-600">
          <Shield className="w-8 h-8" />
          SecureDash
        </div>
        <div className="space-x-4">
          <Link href="/auth/signin" className="text-gray-600 hover:text-indigo-600 font-medium transition-colors">
            Sign In
          </Link>
          <Link href="/auth/signup" className="bg-indigo-600 text-white px-6 py-2 rounded-full font-medium hover:bg-indigo-700 transition-colors">
            Register
          </Link>
        </div>
      </nav>

      {/* Hero */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 text-center">
        <h1 className="text-5xl md:text-7xl font-extrabold text-gray-900 tracking-tight mb-8">
          The Secure Choice for <br />
          <span className="text-indigo-600">Modern Dashboard Management</span>
        </h1>
        <p className="max-w-2xl mx-auto text-xl text-gray-600 mb-10">
          A premium React-based dashboard with advanced role-based access control and admin approval workflows.
        </p>
        <div className="flex justify-center gap-4">
          <Link href="/auth/signup" className="bg-indigo-600 text-white px-8 py-4 rounded-xl font-bold flex items-center gap-2 hover:bg-indigo-700 transition-all transform hover:scale-105">
            Get Started Now
            <ArrowRight className="w-5 h-5" />
          </Link>
        </div>

        {/* Features Preview */}
        <div className="mt-32 grid grid-cols-1 md:grid-cols-3 gap-8">
          {[
            { title: "Role-Based Access", desc: "Fine-grained permissions for admins and users." },
            { title: "Admin Approval", desc: "Control who gains access to your platform manually." },
            { title: "Neon DB Power", desc: "Scalable PostgreSQL serverless database with Neon." }
          ].map((f, i) => (
            <div key={i} className="p-8 bg-gray-50 rounded-2xl text-left border border-gray-100">
              <h3 className="text-xl font-bold text-gray-900 mb-3">{f.title}</h3>
              <p className="text-gray-600">{f.desc}</p>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}

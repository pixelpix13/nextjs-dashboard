import LoginForm from '@/app/ui/login-form';
import { Suspense } from 'react';
import { ShoppingBagIcon } from '@heroicons/react/24/solid';
 
export default function LoginPage() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-gradient-to-br from-blue-50 via-white to-indigo-50">
      <div className="w-full max-w-md">
        {/* Logo Section */}
        <div className="mb-8 text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-600 to-indigo-600 shadow-lg">
            <ShoppingBagIcon className="h-10 w-10 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900">ShopAdmin</h1>
          <p className="mt-2 text-gray-600">Sign in to your e-commerce dashboard</p>
        </div>

        {/* Login Form Card */}
        <div className="rounded-2xl bg-white p-8 shadow-xl">
          <Suspense>
            <LoginForm />
          </Suspense>
        </div>

        {/* Footer */}
        <p className="mt-8 text-center text-sm text-gray-600">
          © 2026 ShopAdmin. All rights reserved.
        </p>
      </div>
    </main>
  );
}
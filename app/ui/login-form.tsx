'use client';
 
import {
  AtSymbolIcon,
  KeyIcon,
  ExclamationCircleIcon,
} from '@heroicons/react/24/outline';
import { ArrowRightIcon } from '@heroicons/react/20/solid';
import { Button } from '@/app/ui/button';
import { useActionState } from 'react';
import { authenticate } from '@/app/lib/actions';
import { useSearchParams } from 'next/navigation';
 
export default function LoginForm() {
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get('redirect') || '/';
  const [errorMessage, formAction, isPending] = useActionState(
    authenticate,
    undefined,
  );
 
  return (
    <form action={formAction} className="space-y-6">
      <div>
        <label
          className="mb-2 block text-sm font-semibold text-gray-700"
          htmlFor="email"
        >
          Email Address
        </label>
        <div className="relative">
          <input
            className="block w-full rounded-lg border border-gray-300 bg-gray-50 px-4 py-3 pl-11 text-sm text-gray-900 transition focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
            id="email"
            type="email"
            name="email"
            placeholder="Enter your email"
            required
          />
          <AtSymbolIcon className="pointer-events-none absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
        </div>
      </div>

      <div>
        <label
          className="mb-2 block text-sm font-semibold text-gray-700"
          htmlFor="password"
        >
          Password
        </label>
        <div className="relative">
          <input
            className="block w-full rounded-lg border border-gray-300 bg-gray-50 px-4 py-3 pl-11 text-sm text-gray-900 transition focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
            id="password"
            type="password"
            name="password"
            placeholder="Enter your password"
            required
            minLength={6}
          />
          <KeyIcon className="pointer-events-none absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
        </div>
      </div>

      <input type="hidden" name="redirectTo" value={callbackUrl} />
      
      <Button 
        className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 py-3 text-white transition hover:from-blue-700 hover:to-indigo-700" 
        aria-disabled={isPending}
      >
        {isPending ? 'Signing in...' : 'Sign In'}
        <ArrowRightIcon className="ml-2 h-5 w-5" />
      </Button>

      {errorMessage && (
        <div className="flex items-center gap-2 rounded-lg bg-red-50 p-3">
          <ExclamationCircleIcon className="h-5 w-5 text-red-500" />
          <p className="text-sm font-medium text-red-700">{errorMessage}</p>
        </div>
      )}

      <div className="pt-4 text-center text-sm text-gray-600">
        <p>Demo credentials:</p>
        <p className="mt-1 font-medium">admin@ecommerce.com / admin123</p>
      </div>
    </form>
  );
}
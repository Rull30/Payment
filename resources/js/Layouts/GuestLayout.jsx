import { Link } from '@inertiajs/react';
import { Receipt } from 'lucide-react';

export default function GuestLayout({ children }) {
    return (
        <div className="flex min-h-screen flex-col items-center justify-center bg-zinc-50/70 p-4 antialiased text-zinc-900">
            <div className="mb-6 flex flex-col items-center gap-2">
                <Link href="/" className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-md bg-zinc-900 text-white flex items-center justify-center shadow-sm">
                        <Receipt className="w-4 h-4" strokeWidth={1.75} />
                    </div>
                    <span className="font-semibold text-base tracking-tight text-zinc-900">
                        RemindPay
                    </span>
                </Link>
                <p className="text-xs text-zinc-500">
                    Invoice & WhatsApp Payment Reminder Micro-SaaS
                </p>
            </div>

            <div className="w-full max-w-sm bg-white rounded-lg border border-zinc-200 shadow-sm p-6">
                {children}
            </div>

            <div className="mt-8 text-center text-xs text-zinc-400">
                <p>Default test account: <span className="font-mono text-zinc-600">demo@example.com</span> / <span className="font-mono text-zinc-600">password</span></p>
            </div>
        </div>
    );
}

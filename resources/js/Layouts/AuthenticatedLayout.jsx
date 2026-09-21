import Dropdown from '@/Components/Dropdown';
import NavLink from '@/Components/NavLink';
import ResponsiveNavLink from '@/Components/ResponsiveNavLink';
import { useApp } from '@/Contexts/AppContext';
import { Link, usePage } from '@inertiajs/react';
import {
    Building2,
    CheckCircle2,
    CreditCard,
    FileText,
    Globe,
    LogOut,
    Menu,
    Moon,
    Receipt,
    Settings,
    Sun,
    User as UserIcon,
    Users,
    X,
} from 'lucide-react';
import { useState } from 'react';

export default function AuthenticatedLayout({ header, children }) {
    const { props, url } = usePage();
    const { auth, flash } = props;
    const user = auth.user;
    const [showingNavigationDropdown, setShowingNavigationDropdown] = useState(false);
    const { theme, toggleTheme, locale, toggleLocale, t } = useApp();

    const hasBankSetup = Boolean(
        user.bank_details?.bank_name &&
        user.bank_details?.account_number &&
        user.bank_details?.account_holder
    );

    return (
        <div className="min-h-screen bg-zinc-50/70 dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100 flex flex-col antialiased transition-colors duration-200">
            {/* Minimal Top Notification Bar for Unset Bank Details */}
            {!hasBankSetup && (
                <div className="bg-amber-50 dark:bg-amber-950/40 border-b border-amber-200/80 dark:border-amber-900/60 px-4 py-2 text-xs text-amber-800 dark:text-amber-200 flex items-center justify-between">
                    <div className="flex items-center gap-2 max-w-7xl mx-auto w-full">
                        <CreditCard className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400 shrink-0" strokeWidth={1.75} />
                        <span>
                            {t('nav.setupBankNotice')}
                        </span>
                        <Link
                            href={route('settings.edit')}
                            className="underline font-medium hover:text-amber-950 dark:hover:text-amber-100 ml-auto shrink-0"
                        >
                            {t('nav.configureNow')}
                        </Link>
                    </div>
                </div>
            )}

            {/* Main Navigation */}
            <nav className="border-b border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 sticky top-0 z-30 shadow-sm transition-colors duration-200">
                <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                    <div className="flex h-14 justify-between items-center">
                        <div className="flex items-center gap-8">
                            {/* Brand */}
                            <Link href={route('dashboard')} className="flex items-center gap-2.5 group">
                                <div className="w-7 h-7 rounded-md bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 flex items-center justify-center group-hover:bg-zinc-800 dark:group-hover:bg-zinc-200 transition-colors">
                                    <Receipt className="w-4 h-4" strokeWidth={1.75} />
                                </div>
                                <div className="flex flex-col">
                                    <span className="font-semibold text-sm tracking-tight text-zinc-900 dark:text-zinc-100">
                                        {t('brand.name')}
                                    </span>
                                </div>
                            </Link>

                            {/* Desktop Nav Links */}
                            <div className="hidden sm:flex sm:items-center sm:gap-6">
                                <NavLink
                                    href={route('dashboard')}
                                    active={route().current('dashboard') || route().current('invoices.*')}
                                >
                                    <FileText className="w-4 h-4 mr-1.5 inline-block text-zinc-500 dark:text-zinc-400" strokeWidth={1.75} />
                                    {t('nav.invoices')}
                                </NavLink>
                                <NavLink
                                    href={route('clients.index')}
                                    active={route().current('clients.*')}
                                >
                                    <Users className="w-4 h-4 mr-1.5 inline-block text-zinc-500 dark:text-zinc-400" strokeWidth={1.75} />
                                    {t('nav.clients')}
                                </NavLink>
                                <NavLink
                                    href={route('settings.edit')}
                                    active={route().current('settings.*')}
                                >
                                    <Settings className="w-4 h-4 mr-1.5 inline-block text-zinc-500 dark:text-zinc-400" strokeWidth={1.75} />
                                    {t('nav.settings')}
                                </NavLink>
                            </div>
                        </div>

                        {/* Right side controls */}
                        <div className="hidden sm:flex sm:items-center sm:gap-3">
                            {/* Language Switcher Button */}
                            <button
                                type="button"
                                onClick={toggleLocale}
                                title={locale === 'id' ? 'Switch to English' : 'Ganti ke Bahasa Indonesia'}
                                className="inline-flex items-center gap-1 px-2 py-1 rounded-md border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-xs font-mono font-medium text-zinc-700 dark:text-zinc-300 hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-colors"
                            >
                                <Globe className="w-3.5 h-3.5 text-zinc-500 dark:text-zinc-400" strokeWidth={1.75} />
                                <span className="uppercase">{locale}</span>
                            </button>

                            {/* Dark Mode Toggle Button */}
                            <button
                                type="button"
                                onClick={toggleTheme}
                                title={theme === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
                                className="p-1.5 rounded-md border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-zinc-600 dark:text-zinc-300 hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-colors"
                            >
                                {theme === 'dark' ? (
                                    <Sun className="w-4 h-4 text-amber-400" strokeWidth={1.75} />
                                ) : (
                                    <Moon className="w-4 h-4 text-zinc-600" strokeWidth={1.75} />
                                )}
                            </button>

                            {/* Business Badge */}
                            {user.business_name && (
                                <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-zinc-100 dark:bg-zinc-800 border border-zinc-200/80 dark:border-zinc-700 text-xs font-medium text-zinc-700 dark:text-zinc-300">
                                    <Building2 className="w-3.5 h-3.5 text-zinc-500 dark:text-zinc-400" strokeWidth={1.75} />
                                    <span className="truncate max-w-[150px]">{user.business_name}</span>
                                </div>
                            )}

                            {/* User Menu Dropdown */}
                            <Dropdown>
                                <Dropdown.Trigger>
                                    <button
                                        type="button"
                                        className="inline-flex items-center gap-2 rounded-md border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 px-2.5 py-1.5 text-xs font-medium text-zinc-700 dark:text-zinc-200 hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-colors focus:outline-none focus:ring-1 focus:ring-zinc-900 dark:focus:ring-zinc-100"
                                    >
                                        <div className="w-5 h-5 rounded-full bg-zinc-200 dark:bg-zinc-700 text-zinc-700 dark:text-zinc-200 flex items-center justify-center font-mono text-[10px] font-semibold">
                                            {user.name.charAt(0).toUpperCase()}
                                        </div>
                                        <span>{user.name}</span>
                                        <svg
                                            className="h-3.5 w-3.5 text-zinc-400"
                                            xmlns="http://www.w3.org/2000/svg"
                                            viewBox="0 0 20 20"
                                            fill="currentColor"
                                        >
                                            <path
                                                fillRule="evenodd"
                                                d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
                                                clipRule="evenodd"
                                            />
                                        </svg>
                                    </button>
                                </Dropdown.Trigger>

                                <Dropdown.Content width="48" contentClasses="py-1 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shadow-sm rounded-md">
                                    <div className="px-3 py-2 border-b border-zinc-100 dark:border-zinc-800">
                                        <p className="text-xs font-medium text-zinc-900 dark:text-zinc-100">{user.name}</p>
                                        <p className="text-[11px] text-zinc-500 dark:text-zinc-400 truncate">{user.email}</p>
                                    </div>
                                    <Dropdown.Link
                                        href={route('settings.edit')}
                                        className="flex items-center gap-2 text-xs text-zinc-700 dark:text-zinc-300 hover:bg-zinc-50 dark:hover:bg-zinc-800"
                                    >
                                        <Building2 className="w-3.5 h-3.5 text-zinc-500 dark:text-zinc-400" strokeWidth={1.75} />
                                        {t('nav.profile')}
                                    </Dropdown.Link>
                                    <Dropdown.Link
                                        href={route('profile.edit')}
                                        className="flex items-center gap-2 text-xs text-zinc-700 dark:text-zinc-300 hover:bg-zinc-50 dark:hover:bg-zinc-800"
                                    >
                                        <UserIcon className="w-3.5 h-3.5 text-zinc-500 dark:text-zinc-400" strokeWidth={1.75} />
                                        {t('nav.account')}
                                    </Dropdown.Link>
                                    <div className="border-t border-zinc-100 dark:border-zinc-800 my-1" />
                                    <Dropdown.Link
                                        href={route('logout')}
                                        method="post"
                                        as="button"
                                        className="flex items-center gap-2 text-xs text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40"
                                    >
                                        <LogOut className="w-3.5 h-3.5" strokeWidth={1.75} />
                                        {t('nav.logout')}
                                    </Dropdown.Link>
                                </Dropdown.Content>
                            </Dropdown>
                        </div>

                        {/* Mobile hamburger */}
                        <div className="flex items-center gap-2 sm:hidden">
                            <button
                                type="button"
                                onClick={toggleLocale}
                                className="px-2 py-1 rounded text-xs font-mono font-medium border border-zinc-200 dark:border-zinc-800 text-zinc-700 dark:text-zinc-300"
                            >
                                {locale.toUpperCase()}
                            </button>
                            <button
                                type="button"
                                onClick={toggleTheme}
                                className="p-1.5 rounded border border-zinc-200 dark:border-zinc-800 text-zinc-600 dark:text-zinc-300"
                            >
                                {theme === 'dark' ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4" />}
                            </button>
                            <button
                                onClick={() => setShowingNavigationDropdown((prev) => !prev)}
                                aria-label="Toggle navigation"
                                className="inline-flex items-center justify-center rounded-md p-1.5 text-zinc-600 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800"
                            >
                                {showingNavigationDropdown ? (
                                    <X className="h-5 w-5" strokeWidth={1.75} />
                                ) : (
                                    <Menu className="h-5 w-5" strokeWidth={1.75} />
                                )}
                            </button>
                        </div>
                    </div>
                </div>

                {/* Mobile Navigation Dropdown */}
                {showingNavigationDropdown && (
                    <div className="sm:hidden border-t border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900">
                        <div className="space-y-1 py-2">
                            <ResponsiveNavLink
                                href={route('dashboard')}
                                active={route().current('dashboard') || route().current('invoices.*')}
                            >
                                {t('nav.invoices')}
                            </ResponsiveNavLink>
                            <ResponsiveNavLink
                                href={route('clients.index')}
                                active={route().current('clients.*')}
                            >
                                {t('nav.clients')}
                            </ResponsiveNavLink>
                            <ResponsiveNavLink
                                href={route('settings.edit')}
                                active={route().current('settings.*')}
                            >
                                {t('nav.settings')}
                            </ResponsiveNavLink>
                            <ResponsiveNavLink
                                href={route('profile.edit')}
                                active={route().current('profile.edit')}
                            >
                                {t('nav.account')}
                            </ResponsiveNavLink>
                        </div>
                        <div className="border-t border-zinc-200 dark:border-zinc-800 px-4 py-3 bg-zinc-50 dark:bg-zinc-800/60">
                            <div className="text-sm font-medium text-zinc-800 dark:text-zinc-200">{user.name}</div>
                            <div className="text-xs text-zinc-500 dark:text-zinc-400">{user.email}</div>
                            <div className="mt-3">
                                <ResponsiveNavLink
                                    method="post"
                                    href={route('logout')}
                                    as="button"
                                    className="text-rose-600 dark:text-rose-400"
                                >
                                    {t('nav.logout')}
                                </ResponsiveNavLink>
                            </div>
                        </div>
                    </div>
                )}
            </nav>

            {/* Flash Message Banner */}
            {flash?.message && (
                <div className="bg-emerald-50 dark:bg-emerald-950/40 border-b border-emerald-200/80 dark:border-emerald-900/60 px-4 py-2.5 text-xs text-emerald-800 dark:text-emerald-200">
                    <div className="max-w-7xl mx-auto flex items-center gap-2">
                        <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" strokeWidth={1.75} />
                        <span>{flash.message}</span>
                    </div>
                </div>
            )}

            {/* Page Header */}
            {header && (
                <header className="border-b border-zinc-200/80 dark:border-zinc-800 bg-white dark:bg-zinc-900 transition-colors duration-200">
                    <div key={`header-${url}`} className="mx-auto max-w-7xl px-4 py-3.5 sm:px-6 lg:px-8 page-transition">
                        {header}
                    </div>
                </header>
            )}

            {/* Main Content with smooth SPA transition */}
            <main className="flex-1">
                <div key={url} className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8 page-transition">
                    {children}
                </div>
            </main>

            {/* Footer */}
            <footer className="border-t border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 py-4 mt-auto transition-colors duration-200">
                <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between text-xs text-zinc-500 dark:text-zinc-400 gap-2">
                    <div className="flex items-center gap-2">
                        <span className="font-medium text-zinc-700 dark:text-zinc-300">{t('brand.name')}</span>
                        <span>-</span>
                        <span>{t('brand.tagline')}</span>
                    </div>
                    <div>
                        <span>{t('nav.currency')}</span>
                    </div>
                </div>
            </footer>
        </div>
    );
}

'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import {
    LayoutDashboard,
    Truck,
    Map,
    Wrench,
    Users,
    BarChart,
    Settings,
    DollarSign,
    UserCog
} from 'lucide-react';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';

const navItems = [
    { name: 'Command Center', href: '/command-center', icon: LayoutDashboard },
    { name: 'Vehicles', href: '/vehicles', icon: Truck },
    { name: 'Drivers', href: '/drivers', icon: Users },
    { name: 'Trips', href: '/trips', icon: Map },
    { name: 'Maintenance', href: '/maintenance', icon: Wrench },
    { name: 'Expenses', href: '/expenses', icon: DollarSign },
    { name: 'Analytics', href: '/analytics', icon: BarChart },
    { name: 'Users', href: '/users', icon: UserCog, adminOnly: true },
];

export function Sidebar() {
    const pathname = usePathname();
    const { user } = useAuth();

    const filteredNavItems = navItems.filter(item => {
        if (item.adminOnly && user?.role !== 'ADMIN') {
            return false;
        }
        return true;
    });

    return (
        <div className="flex h-full w-64 flex-col border-r bg-gray-50 dark:bg-gray-900 border-gray-200 dark:border-gray-800">
            <div className="flex h-16 items-center flex-shrink-0 px-6 border-b border-gray-200 dark:border-gray-800">
                <Truck className="h-6 w-6 text-blue-600 dark:text-blue-500 mr-2" />
                <span className="text-xl font-bold tracking-tight text-gray-900 dark:text-white">FleetFlow</span>
            </div>

            <div className="flex-1 overflow-y-auto py-6 px-4">
                <nav className="space-y-1">
                    {filteredNavItems.map((item) => {
                        const isActive = pathname === item.href || pathname.startsWith(`${item.href}/`);
                        return (
                            <Link
                                key={item.name}
                                href={item.href}
                                className={`flex items-center group rounded-lg px-3 py-2 text-sm font-medium transition-colors ${isActive
                                    ? 'bg-blue-50 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400'
                                    : 'text-gray-700 hover:bg-gray-100 hover:text-gray-900 dark:text-gray-400 dark:hover:bg-gray-800 dark:hover:text-gray-50'
                                    }`}
                            >
                                <item.icon
                                    className={`flex-shrink-0 mr-3 h-5 w-5 ${isActive
                                        ? 'text-blue-700 dark:text-blue-400'
                                        : 'text-gray-400 group-hover:text-gray-500 dark:text-gray-500 dark:group-hover:text-gray-300'
                                        }`}
                                />
                                {item.name}
                            </Link>
                        )
                    })}
                </nav>
            </div>

            <div className="flex-shrink-0 border-t border-gray-200 dark:border-gray-800 p-4">
                <Link
                    href="/settings"
                    className="flex items-center group rounded-lg px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 hover:text-gray-900 dark:text-gray-400 dark:hover:bg-gray-800 dark:hover:text-gray-50 transition-colors"
                >
                    <Settings className="flex-shrink-0 mr-3 h-5 w-5 text-gray-400 group-hover:text-gray-500 dark:text-gray-500 dark:group-hover:text-gray-300" />
                    Settings
                </Link>
            </div>
        </div>
    );
}

'use client';

import { useEffect, useState } from 'react';
import { Loader2, TrendingUp, DollarSign, Truck, Users } from 'lucide-react';
import { analyticsApi } from '@/lib/api/analytics';

export default function AnalyticsPage() {
    const [stats, setStats] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchAnalytics();
    }, []);

    const fetchAnalytics = async () => {
        try {
            const data = await analyticsApi.getDashboard();
            setStats(data);
        } catch (err) {
            console.error('Failed to load analytics', err);
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[60vh]">
                <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
            </div>
        );
    }

    return (
        <div className="space-y-6 max-w-7xl mx-auto">
            <div>
                <h1 className="text-2xl font-semibold text-gray-900 dark:text-white">Analytics</h1>
                <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                    Fleet performance metrics and insights.
                </p>
            </div>

            {/* Fleet Overview */}
            <div>
                <h2 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Fleet Overview</h2>
                <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
                    <div className="bg-white dark:bg-gray-950 overflow-hidden rounded-lg border border-gray-200 dark:border-gray-800 px-4 py-5 shadow-sm">
                        <div className="flex items-center">
                            <div className="flex-shrink-0 bg-blue-100 dark:bg-blue-900/30 rounded-md p-3">
                                <Truck className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                            </div>
                            <div className="ml-5 w-0 flex-1">
                                <dt className="text-sm font-medium text-gray-500 dark:text-gray-400 truncate">Total Vehicles</dt>
                                <dd className="text-2xl font-semibold text-gray-900 dark:text-white">
                                    {stats?.vehicles?.total || 0}
                                </dd>
                            </div>
                        </div>
                    </div>
                    
                    <div className="bg-white dark:bg-gray-950 overflow-hidden rounded-lg border border-gray-200 dark:border-gray-800 px-4 py-5 shadow-sm">
                        <div className="flex items-center">
                            <div className="flex-shrink-0 bg-green-100 dark:bg-green-900/30 rounded-md p-3">
                                <Users className="h-6 w-6 text-green-600 dark:text-green-400" />
                            </div>
                            <div className="ml-5 w-0 flex-1">
                                <dt className="text-sm font-medium text-gray-500 dark:text-gray-400 truncate">Total Drivers</dt>
                                <dd className="text-2xl font-semibold text-gray-900 dark:text-white">
                                    {stats?.drivers?.total || 0}
                                </dd>
                            </div>
                        </div>
                    </div>

                    <div className="bg-white dark:bg-gray-950 overflow-hidden rounded-lg border border-gray-200 dark:border-gray-800 px-4 py-5 shadow-sm">
                        <div className="flex items-center">
                            <div className="flex-shrink-0 bg-purple-100 dark:bg-purple-900/30 rounded-md p-3">
                                <TrendingUp className="h-6 w-6 text-purple-600 dark:text-purple-400" />
                            </div>
                            <div className="ml-5 w-0 flex-1">
                                <dt className="text-sm font-medium text-gray-500 dark:text-gray-400 truncate">Total Trips</dt>
                                <dd className="text-2xl font-semibold text-gray-900 dark:text-white">
                                    {stats?.trips?.total || 0}
                                </dd>
                            </div>
                        </div>
                    </div>

                    <div className="bg-white dark:bg-gray-950 overflow-hidden rounded-lg border border-gray-200 dark:border-gray-800 px-4 py-5 shadow-sm">
                        <div className="flex items-center">
                            <div className="flex-shrink-0 bg-yellow-100 dark:bg-yellow-900/30 rounded-md p-3">
                                <DollarSign className="h-6 w-6 text-yellow-600 dark:text-yellow-400" />
                            </div>
                            <div className="ml-5 w-0 flex-1">
                                <dt className="text-sm font-medium text-gray-500 dark:text-gray-400 truncate">Op. Costs (30d)</dt>
                                <dd className="text-2xl font-semibold text-gray-900 dark:text-white">
                                    ${stats?.financial?.total_operational_cost_30d?.toLocaleString() || 0}
                                </dd>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Financial Summary */}
            <div>
                <h2 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Financial Summary (Last 30 Days)</h2>
                <div className="grid grid-cols-1 gap-5 sm:grid-cols-3">
                    <div className="bg-white dark:bg-gray-950 px-4 py-5 border border-gray-200 dark:border-gray-800 rounded-lg">
                        <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">Fuel Costs</dt>
                        <dd className="mt-1 text-3xl font-semibold text-gray-900 dark:text-white">
                            ${stats?.financial?.fuel_cost_30d?.toLocaleString() || 0}
                        </dd>
                    </div>
                    <div className="bg-white dark:bg-gray-950 px-4 py-5 border border-gray-200 dark:border-gray-800 rounded-lg">
                        <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">Maintenance Costs</dt>
                        <dd className="mt-1 text-3xl font-semibold text-gray-900 dark:text-white">
                            ${stats?.financial?.maintenance_cost_30d?.toLocaleString() || 0}
                        </dd>
                    </div>
                    <div className="bg-white dark:bg-gray-950 px-4 py-5 border border-gray-200 dark:border-gray-800 rounded-lg">
                        <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">Other Costs</dt>
                        <dd className="mt-1 text-3xl font-semibold text-gray-900 dark:text-white">
                            ${stats?.financial?.other_cost_30d?.toLocaleString() || 0}
                        </dd>
                    </div>
                </div>
            </div>

            {/* Trip Analytics */}
            <div>
                <h2 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Trip Performance</h2>
                <div className="bg-white dark:bg-gray-950 border border-gray-200 dark:border-gray-800 rounded-lg p-6">
                    <dl className="grid grid-cols-1 gap-5 sm:grid-cols-3">
                        <div>
                            <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">Active Trips</dt>
                            <dd className="mt-1 text-2xl font-semibold text-blue-600 dark:text-blue-400">
                                {stats?.trips?.active || 0}
                            </dd>
                        </div>
                        <div>
                            <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">Completed Today</dt>
                            <dd className="mt-1 text-2xl font-semibold text-green-600 dark:text-green-400">
                                {stats?.trips?.completed_today || 0}
                            </dd>
                        </div>
                        <div>
                            <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">Pending Cargo</dt>
                            <dd className="mt-1 text-2xl font-semibold text-yellow-600 dark:text-yellow-400">
                                {stats?.trips?.pending_cargo_tons || 0} tons
                            </dd>
                        </div>
                    </dl>
                </div>
            </div>

            {/* Driver Performance */}
            <div>
                <h2 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Driver Performance</h2>
                <div className="bg-white dark:bg-gray-950 border border-gray-200 dark:border-gray-800 rounded-lg p-6">
                    <dl className="grid grid-cols-1 gap-5 sm:grid-cols-3">
                        <div>
                            <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">On Duty</dt>
                            <dd className="mt-1 text-2xl font-semibold text-green-600 dark:text-green-400">
                                {stats?.drivers?.on_duty || 0}
                            </dd>
                        </div>
                        <div>
                            <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">On Trip</dt>
                            <dd className="mt-1 text-2xl font-semibold text-blue-600 dark:text-blue-400">
                                {stats?.drivers?.on_trip || 0}
                            </dd>
                        </div>
                        <div>
                            <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">Avg Safety Score</dt>
                            <dd className="mt-1 text-2xl font-semibold text-gray-900 dark:text-white">
                                {stats?.drivers?.avg_safety_score?.toFixed(1) || 0}/100
                            </dd>
                        </div>
                    </dl>
                </div>
            </div>
        </div>
    );
}

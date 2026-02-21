'use client';

import { useEffect, useState } from 'react';
import {
    TrendingUp,
    DollarSign,
    Truck,
    Users,
    Loader2,
    BarChart3,
    Activity
} from 'lucide-react';
import { analyticsApi } from '@/lib/api/analytics';

interface DashboardData {
    fleet: {
        total_vehicles: number;
        active_vehicles: number;
        vehicles_on_trip: number;
        vehicles_in_maintenance: number;
        utilization_rate: number;
    };
    trips: {
        total_trips: number;
        completed_trips: number;
        in_progress_trips: number;
        completion_rate: number;
    };
    drivers: {
        total_drivers: number;
        active_drivers: number;
        on_trip: number;
        average_safety_score: number;
    };
    financial: {
        total_fuel_cost: number;
        total_maintenance_cost: number;
        total_operational_cost: number;
    };
}

export default function AnalyticsPage() {
    const [data, setData] = useState<DashboardData | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        fetchAnalytics();
    }, []);

    const fetchAnalytics = async () => {
        try {
            setLoading(true);
            const analyticsData = await analyticsApi.getDashboard();
            setData(analyticsData);
            setError(null);
        } catch (err: any) {
            setError(err.message || 'Failed to load analytics');
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <Loader2 className="h-12 w-12 animate-spin text-blue-600" />
            </div>
        );
    }

    if (error || !data) {
        return (
            <div className="max-w-7xl mx-auto py-6">
                <div className="rounded-md bg-red-50 dark:bg-red-900/10 p-4">
                    <p className="text-sm text-red-800 dark:text-red-400">{error || 'No data available'}</p>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-6 max-w-7xl mx-auto">
            <div>
                <h1 className="text-2xl font-semibold text-gray-900 dark:text-white">Analytics & Reports</h1>
                <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                    Comprehensive fleet performance metrics and operational insights.
                </p>
            </div>

            {/* Fleet Overview */}
            <div>
                <h2 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Fleet Overview</h2>
                <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
                    <div className="bg-white dark:bg-gray-950 overflow-hidden shadow rounded-lg border border-gray-200 dark:border-gray-800">
                        <div className="p-5">
                            <div className="flex items-center">
                                <div className="flex-shrink-0">
                                    <Truck className="h-6 w-6 text-blue-600" />
                                </div>
                                <div className="ml-5 w-0 flex-1">
                                    <dl>
                                        <dt className="text-sm font-medium text-gray-500 dark:text-gray-400 truncate">
                                            Total Vehicles
                                        </dt>
                                        <dd className="text-3xl font-semibold text-gray-900 dark:text-white">
                                            {data.fleet.total_vehicles}
                                        </dd>
                                    </dl>
                                </div>
                            </div>
                        </div>
                        <div className="bg-gray-50 dark:bg-gray-900/50 px-5 py-3">
                            <div className="text-sm">
                                <span className="text-gray-600 dark:text-gray-400">
                                    {data.fleet.active_vehicles} active
                                </span>
                            </div>
                        </div>
                    </div>

                    <div className="bg-white dark:bg-gray-950 overflow-hidden shadow rounded-lg border border-gray-200 dark:border-gray-800">
                        <div className="p-5">
                            <div className="flex items-center">
                                <div className="flex-shrink-0">
                                    <Activity className="h-6 w-6 text-green-600" />
                                </div>
                                <div className="ml-5 w-0 flex-1">
                                    <dl>
                                        <dt className="text-sm font-medium text-gray-500 dark:text-gray-400 truncate">
                                            Utilization Rate
                                        </dt>
                                        <dd className="text-3xl font-semibold text-gray-900 dark:text-white">
                                            {data.fleet.utilization_rate.toFixed(1)}%
                                        </dd>
                                    </dl>
                                </div>
                            </div>
                        </div>
                        <div className="bg-gray-50 dark:bg-gray-900/50 px-5 py-3">
                            <div className="text-sm">
                                <span className="text-gray-600 dark:text-gray-400">
                                    {data.fleet.vehicles_on_trip} on trip
                                </span>
                            </div>
                        </div>
                    </div>

                    <div className="bg-white dark:bg-gray-950 overflow-hidden shadow rounded-lg border border-gray-200 dark:border-gray-800">
                        <div className="p-5">
                            <div className="flex items-center">
                                <div className="flex-shrink-0">
                                    <Users className="h-6 w-6 text-purple-600" />
                                </div>
                                <div className="ml-5 w-0 flex-1">
                                    <dl>
                                        <dt className="text-sm font-medium text-gray-500 dark:text-gray-400 truncate">
                                            Active Drivers
                                        </dt>
                                        <dd className="text-3xl font-semibold text-gray-900 dark:text-white">
                                            {data.drivers.active_drivers}
                                        </dd>
                                    </dl>
                                </div>
                            </div>
                        </div>
                        <div className="bg-gray-50 dark:bg-gray-900/50 px-5 py-3">
                            <div className="text-sm">
                                <span className="text-gray-600 dark:text-gray-400">
                                    Avg safety: {data.drivers.average_safety_score.toFixed(0)}/100
                                </span>
                            </div>
                        </div>
                    </div>

                    <div className="bg-white dark:bg-gray-950 overflow-hidden shadow rounded-lg border border-gray-200 dark:border-gray-800">
                        <div className="p-5">
                            <div className="flex items-center">
                                <div className="flex-shrink-0">
                                    <BarChart3 className="h-6 w-6 text-orange-600" />
                                </div>
                                <div className="ml-5 w-0 flex-1">
                                    <dl>
                                        <dt className="text-sm font-medium text-gray-500 dark:text-gray-400 truncate">
                                            Trip Completion
                                        </dt>
                                        <dd className="text-3xl font-semibold text-gray-900 dark:text-white">
                                            {data.trips.completion_rate.toFixed(1)}%
                                        </dd>
                                    </dl>
                                </div>
                            </div>
                        </div>
                        <div className="bg-gray-50 dark:bg-gray-900/50 px-5 py-3">
                            <div className="text-sm">
                                <span className="text-gray-600 dark:text-gray-400">
                                    {data.trips.completed_trips} completed
                                </span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Financial Overview */}
            <div>
                <h2 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Financial Overview</h2>
                <div className="grid grid-cols-1 gap-5 sm:grid-cols-3">
                    <div className="bg-white dark:bg-gray-950 overflow-hidden shadow rounded-lg border border-gray-200 dark:border-gray-800">
                        <div className="p-5">
                            <div className="flex items-center">
                                <div className="flex-shrink-0">
                                    <DollarSign className="h-6 w-6 text-blue-600" />
                                </div>
                                <div className="ml-5 w-0 flex-1">
                                    <dl>
                                        <dt className="text-sm font-medium text-gray-500 dark:text-gray-400 truncate">
                                            Fuel Costs
                                        </dt>
                                        <dd className="text-2xl font-semibold text-gray-900 dark:text-white">
                                            ${data.financial.total_fuel_cost.toLocaleString()}
                                        </dd>
                                    </dl>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="bg-white dark:bg-gray-950 overflow-hidden shadow rounded-lg border border-gray-200 dark:border-gray-800">
                        <div className="p-5">
                            <div className="flex items-center">
                                <div className="flex-shrink-0">
                                    <DollarSign className="h-6 w-6 text-green-600" />
                                </div>
                                <div className="ml-5 w-0 flex-1">
                                    <dl>
                                        <dt className="text-sm font-medium text-gray-500 dark:text-gray-400 truncate">
                                            Maintenance Costs
                                        </dt>
                                        <dd className="text-2xl font-semibold text-gray-900 dark:text-white">
                                            ${data.financial.total_maintenance_cost.toLocaleString()}
                                        </dd>
                                    </dl>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="bg-white dark:bg-gray-950 overflow-hidden shadow rounded-lg border border-gray-200 dark:border-gray-800">
                        <div className="p-5">
                            <div className="flex items-center">
                                <div className="flex-shrink-0">
                                    <TrendingUp className="h-6 w-6 text-purple-600" />
                                </div>
                                <div className="ml-5 w-0 flex-1">
                                    <dl>
                                        <dt className="text-sm font-medium text-gray-500 dark:text-gray-400 truncate">
                                            Total Operational Cost
                                        </dt>
                                        <dd className="text-2xl font-semibold text-gray-900 dark:text-white">
                                            ${data.financial.total_operational_cost.toLocaleString()}
                                        </dd>
                                    </dl>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Trip Statistics */}
            <div>
                <h2 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Trip Statistics</h2>
                <div className="bg-white dark:bg-gray-950 shadow rounded-lg border border-gray-200 dark:border-gray-800">
                    <div className="p-6">
                        <dl className="grid grid-cols-1 gap-5 sm:grid-cols-3">
                            <div className="px-4 py-5 bg-gray-50 dark:bg-gray-900/50 shadow rounded-lg overflow-hidden border border-gray-200 dark:border-gray-800">
                                <dt className="text-sm font-medium text-gray-500 dark:text-gray-400 truncate">Total Trips</dt>
                                <dd className="mt-1 text-3xl font-semibold text-gray-900 dark:text-white">{data.trips.total_trips}</dd>
                            </div>
                            <div className="px-4 py-5 bg-gray-50 dark:bg-gray-900/50 shadow rounded-lg overflow-hidden border border-gray-200 dark:border-gray-800">
                                <dt className="text-sm font-medium text-gray-500 dark:text-gray-400 truncate">In Progress</dt>
                                <dd className="mt-1 text-3xl font-semibold text-blue-600 dark:text-blue-400">{data.trips.in_progress_trips}</dd>
                            </div>
                            <div className="px-4 py-5 bg-gray-50 dark:bg-gray-900/50 shadow rounded-lg overflow-hidden border border-gray-200 dark:border-gray-800">
                                <dt className="text-sm font-medium text-gray-500 dark:text-gray-400 truncate">Completed</dt>
                                <dd className="mt-1 text-3xl font-semibold text-green-600 dark:text-green-400">{data.trips.completed_trips}</dd>
                            </div>
                        </dl>
                    </div>
                </div>
            </div>
        </div>
    );
}

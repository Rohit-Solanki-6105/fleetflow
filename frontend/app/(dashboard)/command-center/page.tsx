import {
    Truck,
    Map,
    AlertOctagon,
    TrendingUp,
    Activity,
    Wrench
} from 'lucide-react';

export default function CommandCenterPage() {
    return (
        <div className="space-y-6 max-w-7xl mx-auto">
            <div>
                <h1 className="text-2xl font-semibold text-gray-900 dark:text-white">Command Center</h1>
                <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                    Real-time overview of fleet operations and logistics.
                </p>
            </div>

            {/* KPI Stats Row */}
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
                {/* Active Fleet */}
                <div className="overflow-hidden rounded-lg bg-white dark:bg-gray-950 px-4 py-5 shadow-sm sm:p-6 border border-gray-100 dark:border-gray-800">
                    <div className="flex justify-between items-start">
                        <div>
                            <p className="truncate text-sm font-medium text-gray-500 dark:text-gray-400">Active Fleet</p>
                            <p className="mt-1 text-3xl font-semibold tracking-tight text-gray-900 dark:text-white">42</p>
                        </div>
                        <div className="rounded-md bg-blue-100 dark:bg-blue-900/30 p-2">
                            <Truck className="h-5 w-5 text-blue-600 dark:text-blue-400" aria-hidden="true" />
                        </div>
                    </div>
                    <p className="mt-2 text-sm text-green-600 dark:text-green-400 flex items-center">
                        <TrendingUp className="h-4 w-4 mr-1" />
                        <span className="font-medium">+4%</span>
                        <span className="ml-2 text-gray-500">from yesterday</span>
                    </p>
                </div>

                {/* Pending Cargo */}
                <div className="overflow-hidden rounded-lg bg-white dark:bg-gray-950 px-4 py-5 shadow-sm sm:p-6 border border-gray-100 dark:border-gray-800">
                    <div className="flex justify-between items-start">
                        <div>
                            <p className="truncate text-sm font-medium text-gray-500 dark:text-gray-400">Pending Cargo</p>
                            <p className="mt-1 text-3xl font-semibold tracking-tight text-gray-900 dark:text-white">1,240 <span className="text-lg text-gray-500">tons</span></p>
                        </div>
                        <div className="rounded-md bg-indigo-100 dark:bg-indigo-900/30 p-2">
                            <Map className="h-5 w-5 text-indigo-600 dark:text-indigo-400" aria-hidden="true" />
                        </div>
                    </div>
                    <p className="mt-2 text-sm text-gray-500 dark:text-gray-400 flex items-center">
                        Across 14 regions
                    </p>
                </div>

                {/* Maintenance Alerts */}
                <div className="overflow-hidden rounded-lg bg-white dark:bg-gray-950 px-4 py-5 shadow-sm sm:p-6 border border-gray-100 dark:border-gray-800">
                    <div className="flex justify-between items-start">
                        <div>
                            <p className="truncate text-sm font-medium text-gray-500 dark:text-gray-400">In Shop</p>
                            <p className="mt-1 text-3xl font-semibold tracking-tight text-red-600 dark:text-red-500">3</p>
                        </div>
                        <div className="rounded-md bg-red-100 dark:bg-red-900/30 p-2">
                            <AlertOctagon className="h-5 w-5 text-red-600 dark:text-red-400" aria-hidden="true" />
                        </div>
                    </div>
                    <p className="mt-2 text-sm text-gray-500 dark:text-gray-400 flex items-center">
                        Requires attention
                    </p>
                </div>

                {/* Utilization Rate */}
                <div className="overflow-hidden rounded-lg bg-white dark:bg-gray-950 px-4 py-5 shadow-sm sm:p-6 border border-gray-100 dark:border-gray-800">
                    <div className="flex justify-between items-start">
                        <div>
                            <p className="truncate text-sm font-medium text-gray-500 dark:text-gray-400">Utilization Rate</p>
                            <p className="mt-1 text-3xl font-semibold tracking-tight text-gray-900 dark:text-white">88%</p>
                        </div>
                        <div className="rounded-md bg-emerald-100 dark:bg-emerald-900/30 p-2">
                            <Activity className="h-5 w-5 text-emerald-600 dark:text-emerald-400" aria-hidden="true" />
                        </div>
                    </div>
                    <p className="mt-2 text-sm text-gray-500 dark:text-gray-400 flex items-center">
                        Optimized
                    </p>
                </div>
            </div>

            {/* Main Content Area */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-8">
                {/* Active Map / Graph Placeholder */}
                <div className="lg:col-span-2 bg-white dark:bg-gray-950 rounded-lg shadow-sm border border-gray-100 dark:border-gray-800 p-6 flex flex-col items-center justify-center min-h-[400px]">
                    <Map className="h-16 w-16 text-gray-200 dark:text-gray-800 mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 dark:text-white">Live Fleet Map</h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Geospatial visualization loading...</p>
                </div>

                {/* Urgent Alerts / Active Feed list */}
                <div className="bg-white dark:bg-gray-950 rounded-lg shadow-sm border border-gray-100 dark:border-gray-800 p-6">
                    <h3 className="text-base font-semibold text-gray-900 dark:text-white mb-4">Urgent Alerts</h3>
                    <ul className="space-y-4">
                        <li className="flex items-start">
                            <div className="flex-shrink-0">
                                <span className="flex h-8 w-8 items-center justify-center rounded-full bg-red-100 dark:bg-red-900/30">
                                    <AlertOctagon className="h-4 w-4 text-red-600 dark:text-red-400" />
                                </span>
                            </div>
                            <div className="ml-3">
                                <p className="text-sm font-medium text-gray-900 dark:text-white">VH-992 Engine Light</p>
                                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Reported 12 mins ago. Currently on routing via I-95.</p>
                            </div>
                        </li>
                        <li className="flex items-start">
                            <div className="flex-shrink-0">
                                <span className="flex h-8 w-8 items-center justify-center rounded-full bg-yellow-100 dark:bg-yellow-900/30">
                                    <Wrench className="h-4 w-4 text-yellow-600 dark:text-yellow-400" />
                                </span>
                            </div>
                            <div className="ml-3">
                                <p className="text-sm font-medium text-gray-900 dark:text-white">Scheduled Maintenance</p>
                                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">VH-104 due for 50k mile service tomorrow.</p>
                            </div>
                        </li>
                    </ul>
                </div>
            </div>
        </div>
    );
}

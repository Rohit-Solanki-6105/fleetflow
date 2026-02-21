'use client';

import { useEffect, useState } from 'react';
import {
    Plus,
    Search,
    MoreVertical,
    Filter,
    Loader2,
    Edit,
    Trash2
} from 'lucide-react';
import { vehicleApi, Vehicle } from '@/lib/api/vehicles';

export default function VehiclesPage() {
    const [vehicles, setVehicles] = useState<Vehicle[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        fetchVehicles();
    }, []);

    const fetchVehicles = async () => {
        try {
            setLoading(true);
            const data = await vehicleApi.getAll();
            setVehicles(data);
            setError(null);
        } catch (err: any) {
            setError(err.message || 'Failed to load vehicles');
        } finally {
            setLoading(false);
        }
    };

    const filteredVehicles = vehicles.filter(vehicle =>
        vehicle.vehicle_id.toLowerCase().includes(searchTerm.toLowerCase()) ||
        vehicle.license_plate.toLowerCase().includes(searchTerm.toLowerCase()) ||
        vehicle.make.toLowerCase().includes(searchTerm.toLowerCase()) ||
        vehicle.model.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'AVAILABLE':
                return 'bg-green-50 text-green-700 ring-green-600/20 dark:bg-green-900/20 dark:text-green-400 dark:ring-green-500/20';
            case 'ON_TRIP':
                return 'bg-blue-50 text-blue-700 ring-blue-600/20 dark:bg-blue-900/20 dark:text-blue-400 dark:ring-blue-500/20';
            case 'IN_SHOP':
                return 'bg-red-50 text-red-700 ring-red-600/20 dark:bg-red-900/20 dark:text-red-400 dark:ring-red-500/20';
            case 'RETIRED':
                return 'bg-gray-50 text-gray-600 ring-gray-500/10 dark:bg-gray-800 dark:text-gray-400 dark:ring-gray-700';
            default:
                return 'bg-gray-50 text-gray-600 ring-gray-500/10 dark:bg-gray-800 dark:text-gray-400 dark:ring-gray-700';
        }
    };

    const getStatusLabel = (status: string) => {
        return status.replace('_', ' ').toLowerCase().replace(/\b\w/g, l => l.toUpperCase());
    };

    return (
        <div className="space-y-6 max-w-7xl mx-auto">
            <div className="sm:flex sm:items-center sm:justify-between">
                <div>
                    <h1 className="text-2xl font-semibold text-gray-900 dark:text-white">Vehicle Registry</h1>
                    <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                        Manage your fleet data, capacities, and active availability statuses.
                    </p>
                </div>
                <div className="mt-4 sm:ml-16 sm:mt-0 sm:flex-none">
                    <button
                        type="button"
                        className="inline-flex items-center justify-center rounded-md bg-blue-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-blue-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600 transition-colors"
                    >
                        <Plus className="h-4 w-4 mr-1.5" />
                        Add Vehicle
                    </button>
                </div>
            </div>

            {/* Toolbar */}
            <div className="flex flex-col sm:flex-row gap-4 items-center justify-between bg-white dark:bg-gray-950 p-4 border border-gray-100 dark:border-gray-800 rounded-lg shadow-sm">
                <div className="relative w-full sm:max-w-xs">
                    <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                        <Search className="h-4 w-4 text-gray-400" aria-hidden="true" />
                    </div>
                    <input
                        type="text"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="block w-full rounded-md border-0 py-1.5 pl-10 pr-3 text-gray-900 dark:text-gray-100 ring-1 ring-inset ring-gray-300 dark:ring-gray-700 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-blue-600 sm:text-sm sm:leading-6 dark:bg-gray-900 bg-gray-50 bg-opacity-50"
                        placeholder="Search by ID, plate, or model..."
                    />
                </div>

                <div className="flex items-center gap-2">
                    <button className="inline-flex items-center gap-x-1.5 rounded-md bg-white dark:bg-gray-900 px-3 py-2 text-sm font-semibold text-gray-900 dark:text-gray-300 shadow-sm ring-1 ring-inset ring-gray-300 dark:ring-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
                        <Filter className="-ml-0.5 h-4 w-4" aria-hidden="true" />
                        Filter
                    </button>
                </div>
            </div>

            {/* Table */}
            {loading ? (
                <div className="flex items-center justify-center min-h-[400px]">
                    <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
                </div>
            ) : error ? (
                <div className="rounded-md bg-red-50 dark:bg-red-900/10 p-4">
                    <p className="text-sm text-red-800 dark:text-red-400">{error}</p>
                </div>
            ) : filteredVehicles.length === 0 ? (
                <div className="text-center py-12 bg-white dark:bg-gray-950 rounded-lg border border-gray-200 dark:border-gray-800">
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                        {searchTerm ? 'No vehicles found matching your search.' : 'No vehicles in the system yet.'}
                    </p>
                </div>
            ) : (
                <div className="mt-8 flow-root">
                <div className="-mx-4 -my-2 overflow-x-auto sm:-mx-6 lg:-mx-8">
                    <div className="inline-block min-w-full py-2 align-middle sm:px-6 lg:px-8">
                        <div className="overflow-hidden shadow ring-1 ring-black ring-opacity-5 sm:rounded-lg border border-gray-200 dark:border-gray-800">
                            <table className="min-w-full divide-y divide-gray-300 dark:divide-gray-800">
                                <thead className="bg-gray-50 dark:bg-gray-900/50">
                                    <tr>
                                        <th scope="col" className="py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-gray-900 dark:text-gray-200 sm:pl-6">Vehicle ID</th>
                                        <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900 dark:text-gray-200">Make/Model</th>
                                        <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900 dark:text-gray-200">License Plate</th>
                                        <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900 dark:text-gray-200">Year</th>
                                        <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900 dark:text-gray-200">Capacity (kg)</th>
                                        <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900 dark:text-gray-200">Status</th>
                                        <th scope="col" className="relative py-3.5 pl-3 pr-4 sm:pr-6">
                                            <span className="sr-only">Actions</span>
                                        </th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-200 dark:divide-gray-800 bg-white dark:bg-gray-950">
                                    {filteredVehicles.map((vehicle) => (
                                        <tr key={vehicle.id} className="hover:bg-gray-50 dark:hover:bg-gray-900/50 transition-colors">
                                            <td className="whitespace-nowrap py-4 pl-4 pr-3 text-sm font-medium text-gray-900 dark:text-white sm:pl-6">
                                                {vehicle.vehicle_id}
                                            </td>
                                            <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500 dark:text-gray-400">
                                                {vehicle.make} {vehicle.model}
                                            </td>
                                            <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500 dark:text-gray-400">
                                                {vehicle.license_plate}
                                            </td>
                                            <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500 dark:text-gray-400">
                                                {vehicle.year}
                                            </td>
                                            <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500 dark:text-gray-400">
                                                {vehicle.max_capacity_kg.toLocaleString()}
                                            </td>
                                            <td className="whitespace-nowrap px-3 py-4 text-sm">
                                                <span className={`inline-flex items-center rounded-md px-2 py-1 text-xs font-medium ring-1 ring-inset ${getStatusColor(vehicle.status)}`}>
                                                    {getStatusLabel(vehicle.status)}
                                                </span>
                                            </td>
                                            <td className="relative whitespace-nowrap py-4 pl-3 pr-4 text-right text-sm font-medium sm:pr-6">
                                                <button className="text-gray-400 hover:text-gray-500 dark:hover:text-gray-300">
                                                    <MoreVertical className="h-5 w-5" />
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
                </div>
            )}
        </div>
    );
}

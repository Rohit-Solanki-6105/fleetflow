'use client';

import { useEffect, useState } from 'react';
import {
    Plus,
    Search,
    Filter,
    Loader2,
    Wrench,
    Calendar,
    DollarSign
} from 'lucide-react';
import { maintenanceApi, MaintenanceRecord } from '@/lib/api/maintenance';

export default function MaintenancePage() {
    const [records, setRecords] = useState<MaintenanceRecord[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [filterStatus, setFilterStatus] = useState<string>('all');

    useEffect(() => {
        fetchRecords();
    }, []);

    const fetchRecords = async () => {
        try {
            setLoading(true);
            const data = await maintenanceApi.getAll();
            setRecords(data);
            setError(null);
        } catch (err: any) {
            setError(err.message || 'Failed to load maintenance records');
        } finally {
            setLoading(false);
        }
    };

    const filteredRecords = records.filter(record => {
        const matchesSearch = 
            record.maintenance_id.toLowerCase().includes(searchTerm.toLowerCase()) ||
            record.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
            record.vehicle_name?.toLowerCase().includes(searchTerm.toLowerCase());
        
        const matchesStatus = filterStatus === 'all' || record.status === filterStatus;
        
        return matchesSearch && matchesStatus;
    });

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'SCHEDULED':
                return 'bg-blue-50 text-blue-700 ring-blue-600/20 dark:bg-blue-900/20 dark:text-blue-400 dark:ring-blue-500/20';
            case 'IN_PROGRESS':
                return 'bg-yellow-50 text-yellow-700 ring-yellow-600/20 dark:bg-yellow-900/20 dark:text-yellow-400 dark:ring-yellow-500/20';
            case 'COMPLETED':
                return 'bg-green-50 text-green-700 ring-green-600/20 dark:bg-green-900/20 dark:text-green-400 dark:ring-green-500/20';
            case 'CANCELLED':
                return 'bg-gray-50 text-gray-700 ring-gray-600/20 dark:bg-gray-900/20 dark:text-gray-400 dark:ring-gray-500/20';
            default:
                return 'bg-gray-50 text-gray-700 ring-gray-600/20 dark:bg-gray-900/20 dark:text-gray-400 dark:ring-gray-500/20';
        }
    };

    const getTypeColor = (type: string) => {
        switch (type) {
            case 'SCHEDULED':
                return 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300';
            case 'REPAIR':
                return 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300';
            case 'INSPECTION':
                return 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300';
            case 'EMERGENCY':
                return 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-300';
            default:
                return 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-300';
        }
    };

    const getStatusLabel = (status: string) => {
        return status.replace('_', ' ').toLowerCase().replace(/\b\w/g, l => l.toUpperCase());
    };

    const getTypeLabel = (type: string) => {
        return type.replace('_', ' ').toLowerCase().replace(/\b\w/g, l => l.toUpperCase());
    };

    return (
        <div className="space-y-6 max-w-7xl mx-auto">
            <div className="sm:flex sm:items-center sm:justify-between">
                <div>
                    <h1 className="text-2xl font-semibold text-gray-900 dark:text-white">Maintenance & Service</h1>
                    <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                        Track vehicle maintenance, repairs, and service schedules.
                    </p>
                </div>
                <div className="mt-4 sm:ml-16 sm:mt-0 sm:flex-none">
                    <button
                        type="button"
                        className="inline-flex items-center justify-center rounded-md bg-blue-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-blue-500 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600 transition-colors"
                    >
                        <Plus className="h-4 w-4 mr-1.5" />
                        Log Maintenance
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
                        placeholder="Search maintenance records..."
                    />
                </div>

                <div className="flex items-center gap-2">
                    <select
                        value={filterStatus}
                        onChange={(e) => setFilterStatus(e.target.value)}
                        className="rounded-md border-0 py-1.5 pl-3 pr-10 text-gray-900 dark:text-gray-100 ring-1 ring-inset ring-gray-300 dark:ring-gray-700 focus:ring-2 focus:ring-blue-600 sm:text-sm dark:bg-gray-900 bg-gray-50"
                    >
                        <option value="all">All Status</option>
                        <option value="SCHEDULED">Scheduled</option>
                        <option value="IN_PROGRESS">In Progress</option>
                        <option value="COMPLETED">Completed</option>
                        <option value="CANCELLED">Cancelled</option>
                    </select>
                    <button className="inline-flex items-center gap-x-1.5 rounded-md bg-white dark:bg-gray-900 px-3 py-2 text-sm font-semibold text-gray-900 dark:text-gray-300 shadow-sm ring-1 ring-inset ring-gray-300 dark:ring-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
                        <Filter className="-ml-0.5 h-4 w-4" aria-hidden="true" />
                        More Filters
                    </button>
                </div>
            </div>

            {/* Table */}
            {loading ? (
                <div className="flex items-center justify-center min-h-100">
                    <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
                </div>
            ) : error ? (
                <div className="rounded-md bg-red-50 dark:bg-red-900/10 p-4">
                    <p className="text-sm text-red-800 dark:text-red-400">{error}</p>
                </div>
            ) : filteredRecords.length === 0 ? (
                <div className="text-center py-12 bg-white dark:bg-gray-950 rounded-lg border border-gray-200 dark:border-gray-800">
                    <Wrench className="mx-auto h-12 w-12 text-gray-400" />
                    <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
                        {searchTerm ? 'No maintenance records found matching your search.' : 'No maintenance records yet.'}
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
                                            <th scope="col" className="py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-gray-900 dark:text-gray-200 sm:pl-6">Record ID</th>
                                            <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900 dark:text-gray-200">Vehicle</th>
                                            <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900 dark:text-gray-200">Type</th>
                                            <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900 dark:text-gray-200">Description</th>
                                            <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900 dark:text-gray-200">Service Date</th>
                                            <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900 dark:text-gray-200">Cost</th>
                                            <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900 dark:text-gray-200">Status</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-200 dark:divide-gray-800 bg-white dark:bg-gray-950">
                                        {filteredRecords.map((record) => (
                                            <tr key={record.id} className="hover:bg-gray-50 dark:hover:bg-gray-900/50 transition-colors">
                                                <td className="whitespace-nowrap py-4 pl-4 pr-3 text-sm font-medium text-gray-900 dark:text-white sm:pl-6">
                                                    {record.maintenance_id}
                                                </td>
                                                <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500 dark:text-gray-400">
                                                    {record.vehicle_name || `Vehicle #${record.vehicle}`}
                                                </td>
                                                <td className="whitespace-nowrap px-3 py-4 text-sm">
                                                    <span className={`inline-flex items-center rounded-md px-2 py-1 text-xs font-medium ${getTypeColor(record.maintenance_type)}`}>
                                                        {getTypeLabel(record.maintenance_type)}
                                                    </span>
                                                </td>
                                                <td className="px-3 py-4 text-sm text-gray-500 dark:text-gray-400 max-w-xs truncate">
                                                    {record.description}
                                                </td>
                                                <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500 dark:text-gray-400">
                                                    <div className="flex items-center">
                                                        <Calendar className="h-4 w-4 mr-1 text-gray-400" />
                                                        {new Date(record.service_date).toLocaleDateString()}
                                                    </div>
                                                </td>
                                                <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500 dark:text-gray-400">
                                                    <div className="flex items-center">
                                                        <DollarSign className="h-4 w-4 text-gray-400" />
                                                        {record.cost.toLocaleString()}
                                                    </div>
                                                </td>
                                                <td className="whitespace-nowrap px-3 py-4 text-sm">
                                                    <span className={`inline-flex items-center rounded-md px-2 py-1 text-xs font-medium ring-1 ring-inset ${getStatusColor(record.status)}`}>
                                                        {getStatusLabel(record.status)}
                                                    </span>
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

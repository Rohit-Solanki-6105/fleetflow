'use client';

import { useEffect, useState } from 'react';
import { Plus, Search, Loader2, Wrench, X } from 'lucide-react';
import { maintenanceApi, MaintenanceRecord } from '@/lib/api/maintenance';
import { vehicleApi } from '@/lib/api/vehicles';

const STATUSES = ['SCHEDULED', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED'];
const MAINTENANCE_TYPES = ['PREVENTIVE', 'REPAIR', 'INSPECTION', 'OIL_CHANGE', 'TIRE_SERVICE', 'BRAKE_SERVICE', 'ENGINE_REPAIR', 'OTHER'];

export default function MaintenancePage() {
    const [records, setRecords] = useState<MaintenanceRecord[]>([]);
    const [vehicles, setVehicles] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState<string>('');
    const [showModal, setShowModal] = useState(false);
    const [formData, setFormData] = useState({
        vehicle: 0,
        maintenance_type: 'OIL_CHANGE',
        description: '',
        service_provider: '',
        technician_name: '',
        scheduled_date: '',
        odometer_reading_km: 0,
        notes: '',
        status: 'SCHEDULED' as const,
    });
    const [formError, setFormError] = useState('');
    const [submitting, setSubmitting] = useState(false);

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            const [recordsData, vehiclesData] = await Promise.all([
                maintenanceApi.getAll(),
                vehicleApi.getAll()
            ]);
            setRecords(recordsData);
            setVehicles(vehiclesData);
        } catch (err) {
            console.error('Failed to load data', err);
        } finally {
            setLoading(false);
        }
    };

    const filteredRecords = records.filter(record => {
        const matchesSearch = record.record_id?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            record.vehicle_details?.vehicle_id?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            record.service_provider?.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesStatus = !statusFilter || record.status === statusFilter;
        return matchesSearch && matchesStatus;
    });

    const handleAdd = () => {
        setFormData({
            vehicle: 0,
            maintenance_type: 'OIL_CHANGE',
            description: '',
            service_provider: '',
            technician_name: '',
            scheduled_date: '',
            odometer_reading_km: 0,
            notes: '',
            status: 'SCHEDULED',
        });
        setShowModal(true);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setFormError('');
        setSubmitting(true);

        try {
            await maintenanceApi.create(formData);
            setShowModal(false);
            fetchData();
        } catch (err: any) {
            setFormError(err.response?.data?.detail || 'Failed to schedule maintenance');
        } finally {
            setSubmitting(false);
        }
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'COMPLETED': return 'bg-green-50 text-green-700 ring-green-600/20 dark:bg-green-900/20 dark:text-green-400';
            case 'IN_PROGRESS': return 'bg-blue-50 text-blue-700 ring-blue-600/20 dark:bg-blue-900/20 dark:text-blue-400';
            case 'SCHEDULED': return 'bg-yellow-50 text-yellow-700 ring-yellow-600/20 dark:bg-yellow-900/20 dark:text-yellow-400';
            case 'CANCELLED': return 'bg-red-50 text-red-700 ring-red-600/20 dark:bg-red-900/20 dark:text-red-400';
            default: return 'bg-gray-50 text-gray-600 ring-gray-500/10';
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
            <div className="sm:flex sm:items-center sm:justify-between">
                <div>
                    <h1 className="text-2xl font-semibold text-gray-900 dark:text-white">Maintenance</h1>
                    <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                        Schedule and track vehicle maintenance and repairs.
                    </p>
                </div>
                <button
                    onClick={handleAdd}
                    className="mt-4 inline-flex items-center rounded-md bg-blue-600 px-3 py-2 text-sm font-semibold text-white hover:bg-blue-500"
                >
                    <Plus className="h-4 w-4 mr-1.5" />
                    Schedule Maintenance
                </button>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-4">
                <div className="bg-white dark:bg-gray-950 px-4 py-5 border border-gray-200 dark:border-gray-800 rounded-lg">
                    <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">Total Records</dt>
                    <dd className="mt-1 text-3xl font-semibold text-gray-900 dark:text-white">{records.length}</dd>
                </div>
                <div className="bg-white dark:bg-gray-950 px-4 py-5 border border-gray-200 dark:border-gray-800 rounded-lg">
                    <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">Scheduled</dt>
                    <dd className="mt-1 text-3xl font-semibold text-yellow-600">{records.filter(r => r.status === 'SCHEDULED').length}</dd>
                </div>
                <div className="bg-white dark:bg-gray-950 px-4 py-5 border border-gray-200 dark:border-gray-800 rounded-lg">
                    <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">In Progress</dt>
                    <dd className="mt-1 text-3xl font-semibold text-blue-600">{records.filter(r => r.status === 'IN_PROGRESS').length}</dd>
                </div>
                <div className="bg-white dark:bg-gray-950 px-4 py-5 border border-gray-200 dark:border-gray-800 rounded-lg">
                    <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">Completed</dt>
                    <dd className="mt-1 text-3xl font-semibold text-green-600">{records.filter(r => r.status === 'COMPLETED').length}</dd>
                </div>
            </div>

            {/* Filters */}
            <div className="flex flex-col sm:flex-row gap-4">
                <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <input
                        type="text"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        placeholder="Search maintenance records..."
                        className="w-full pl-10 pr-4 py-2 rounded-md border border-gray-300 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-100"
                    />
                </div>
                <select
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                    className="px-4 py-2 rounded-md border border-gray-300 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-100"
                >
                    <option value="">All Statuses</option>
                    {STATUSES.map(status => (
                        <option key={status} value={status}>{status.replace('_', ' ')}</option>
                    ))}
                </select>
            </div>

            {/* Table */}
            <div className="bg-white dark:bg-gray-950 border border-gray-200 dark:border-gray-800 rounded-lg overflow-hidden">
                {filteredRecords.length === 0 ? (
                    <div className="p-12 text-center">
                        <Wrench className="mx-auto h-12 w-12 text-gray-400" />
                        <h3 className="mt-2 text-sm font-medium text-gray-900 dark:text-white">No maintenance records</h3>
                        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">Get started by scheduling maintenance.</p>
                    </div>
                ) : (
                    <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-800">
                        <thead className="bg-gray-50 dark:bg-gray-900">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Record ID</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Vehicle</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Type</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Scheduled Date</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Mechanic</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Status</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white dark:bg-gray-950 divide-y divide-gray-200 dark:divide-gray-800">
                            {filteredRecords.map((record) => (
                                <tr key={record.id} className="hover:bg-gray-50 dark:hover:bg-gray-900">
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">
                                        {record.record_id}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                                        {record.vehicle_details?.vehicle_id || record.vehicle}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                                        {record.maintenance_type.replace('_', ' ')}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                                        {new Date(record.scheduled_date).toLocaleDateString()}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                                        {record.technician_name || '-'}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <span className={`inline-flex rounded-full px-2 text-xs font-semibold leading-5 ${getStatusColor(record.status)}`}>
                                            {record.status.replace('_', ' ')}
                                        </span>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                )}
            </div>

            {/* Create Modal */}
            {showModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50 overflow-y-auto">
                    <div className="bg-white dark:bg-gray-950 rounded-lg max-w-lg w-full border border-gray-200 dark:border-gray-800 my-8 max-h-[90vh] flex flex-col">
                        <div className="p-6 border-b border-gray-200 dark:border-gray-800">
                            <div className="flex items-center justify-between">
                                <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Schedule Maintenance</h2>
                                <button onClick={() => setShowModal(false)} className="text-gray-400 hover:text-gray-500">
                                    <X className="h-5 w-5" />
                                </button>
                            </div>
                        </div>

                        <div className="flex-1 overflow-y-auto p-6">
                            {formError && (
                                <div className="mb-4 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-md">
                                    <p className="text-sm text-red-600 dark:text-red-400">{formError}</p>
                                </div>
                            )}

                            <form onSubmit={handleSubmit} className="space-y-4" id="maintenanceForm">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Vehicle *</label>
                                <select
                                    required
                                    value={formData.vehicle}
                                    onChange={(e) => setFormData({ ...formData, vehicle: parseInt(e.target.value) })}
                                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-md dark:bg-gray-900 dark:text-gray-100"
                                >
                                    <option value="0">Select Vehicle</option>
                                    {vehicles.map(v => (
                                        <option key={v.id} value={v.id}>{v.vehicle_id} - {v.make} {v.model}</option>
                                    ))}
                                </select>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Maintenance Type *</label>
                                <select
                                    value={formData.maintenance_type}
                                    onChange={(e) => setFormData({ ...formData, maintenance_type: e.target.value })}
                                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-md dark:bg-gray-900 dark:text-gray-100"
                                >
                                    {MAINTENANCE_TYPES.map(type => (
                                        <option key={type} value={type}>{type.replace('_', ' ')}</option>
                                    ))}
                                </select>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Description *</label>
                                <textarea
                                    required
                                    rows={2}
                                    value={formData.description}
                                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-md dark:bg-gray-900 dark:text-gray-100"
                                    placeholder="Brief description of the maintenance work"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Service Provider *</label>
                                <input
                                    type="text"
                                    required
                                    value={formData.service_provider}
                                    onChange={(e) => setFormData({ ...formData, service_provider: e.target.value })}
                                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-md dark:bg-gray-900 dark:text-gray-100"
                                    placeholder="e.g., ABC Auto Service"
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Technician Name</label>
                                    <input
                                        type="text"
                                        value={formData.technician_name}
                                        onChange={(e) => setFormData({ ...formData, technician_name: e.target.value })}
                                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-md dark:bg-gray-900 dark:text-gray-100"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Odometer (km) *</label>
                                    <input
                                        type="number"
                                        step="0.01"
                                        required
                                        value={formData.odometer_reading_km}
                                        onChange={(e) => setFormData({ ...formData, odometer_reading_km: parseFloat(e.target.value) })}
                                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-md dark:bg-gray-900 dark:text-gray-100"
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Scheduled Date *</label>
                                <input
                                    type="date"
                                    required
                                    value={formData.scheduled_date}
                                    onChange={(e) => setFormData({ ...formData, scheduled_date: e.target.value })}
                                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-md dark:bg-gray-900 dark:text-gray-100"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Notes</label>
                                <textarea
                                    rows={3}
                                    value={formData.notes}
                                    onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-md dark:bg-gray-900 dark:text-gray-100"
                                />
                            </div>
                            </form>
                        </div>

                        <div className="p-6 border-t border-gray-200 dark:border-gray-800">
                            <div className="flex gap-3">
                                <button
                                    type="button"
                                    onClick={() => setShowModal(false)}
                                    className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-md text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    form="maintenanceForm"
                                    disabled={submitting}
                                    className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-500 disabled:opacity-50"
                                >
                                    {submitting ? 'Scheduling...' : 'Schedule Maintenance'}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

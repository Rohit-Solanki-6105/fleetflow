'use client';

import { useEffect, useState } from 'react';
import { Plus, Search, Loader2, Edit, Trash2, X, MapPin } from 'lucide-react';
import { tripApi, Trip } from '@/lib/api/trips';
import { vehicleApi } from '@/lib/api/vehicles';
import { driverApi } from '@/lib/api/drivers';

const STATUSES = ['DRAFT', 'DISPATCHED', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED'];

export default function TripsPage() {
    const [trips, setTrips] = useState<Trip[]>([]);
    const [vehicles, setVehicles] = useState<any[]>([]);
    const [drivers, setDrivers] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState<string>('');
    const [showModal, setShowModal] = useState(false);
    const [editingTrip, setEditingTrip] = useState<Trip | null>(null);
    const [formData, setFormData] = useState<{
        trip_id: string;
        vehicle: number;
        driver: number;
        pickup_location: string;
        pickup_address: string;
        dropoff_location: string;
        dropoff_address: string;
        cargo_description: string;
        cargo_weight_kg: number;
        cargo_value: number;
        scheduled_pickup_time: string;
        scheduled_delivery_time: string;
        estimated_distance_km: number;
        status: 'DRAFT' | 'DISPATCHED' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED';
        notes: string;
    }>({
        trip_id: '',
        vehicle: 0,
        driver: 0,
        pickup_location: '',
        pickup_address: '',
        dropoff_location: '',
        dropoff_address: '',
        cargo_description: '',
        cargo_weight_kg: 0,
        cargo_value: 0,
        scheduled_pickup_time: '',
        scheduled_delivery_time: '',
        estimated_distance_km: 0,
        status: 'DRAFT',
        notes: '',
    });
    const [formError, setFormError] = useState('');
    const [submitting, setSubmitting] = useState(false);

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            const [tripsData, vehiclesData, driversData] = await Promise.all([
                tripApi.getAll(),
                vehicleApi.getAll(),
                driverApi.getAll()
            ]);
            setTrips(tripsData);
            setVehicles(vehiclesData);
            setDrivers(driversData);
        } catch (err) {
            console.error('Failed to load data', err);
        } finally {
            setLoading(false);
        }
    };

    const filteredTrips = trips.filter(trip => {
        const matchesSearch = trip.trip_id?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            trip.pickup_location?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            trip.dropoff_location?.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesStatus = !statusFilter || trip.status === statusFilter;
        return matchesSearch && matchesStatus;
    });

    const handleEdit = (trip: Trip) => {
        setEditingTrip(trip);
        setFormData({
            trip_id: trip.trip_id,
            vehicle: trip.vehicle,
            driver: trip.driver,
            pickup_location: trip.pickup_location,
            pickup_address: trip.pickup_address,
            dropoff_location: trip.dropoff_location,
            dropoff_address: trip.dropoff_address,
            cargo_description: trip.cargo_description,
            cargo_weight_kg: trip.cargo_weight_kg,
            cargo_value: trip.cargo_value || 0,
            scheduled_pickup_time: trip.scheduled_pickup_time?.slice(0, 16) || '',
            scheduled_delivery_time: trip.scheduled_delivery_time?.slice(0, 16) || '',
            estimated_distance_km: trip.estimated_distance_km || 0,
            status: trip.status,
            notes: trip.notes || '',
        });
        setShowModal(true);
    };

    const handleAdd = () => {
        setEditingTrip(null);
        setFormData({
            trip_id: '',
            vehicle: 0,
            driver: 0,
            pickup_location: '',
            pickup_address: '',
            dropoff_location: '',
            dropoff_address: '',
            cargo_description: '',
            cargo_weight_kg: 0,
            cargo_value: 0,
            scheduled_pickup_time: '',
            scheduled_delivery_time: '',
            estimated_distance_km: 0,
            status: 'DRAFT',
            notes: '',
        });
        setShowModal(true);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setFormError('');
        setSubmitting(true);

        try {
            if (editingTrip) {
                await tripApi.update(editingTrip.id, formData);
            } else {
                // Exclude trip_id when creating - let backend auto-generate it
                const { trip_id, ...createData } = formData;
                await tripApi.create(createData);
            }
            setShowModal(false);
            fetchData();
        } catch (err: any) {
            setFormError(err.response?.data?.detail || 'Failed to save trip');
        } finally {
            setSubmitting(false);
        }
    };

    const handleDelete = async (id: number) => {
        if (!confirm('Are you sure you want to delete this trip?')) return;
        try {
            await tripApi.delete(id);
            fetchData();
        } catch (err: any) {
            alert(err.response?.data?.detail || 'Failed to delete trip');
        }
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'DRAFT': return 'bg-gray-50 text-gray-600 ring-gray-500/10 dark:bg-gray-800 dark:text-gray-400';
            case 'DISPATCHED': return 'bg-yellow-50 text-yellow-700 ring-yellow-600/20 dark:bg-yellow-900/20 dark:text-yellow-400';
            case 'IN_PROGRESS': return 'bg-blue-50 text-blue-700 ring-blue-600/20 dark:bg-blue-900/20 dark:text-blue-400';
            case 'COMPLETED': return 'bg-green-50 text-green-700 ring-green-600/20 dark:bg-green-900/20 dark:text-green-400';
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
                    <h1 className="text-2xl font-semibold text-gray-900 dark:text-white">Trip Management</h1>
                    <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                        Create and manage delivery trips with cargo tracking.
                    </p>
                </div>
                <button
                    onClick={handleAdd}
                    className="mt-4 inline-flex items-center rounded-md bg-blue-600 px-3 py-2 text-sm font-semibold text-white hover:bg-blue-500"
                >
                    <Plus className="h-4 w-4 mr-1.5" />
                    Create Trip
                </button>
            </div>

            {/* Filters */}
            <div className="flex flex-col sm:flex-row gap-4">
                <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <input
                        type="text"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        placeholder="Search by trip ID or location..."
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
                {filteredTrips.length === 0 ? (
                    <div className="p-12 text-center">
                        <h3 className="mt-2 text-sm font-medium text-gray-900 dark:text-white">No trips found</h3>
                        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                            {searchTerm || statusFilter ? 'Try adjusting your filters.' : 'Get started by creating a trip.'}
                        </p>
                    </div>
                ) : (
                    <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-800">
                        <thead className="bg-gray-50 dark:bg-gray-900">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Trip ID</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Route</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Cargo</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Scheduled Pickup</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Status</th>
                                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white dark:bg-gray-950 divide-y divide-gray-200 dark:divide-gray-800">
                            {filteredTrips.map((trip) => (
                                <tr key={trip.id} className="hover:bg-gray-50 dark:hover:bg-gray-900">
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">
                                        {trip.trip_id}
                                    </td>
                                    <td className="px-6 py-4 text-sm text-gray-500 dark:text-gray-400">
                                        <div className="flex items-center gap-1">
                                            <MapPin className="h-3 w-3" />
                                            <span>{trip.pickup_location} → {trip.dropoff_location}</span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                                        {trip.cargo_weight_kg} kg
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                                        {new Date(trip.scheduled_pickup_time).toLocaleString()}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <span className={`inline-flex rounded-full px-2 text-xs font-semibold leading-5 ${getStatusColor(trip.status)}`}>
                                            {trip.status.replace('_', ' ')}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                        <button
                                            onClick={() => handleEdit(trip)}
                                            className="text-blue-600 hover:text-blue-900 dark:text-blue-400 dark:hover:text-blue-300 mr-3"
                                        >
                                            <Edit className="h-4 w-4" />
                                        </button>
                                        <button
                                            onClick={() => handleDelete(trip.id)}
                                            className="text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300"
                                        >
                                            <Trash2 className="h-4 w-4" />
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                )}
            </div>

            {/* Create/Edit Modal */}
            {showModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50 overflow-y-auto">
                    <div className="bg-white dark:bg-gray-950 rounded-lg max-w-3xl w-full border border-gray-200 dark:border-gray-800 my-8 max-h-[90vh] flex flex-col">
                        <div className="p-6 border-b border-gray-200 dark:border-gray-800">
                            <div className="flex items-center justify-between">
                                <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                                    {editingTrip ? 'Edit Trip' : 'Create New Trip'}
                                </h2>
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

                            <form onSubmit={handleSubmit} className="space-y-4" id="tripForm">
                            {editingTrip && (
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Trip ID</label>
                                    <input
                                        type="text"
                                        value={formData.trip_id}
                                        disabled
                                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-md bg-gray-100 dark:bg-gray-800 dark:text-gray-100 cursor-not-allowed"
                                    />
                                </div>
                            )}
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Vehicle *</label>
                                    <select
                                        required
                                        value={formData.vehicle}
                                        onChange={(e) => setFormData({ ...formData, vehicle: parseInt(e.target.value) })}
                                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-md dark:bg-gray-900 dark:text-gray-100"
                                    >
                                        <option value="">Select Vehicle</option>
                                        {vehicles.map(v => (
                                            <option key={v.id} value={v.id}>{v.vehicle_id} - {v.make} {v.model}</option>
                                        ))}
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Driver *</label>
                                    <select
                                        required
                                        value={formData.driver}
                                        onChange={(e) => setFormData({ ...formData, driver: parseInt(e.target.value) })}
                                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-md dark:bg-gray-900 dark:text-gray-100"
                                    >
                                        <option value="">Select Driver</option>
                                        {drivers.map(d => (
                                            <option key={d.id} value={d.id}>{d.driver_id} - {d.full_name}</option>
                                        ))}
                                    </select>
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Pickup Location *</label>
                                    <input
                                        type="text"
                                        required
                                        value={formData.pickup_location}
                                        onChange={(e) => setFormData({ ...formData, pickup_location: e.target.value })}
                                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-md dark:bg-gray-900 dark:text-gray-100"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Dropoff Location *</label>
                                    <input
                                        type="text"
                                        required
                                        value={formData.dropoff_location}
                                        onChange={(e) => setFormData({ ...formData, dropoff_location: e.target.value })}
                                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-md dark:bg-gray-900 dark:text-gray-100"
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Pickup Address *</label>
                                    <input
                                        type="text"
                                        required
                                        value={formData.pickup_address}
                                        onChange={(e) => setFormData({ ...formData, pickup_address: e.target.value })}
                                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-md dark:bg-gray-900 dark:text-gray-100"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Dropoff Address *</label>
                                    <input
                                        type="text"
                                        required
                                        value={formData.dropoff_address}
                                        onChange={(e) => setFormData({ ...formData, dropoff_address: e.target.value })}
                                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-md dark:bg-gray-900 dark:text-gray-100"
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-3 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Cargo Description *</label>
                                    <input
                                        type="text"
                                        required
                                        value={formData.cargo_description}
                                        onChange={(e) => setFormData({ ...formData, cargo_description: e.target.value })}
                                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-md dark:bg-gray-900 dark:text-gray-100"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Cargo Weight (kg) *</label>
                                    <input
                                        type="number"
                                        required
                                        value={formData.cargo_weight_kg}
                                        onChange={(e) => setFormData({ ...formData, cargo_weight_kg: parseFloat(e.target.value) })}
                                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-md dark:bg-gray-900 dark:text-gray-100"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Cargo Value ($)</label>
                                    <input
                                        type="number"
                                        value={formData.cargo_value}
                                        onChange={(e) => setFormData({ ...formData, cargo_value: parseFloat(e.target.value) })}
                                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-md dark:bg-gray-900 dark:text-gray-100"
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-3 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Scheduled Pickup *</label>
                                    <input
                                        type="datetime-local"
                                        required
                                        value={formData.scheduled_pickup_time}
                                        onChange={(e) => setFormData({ ...formData, scheduled_pickup_time: e.target.value })}
                                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-md dark:bg-gray-900 dark:text-gray-100"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Scheduled Delivery *</label>
                                    <input
                                        type="datetime-local"
                                        required
                                        value={formData.scheduled_delivery_time}
                                        onChange={(e) => setFormData({ ...formData, scheduled_delivery_time: e.target.value })}
                                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-md dark:bg-gray-900 dark:text-gray-100"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Est. Distance (km)</label>
                                    <input
                                        type="number"
                                        value={formData.estimated_distance_km}
                                        onChange={(e) => setFormData({ ...formData, estimated_distance_km: parseFloat(e.target.value) })}
                                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-md dark:bg-gray-900 dark:text-gray-100"
                                    />
                                </div>
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
                                    form="tripForm"
                                    disabled={submitting}
                                    className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-500 disabled:opacity-50"
                                >
                                    {submitting ? 'Saving...' : (editingTrip ? 'Update Trip' : 'Create Trip')}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

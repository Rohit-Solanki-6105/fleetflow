'use client';

import { useEffect, useState } from 'react';
import {
    Send,
    Search,
    MoreVertical,
    Filter,
    CheckCircle2,
    Clock,
    XCircle,
    MapPin,
    Loader2,
    AlertCircle
} from 'lucide-react';
import { tripApi, Trip } from '@/lib/api/trips';

export default function TripsPage() {
    const [trips, setTrips] = useState<Trip[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        fetchTrips();
    }, []);

    const fetchTrips = async () => {
        try {
            setLoading(true);
            const data = await tripApi.getAll();
            setTrips(data);
            setError(null);
        } catch (err: any) {
            setError(err.message || 'Failed to load trips');
        } finally {
            setLoading(false);
        }
    };

    const filteredTrips = trips.filter(trip =>
        trip.trip_id.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (trip.pickup_location && trip.pickup_location.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (trip.dropoff_location && trip.dropoff_location.toLowerCase().includes(searchTerm.toLowerCase()))
    );

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'DISPATCHED':
            case 'IN_PROGRESS':
                return 'bg-blue-50 text-blue-600 ring-blue-600/20 dark:bg-blue-900/30';
            case 'COMPLETED':
                return 'bg-green-50 text-green-600 ring-green-600/20 dark:bg-green-900/30';
            case 'CANCELLED':
                return 'bg-red-50 text-red-600 ring-red-600/20 dark:bg-red-900/30';
            case 'DRAFT':
                return 'bg-yellow-50 text-yellow-600 ring-yellow-600/20 dark:bg-yellow-900/30';
            default:
                return 'bg-gray-50 text-gray-600 ring-gray-500/20 dark:bg-gray-800';
        }
    };

    const getStatusIcon = (status: string) => {
        switch (status) {
            case 'DISPATCHED':
            case 'IN_PROGRESS':
                return <Clock className="h-5 w-5" />;
            case 'COMPLETED':
                return <CheckCircle2 className="h-5 w-5" />;
            case 'CANCELLED':
                return <XCircle className="h-5 w-5" />;
            case 'DRAFT':
                return <AlertCircle className="h-5 w-5" />;
            default:
                return <Send className="h-5 w-5" />;
        }
    };

    const getStatusLabel = (status: string) => {
        return status.replace('_', ' ').toLowerCase().replace(/\b\w/g, l => l.toUpperCase());
    };

    const formatDateTime = (dateString: string) => {
        const date = new Date(dateString);
        return date.toLocaleString('en-US', { 
            month: 'short', 
            day: 'numeric', 
            hour: '2-digit', 
            minute: '2-digit' 
        });
    };

    return (
        <div className="space-y-6 max-w-7xl mx-auto">
            <div className="sm:flex sm:items-center sm:justify-between">
                <div>
                    <h1 className="text-2xl font-semibold text-gray-900 dark:text-white">Trip Dispatcher</h1>
                    <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                        Manage active shipments, draft new dispatches, and track completion statuses.
                    </p>
                </div>
                <div className="mt-4 sm:ml-16 sm:mt-0 sm:flex-none">
                    <button
                        type="button"
                        className="inline-flex items-center justify-center rounded-md bg-blue-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-blue-500 transition-colors"
                    >
                        <Send className="h-4 w-4 mr-1.5" />
                        New Dispatch
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
                        placeholder="Search trips by ID or location..."
                    />
                </div>

                <div className="flex items-center gap-2">
                    <button className="inline-flex items-center gap-x-1.5 rounded-md bg-white dark:bg-gray-900 px-3 py-2 text-sm font-semibold text-gray-900 dark:text-gray-300 shadow-sm ring-1 ring-inset ring-gray-300 dark:ring-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
                        <Filter className="-ml-0.5 h-4 w-4" aria-hidden="true" />
                        Filter
                    </button>
                </div>
            </div>

            {/* List View */}
            {loading ? (
                <div className="flex items-center justify-center min-h-[400px]">
                    <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
                </div>
            ) : error ? (
                <div className="rounded-md bg-red-50 dark:bg-red-900/10 p-4">
                    <p className="text-sm text-red-800 dark:text-red-400">{error}</p>
                </div>
            ) : filteredTrips.length === 0 ? (
                <div className="text-center py-12 bg-white dark:bg-gray-950 rounded-lg border border-gray-200 dark:border-gray-800">
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                        {searchTerm ? 'No trips found matching your search.' : 'No trips in the system yet.'}
                    </p>
                </div>
            ) : (
                <div className="mt-8 overflow-hidden bg-white dark:bg-gray-950 shadow-sm ring-1 ring-black ring-opacity-5 sm:rounded-lg border border-gray-200 dark:border-gray-800">
                    <ul role="list" className="divide-y divide-gray-200 dark:divide-gray-800">
                        {filteredTrips.map((trip) => (
                            <li key={trip.id} className="relative flex justify-between gap-x-6 px-4 py-5 hover:bg-gray-50 dark:hover:bg-gray-900/50 sm:px-6 transition-colors">
                                <div className="flex min-w-0 gap-x-4">
                                    <div className={`mt-1 flex h-10 w-10 flex-none items-center justify-center rounded-full ring-1 ring-inset ${getStatusColor(trip.status)}`}>
                                        {getStatusIcon(trip.status)}
                                    </div>
                                    <div className="min-w-0 flex-auto">
                                        <p className="text-sm font-semibold leading-6 text-gray-900 dark:text-white">
                                            <a href="#">
                                                <span className="absolute inset-x-0 -top-px bottom-0" />
                                                {trip.trip_id}
                                            </a>
                                        </p>
                                        <div className="mt-1 flex items-center gap-x-2 text-xs leading-5 text-gray-500 dark:text-gray-400">
                                            <p className="flex items-center">
                                                <MapPin className="h-3 w-3 mr-1" />
                                                {trip.pickup_location} <span className="mx-1">→</span> {trip.dropoff_location}
                                            </p>
                                        </div>
                                        {trip.cargo_weight_kg && (
                                            <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                                                Cargo: {trip.cargo_weight_kg} kg {trip.cargo_description && `- ${trip.cargo_description}`}
                                            </p>
                                        )}
                                    </div>
                                </div>
                                <div className="flex shrink-0 items-center gap-x-4">
                                    <div className="hidden sm:flex sm:flex-col sm:items-end">
                                        <p className={`text-sm leading-6 font-medium ${
                                            trip.status === 'DISPATCHED' || trip.status === 'IN_PROGRESS' ? 'text-blue-600 dark:text-blue-400' :
                                            trip.status === 'COMPLETED' ? 'text-green-600 dark:text-green-400' :
                                            trip.status === 'CANCELLED' ? 'text-red-600 dark:text-red-400' :
                                            'text-gray-600 dark:text-gray-400'
                                        }`}>
                                            {getStatusLabel(trip.status)}
                                        </p>
                                        {trip.scheduled_pickup_time && (
                                            <p className="mt-1 text-xs leading-5 text-gray-500 dark:text-gray-400">
                                                {trip.status === 'DRAFT' ? 'Scheduled: ' : 'Pickup: '}{formatDateTime(trip.scheduled_pickup_time)}
                                            </p>
                                        )}
                                    </div>
                                    <button type="button" className="relative text-gray-400 hover:text-gray-500 dark:hover:text-gray-300">
                                        <MoreVertical className="h-5 w-5" />
                                    </button>
                                </div>
                            </li>
                        ))}
                    </ul>
                </div>
            )}
        </div>
    );
}

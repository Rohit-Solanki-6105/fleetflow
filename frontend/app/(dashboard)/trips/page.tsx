import {
    Send,
    Search,
    MoreVertical,
    Filter,
    CheckCircle2,
    Clock,
    XCircle,
    MapPin
} from 'lucide-react';

const mockTrips = [
    { id: 'TRP-9042', vehicle: 'VH-102', driver: 'Alex Mercer', pickup: 'New York, NY', dropoff: 'Boston, MA', status: 'Dispatched', eta: '4h 15m' },
    { id: 'TRP-9041', vehicle: 'VH-105', driver: 'Sarah Connor', pickup: 'Chicago, IL', dropoff: 'Detroit, MI', status: 'Completed', eta: '-' },
    { id: 'TRP-9040', vehicle: 'VH-101', driver: 'John Smith', pickup: 'Miami, FL', dropoff: 'Atlanta, GA', status: 'Draft', eta: '-' },
    { id: 'TRP-9039', vehicle: 'VH-104', driver: 'Emma Davis', pickup: 'Seattle, WA', dropoff: 'Portland, OR', status: 'Cancelled', eta: '-' },
];

export default function TripsPage() {
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
                        className="inline-flex items-center justify-center rounded-md bg-blue-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-blue-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600 transition-colors"
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
                        className="block w-full rounded-md border-0 py-1.5 pl-10 pr-3 text-gray-900 dark:text-gray-100 ring-1 ring-inset ring-gray-300 dark:ring-gray-700 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-blue-600 sm:text-sm sm:leading-6 dark:bg-gray-900 bg-gray-50 bg-opacity-50"
                        placeholder="Search trips or drivers..."
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
            <div className="mt-8 overflow-hidden bg-white dark:bg-gray-950 shadow-sm ring-1 ring-black ring-opacity-5 sm:rounded-lg border border-gray-200 dark:border-gray-800">
                <ul role="list" className="divide-y divide-gray-200 dark:divide-gray-800">
                    {mockTrips.map((trip) => (
                        <li key={trip.id} className="relative flex justify-between gap-x-6 px-4 py-5 hover:bg-gray-50 dark:hover:bg-gray-900/50 sm:px-6 transition-colors">
                            <div className="flex min-w-0 gap-x-4">
                                <div className={`mt-1 flex h-10 w-10 flex-none items-center justify-center rounded-full ring-1 ring-inset ${trip.status === 'Dispatched' ? 'bg-blue-50 text-blue-600 ring-blue-600/20 dark:bg-blue-900/30' :
                                        trip.status === 'Completed' ? 'bg-green-50 text-green-600 ring-green-600/20 dark:bg-green-900/30' :
                                            trip.status === 'Cancelled' ? 'bg-red-50 text-red-600 ring-red-600/20 dark:bg-red-900/30' :
                                                'bg-gray-50 text-gray-600 ring-gray-500/20 dark:bg-gray-800'
                                    }`}>
                                    {trip.status === 'Dispatched' && <Clock className="h-5 w-5" />}
                                    {trip.status === 'Completed' && <CheckCircle2 className="h-5 w-5" />}
                                    {trip.status === 'Cancelled' && <XCircle className="h-5 w-5" />}
                                    {trip.status === 'Draft' && <Send className="h-5 w-5" />}
                                </div>
                                <div className="min-w-0 flex-auto">
                                    <p className="text-sm font-semibold leading-6 text-gray-900 dark:text-white">
                                        <a href="#">
                                            <span className="absolute inset-x-0 -top-px bottom-0" />
                                            {trip.id} <span className="text-gray-400 font-normal mx-1">•</span> {trip.vehicle}
                                        </a>
                                    </p>
                                    <div className="mt-1 flex items-center gap-x-2 text-xs leading-5 text-gray-500 dark:text-gray-400">
                                        <p className="truncate">Driver: <span className="font-medium text-gray-700 dark:text-gray-300">{trip.driver}</span></p>
                                        <svg viewBox="0 0 2 2" className="h-0.5 w-0.5 fill-current"><circle cx="1" cy="1" r="1" /></svg>
                                        <p className="flex items-center">
                                            <MapPin className="h-3 w-3 mr-1" />
                                            {trip.pickup} <span className="mx-1">→</span> {trip.dropoff}
                                        </p>
                                    </div>
                                </div>
                            </div>
                            <div className="flex shrink-0 items-center gap-x-4">
                                <div className="hidden sm:flex sm:flex-col sm:items-end">
                                    <p className={`text-sm leading-6 font-medium ${trip.status === 'Dispatched' ? 'text-blue-600 dark:text-blue-400' :
                                            trip.status === 'Completed' ? 'text-green-600 dark:text-green-400' :
                                                trip.status === 'Cancelled' ? 'text-red-600 dark:text-red-400' :
                                                    'text-gray-600 dark:text-gray-400'
                                        }`}>{trip.status}</p>
                                    {trip.eta !== '-' && (
                                        <p className="mt-1 text-xs leading-5 text-gray-500 dark:text-gray-400">
                                            ETA: {trip.eta}
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
        </div>
    );
}

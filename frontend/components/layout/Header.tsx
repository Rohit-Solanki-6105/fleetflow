import { Bell, Search, User } from 'lucide-react';

export function Header() {
    return (
        <header className="flex h-16 w-full items-center justify-between border-b bg-white dark:bg-gray-950 border-gray-200 dark:border-gray-800 px-6 box-border">
            <div className="flex items-center flex-1">
                <label htmlFor="search" className="sr-only">Search</label>
                <div className="relative w-full max-w-md">
                    <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                        <Search className="h-4 w-4 text-gray-400" aria-hidden="true" />
                    </div>
                    <input
                        id="search"
                        name="search"
                        className="block w-full rounded-md border-0 py-1.5 pl-10 pr-3 text-gray-900 dark:text-gray-100 ring-1 ring-inset ring-gray-300 dark:ring-gray-700 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-blue-600 sm:text-sm sm:leading-6 dark:bg-gray-900 bg-gray-50 bg-opacity-50"
                        placeholder="Search resources..."
                        type="search"
                    />
                </div>
            </div>

            <div className="flex items-center space-x-4">
                <button
                    type="button"
                    className="relative rounded-full bg-white dark:bg-gray-950 p-1 text-gray-400 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                >
                    <span className="sr-only">View notifications</span>
                    <Bell className="h-5 w-5" aria-hidden="true" />
                    <span className="absolute top-1.5 right-1.5 block h-2 w-2 rounded-full bg-red-500 ring-2 ring-white dark:ring-gray-950" />
                </button>

                <div className="relative ml-3">
                    <button
                        type="button"
                        className="flex items-center rounded-full bg-white dark:bg-gray-950 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                        id="user-menu-button"
                        aria-expanded="false"
                        aria-haspopup="true"
                    >
                        <span className="sr-only">Open user menu</span>
                        <div className="h-8 w-8 rounded-full bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-200 flex items-center justify-center font-bold text-sm">
                            <User className="h-4 w-4" />
                        </div>
                    </button>
                </div>
            </div>
        </header>
    );
}

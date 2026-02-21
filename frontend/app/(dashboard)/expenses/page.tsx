'use client';

import { useEffect, useState } from 'react';
import {
    Plus,
    Search,
    Filter,
    Loader2,
    Fuel,
    Receipt,
    DollarSign,
    TrendingUp
} from 'lucide-react';
import { fuelExpenseApi, otherExpenseApi, FuelExpense, OtherExpense } from '@/lib/api/expenses';

type ExpenseType = 'fuel' | 'other';

export default function ExpensesPage() {
    const [fuelExpenses, setFuelExpenses] = useState<FuelExpense[]>([]);
    const [otherExpenses, setOtherExpenses] = useState<OtherExpense[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [activeTab, setActiveTab] = useState<ExpenseType>('fuel');

    useEffect(() => {
        fetchExpenses();
    }, []);

    const fetchExpenses = async () => {
        try {
            setLoading(true);
            const [fuelData, otherData] = await Promise.all([
                fuelExpenseApi.getAll(),
                otherExpenseApi.getAll()
            ]);
            setFuelExpenses(fuelData);
            setOtherExpenses(otherData);
            setError(null);
        } catch (err: any) {
            setError(err.message ||'Failed to load expenses');
        } finally {
            setLoading(false);
        }
    };

    const filteredFuelExpenses = fuelExpenses.filter(expense =>
        expense.expense_id.toLowerCase().includes(searchTerm.toLowerCase()) ||
        expense.vehicle_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        expense.location?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const filteredOtherExpenses = otherExpenses.filter(expense =>
        expense.expense_id.toLowerCase().includes(searchTerm.toLowerCase()) ||
        expense.vehicle_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        expense.description.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const totalFuelCost = fuelExpenses.reduce((sum, exp) => sum + Number(exp.total_cost), 0);
    const totalOtherCost = otherExpenses.reduce((sum, exp) => sum + Number(exp.amount), 0);
    const totalCost = totalFuelCost + totalOtherCost;

    return (
        <div className="space-y-6 max-w-7xl mx-auto">
            <div className="sm:flex sm:items-center sm:justify-between">
                <div>
                    <h1 className="text-2xl font-semibold text-gray-900 dark:text-white">Expense Management</h1>
                    <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                        Track fuel costs, tolls, and other operational expenses.
                    </p>
                </div>
                <div className="mt-4 sm:ml-16 sm:mt-0 sm:flex-none">
                    <button
                        type="button"
                        className="inline-flex items-center justify-center rounded-md bg-blue-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-blue-500 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600 transition-colors"
                    >
                        <Plus className="h-4 w-4 mr-1.5" />
                        Log Expense
                    </button>
                </div>
            </div>

            {/* Summary Cards */}
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-3">
                <div className="bg-white dark:bg-gray-950 overflow-hidden shadow rounded-lg border border-gray-200 dark:border-gray-800">
                    <div className="p-5">
                        <div className="flex items-center">
                            <div className="flex-shrink-0">
                                <Fuel className="h-6 w-6 text-blue-600" />
                            </div>
                            <div className="ml-5 w-0 flex-1">
                                <dl>
                                    <dt className="text-sm font-medium text-gray-500 dark:text-gray-400 truncate">
                                        Total Fuel Cost
                                    </dt>
                                    <dd className="flex items-baseline">
                                        <div className="text-2xl font-semibold text-gray-900 dark:text-white">
                                            ${totalFuelCost.toLocaleString()}
                                        </div>
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
                                <Receipt className="h-6 w-6 text-green-600" />
                            </div>
                            <div className="ml-5 w-0 flex-1">
                                <dl>
                                    <dt className="text-sm font-medium text-gray-500 dark:text-gray-400 truncate">
                                        Other Expenses
                                    </dt>
                                    <dd className="flex items-baseline">
                                        <div className="text-2xl font-semibold text-gray-900 dark:text-white">
                                            ${totalOtherCost.toLocaleString()}
                                        </div>
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
                                    <dd className="flex items-baseline">
                                        <div className="text-2xl font-semibold text-gray-900 dark:text-white">
                                            ${totalCost.toLocaleString()}
                                        </div>
                                    </dd>
                                </dl>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Tabs */}
            <div className="border-b border-gray-200 dark:border-gray-800">
                <nav className="-mb-px flex space-x-8">
                    <button
                        onClick={() => setActiveTab('fuel')}
                        className={`${
                            activeTab === 'fuel'
                                ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                                : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300'
                        } flex whitespace-nowrap border-b-2 py-4 px-1 text-sm font-medium transition-colors`}
                    >
                        <Fuel className="h-5 w-5 mr-2" />
                        Fuel Expenses ({fuelExpenses.length})
                    </button>
                    <button
                        onClick={() => setActiveTab('other')}
                        className={`${
                            activeTab === 'other'
                                ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                                : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300'
                        } flex whitespace-nowrap border-b-2 py-4 px-1 text-sm font-medium transition-colors`}
                    >
                        <Receipt className="h-5 w-5 mr-2" />
                        Other Expenses ({otherExpenses.length})
                    </button>
                </nav>
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
                        placeholder="Search expenses..."
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
                <div className="flex items-center justify-center min-h-100">
                    <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
                </div>
            ) : error ? (
                <div className="rounded-md bg-red-50 dark:bg-red-900/10 p-4">
                    <p className="text-sm text-red-800 dark:text-red-400">{error}</p>
                </div>
            ) : activeTab === 'fuel' ? (
                filteredFuelExpenses.length === 0 ? (
                    <div className="text-center py-12 bg-white dark:bg-gray-950 rounded-lg border border-gray-200 dark:border-gray-800">
                        <Fuel className="mx-auto h-12 w-12 text-gray-400" />
                        <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
                            {searchTerm ? 'No fuel expenses found matching your search.' : 'No fuel expenses logged yet.'}
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
                                                <th scope="col" className="py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-gray-900 dark:text-gray-200 sm:pl-6">Expense ID</th>
                                                <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900 dark:text-gray-200">Vehicle</th>
                                                <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900 dark:text-gray-200">Fuel Type</th>
                                                <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900 dark:text-gray-200">Quantity (L)</th>
                                                <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900 dark:text-gray-200">Cost/L</th>
                                                <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900 dark:text-gray-200">Total Cost</th>
                                                <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900 dark:text-gray-200">Date</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-gray-200 dark:divide-gray-800 bg-white dark:bg-gray-950">
                                            {filteredFuelExpenses.map((expense) => (
                                                <tr key={expense.id} className="hover:bg-gray-50 dark:hover:bg-gray-900/50 transition-colors">
                                                    <td className="whitespace-nowrap py-4 pl-4 pr-3 text-sm font-medium text-gray-900 dark:text-white sm:pl-6">
                                                        {expense.expense_id}
                                                    </td>
                                                    <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500 dark:text-gray-400">
                                                        {expense.vehicle_name || `Vehicle #${expense.vehicle}`}
                                                    </td>
                                                    <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500 dark:text-gray-400">
                                                        {expense.fuel_type}
                                                    </td>
                                                    <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500 dark:text-gray-400">
                                                        {expense.quantity_liters?.toLocaleString() || '-'}
                                                    </td>
                                                    <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500 dark:text-gray-400">
                                                        ${expense.cost_per_liter.toLocaleString()}
                                                    </td>
                                                    <td className="whitespace-nowrap px-3 py-4 text-sm font-medium text-gray-900 dark:text-white">
                                                        ${expense.total_cost.toLocaleString()}
                                                    </td>
                                                    <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500 dark:text-gray-400">
                                                        {new Date(expense.date).toLocaleDateString()}
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        </div>
                    </div>
                )
            ) : (
                filteredOtherExpenses.length === 0 ? (
                    <div className="text-center py-12 bg-white dark:bg-gray-950 rounded-lg border border-gray-200 dark:border-gray-800">
                        <Receipt className="mx-auto h-12 w-12 text-gray-400" />
                        <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
                            {searchTerm ? 'No other expenses found matching your search.' : 'No other expenses logged yet.'}
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
                                                <th scope="col" className="py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-gray-900 dark:text-gray-200 sm:pl-6">Expense ID</th>
                                                <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900 dark:text-gray-200">Vehicle</th>
                                                <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900 dark:text-gray-200">Type</th>
                                                <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900 dark:text-gray-200">Description</th>
                                                <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900 dark:text-gray-200">Amount</th>
                                                <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900 dark:text-gray-200">Date</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-gray-200 dark:divide-gray-800 bg-white dark:bg-gray-950">
                                            {filteredOtherExpenses.map((expense) => (
                                                <tr key={expense.id} className="hover:bg-gray-50 dark:hover:bg-gray-900/50 transition-colors">
                                                    <td className="whitespace-nowrap py-4 pl-4 pr-3 text-sm font-medium text-gray-900 dark:text-white sm:pl-6">
                                                        {expense.expense_id}
                                                    </td>
                                                    <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500 dark:text-gray-400">
                                                        {expense.vehicle_name || `Vehicle #${expense.vehicle}`}
                                                    </td>
                                                    <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500 dark:text-gray-400">
                                                        {expense.expense_type}
                                                    </td>
                                                    <td className="px-3 py-4 text-sm text-gray-500 dark:text-gray-400 max-w-xs truncate">
                                                        {expense.description}
                                                    </td>
                                                    <td className="whitespace-nowrap px-3 py-4 text-sm font-medium text-gray-900 dark:text-white">
                                                        ${expense.amount.toLocaleString()}
                                                    </td>
                                                    <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500 dark:text-gray-400">
                                                        {new Date(expense.date).toLocaleDateString()}
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        </div>
                    </div>
                )
            )}
        </div>
    );
}

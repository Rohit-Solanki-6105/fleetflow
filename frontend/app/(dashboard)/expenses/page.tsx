'use client';

import { useEffect, useState } from 'react';
import { Plus, Search, Loader2, DollarSign, TrendingUp, X } from 'lucide-react';
import { expensesApi, Expense } from '@/lib/api/expenses';
import { vehicleApi } from '@/lib/api/vehicles';

const EXPENSE_TYPES = ['TOLL', 'PARKING', 'CLEANING', 'INSURANCE', 'REGISTRATION', 'FINE', 'TIRE_REPLACEMENT', 'ACCESSORIES', 'OTHER'];

export default function ExpensesPage() {
    const [expenses, setExpenses] = useState<Expense[]>([]);
    const [vehicles, setVehicles] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [typeFilter, setTypeFilter] = useState<string>('');
    const [showModal, setShowModal] = useState(false);
    const [formData, setFormData] = useState({
        vehicle: 0,
        date: '',
        amount: 0,
        expense_type: 'OTHER',
        description: '',
    });
    const [formError, setFormError] = useState('');
    const [submitting, setSubmitting] = useState(false);

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            const [expensesData, vehiclesData] = await Promise.all([
                expensesApi.getAll(),
                vehicleApi.getAll()
            ]);
            setExpenses(expensesData);
            setVehicles(vehiclesData);
        } catch (err) {
            console.error('Failed to load data', err);
        } finally {
            setLoading(false);
        }
    };

    const filteredExpenses = expenses.filter(expense => {
        const vehicleId = expense.vehicle_details?.vehicle_id || '';
        const matchesSearch = expense.expense_id?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            vehicleId.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesType = !typeFilter || expense.expense_type === typeFilter;
        return matchesSearch && matchesType;
    });

    const handleAdd = () => {
        setFormData({
            vehicle: 0,
            date: '',
            amount: 0,
            expense_type: 'OTHER',
            description: '',
        });
        setShowModal(true);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setFormError('');
        setSubmitting(true);

        try {
            await expensesApi.create(formData);
            setShowModal(false);
            fetchData();
        } catch (err: any) {
            setFormError(err.response?.data?.detail || 'Failed to log expense');
        } finally {
            setSubmitting(false);
        }
    };

    const totalExpenses = expenses.reduce((sum, exp) => sum + (exp.amount || 0), 0);
    const thisMonth = expenses.filter(e => {
        const expDate = new Date(e.date);
        const now = new Date();
        return expDate.getMonth() === now.getMonth() && expDate.getFullYear() === now.getFullYear();
    }).reduce((sum, exp) => sum + (exp.amount || 0), 0);
    const avgPerVehicle = vehicles.length > 0 ? totalExpenses / vehicles.length : 0;

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
                    <h1 className="text-2xl font-semibold text-gray-900 dark:text-white">Expenses</h1>
                    <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                        Track fuel, maintenance, and operational expenses.
                    </p>
                </div>
                <button
                    onClick={handleAdd}
                    className="mt-4 inline-flex items-center rounded-md bg-blue-600 px-3 py-2 text-sm font-semibold text-white hover:bg-blue-500"
                >
                    <Plus className="h-4 w-4 mr-1.5" />
                    Log Expense
                </button>
            </div>

            {/* Summary Cards */}
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-3">
                <div className="bg-white dark:bg-gray-950 overflow-hidden rounded-lg border border-gray-200 dark:border-gray-800 px-4 py-5 shadow-sm sm:p-6">
                    <div className="flex items-center">
                        <div className="shrink-0 bg-blue-100 dark:bg-blue-900/30 rounded-md p-3">
                            <DollarSign className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                        </div>
                        <div className="ml-5 w-0 flex-1">
                            <dl>
                                <dt className="text-sm font-medium text-gray-500 dark:text-gray-400 truncate">Total Expenses</dt>
                                <dd className="text-2xl font-semibold text-gray-900 dark:text-white">
                                    ${totalExpenses.toLocaleString()}
                                </dd>
                            </dl>
                        </div>
                    </div>
                </div>
                <div className="bg-white dark:bg-gray-950 overflow-hidden rounded-lg border border-gray-200 dark:border-gray-800 px-4 py-5 shadow-sm sm:p-6">
                    <div className="flex items-center">
                        <div className="shrink-0 bg-green-100 dark:bg-green-900/30 rounded-md p-3">
                            <TrendingUp className="h-6 w-6 text-green-600 dark:text-green-400" />
                        </div>
                        <div className="ml-5 w-0 flex-1">
                            <dl>
                                <dt className="text-sm font-medium text-gray-500 dark:text-gray-400 truncate">This Month</dt>
                                <dd className="text-2xl font-semibold text-gray-900 dark:text-white">${thisMonth.toLocaleString()}</dd>
                            </dl>
                        </div>
                    </div>
                </div>
                <div className="bg-white dark:bg-gray-950 overflow-hidden rounded-lg border border-gray-200 dark:border-gray-800 px-4 py-5 shadow-sm sm:p-6">
                    <div className="flex items-center">
                        <div className="shrink-0 bg-purple-100 dark:bg-purple-900/30 rounded-md p-3">
                            <DollarSign className="h-6 w-6 text-purple-600 dark:text-purple-400" />
                        </div>
                        <div className="ml-5 w-0 flex-1">
                            <dl>
                                <dt className="text-sm font-medium text-gray-500 dark:text-gray-400 truncate">Avg per Vehicle</dt>
                                <dd className="text-2xl font-semibold text-gray-900 dark:text-white">${avgPerVehicle.toLocaleString()}</dd>
                            </dl>
                        </div>
                    </div>
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
                        placeholder="Search expenses..."
                        className="w-full pl-10 pr-4 py-2 rounded-md border border-gray-300 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-100"
                    />
                </div>
                <select
                    value={typeFilter}
                    onChange={(e) => setTypeFilter(e.target.value)}
                    className="px-4 py-2 rounded-md border border-gray-300 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-100"
                >
                    <option value="">All Types</option>
                    {EXPENSE_TYPES.map(type => (
                        <option key={type} value={type}>{type}</option>
                    ))}
                </select>
            </div>

            {/* Table */}
            <div className="bg-white dark:bg-gray-950 border border-gray-200 dark:border-gray-800 rounded-lg overflow-hidden">
                {filteredExpenses.length === 0 ? (
                    <div className="p-12 text-center">
                        <DollarSign className="mx-auto h-12 w-12 text-gray-400" />
                        <h3 className="mt-2 text-sm font-medium text-gray-900 dark:text-white">No expenses recorded</h3>
                        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">Get started by logging your first expense.</p>
                    </div>
                ) : (
                    <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-800">
                        <thead className="bg-gray-50 dark:bg-gray-900">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Expense ID</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Vehicle</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Type</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Date</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Amount</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Description</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white dark:bg-gray-950 divide-y divide-gray-200 dark:divide-gray-800">
                            {filteredExpenses.map((expense) => (
                                <tr key={expense.id} className="hover:bg-gray-50 dark:hover:bg-gray-900">
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">
                                        {expense.expense_id}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                                        {expense.vehicle_details?.vehicle_id || expense.vehicle}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                                        {expense.expense_type}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                                        {new Date(expense.date).toLocaleDateString()}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-gray-900 dark:text-white">
                                        ${expense.amount?.toLocaleString()}
                                    </td>
                                    <td className="px-6 py-4 text-sm text-gray-500 dark:text-gray-400">
                                        {expense.description}
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
                                <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Log Expense</h2>
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

                            <form onSubmit={handleSubmit} className="space-y-4" id="expenseForm">

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

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Date *</label>
                                    <input
                                        type="date"
                                        required
                                        value={formData.date}
                                        onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-md dark:bg-gray-900 dark:text-gray-100"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Amount ($) *</label>
                                    <input
                                        type="number"
                                        step="0.01"
                                        required
                                        value={formData.amount}
                                        onChange={(e) => setFormData({ ...formData, amount: parseFloat(e.target.value) })}
                                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-md dark:bg-gray-900 dark:text-gray-100"
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Expense Type *</label>
                                <select
                                    value={formData.expense_type}
                                    onChange={(e) => setFormData({ ...formData, expense_type: e.target.value })}
                                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-md dark:bg-gray-900 dark:text-gray-100"
                                >
                                    {EXPENSE_TYPES.map(type => (
                                        <option key={type} value={type}>{type}</option>
                                    ))}
                                </select>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Description</label>
                                <textarea
                                    rows={3}
                                    value={formData.description}
                                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-md dark:bg-gray-900 dark:text-gray-100"
                                    placeholder="e.g., Regular fuel fill-up, Oil change, etc."
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
                                    form="expenseForm"
                                    disabled={submitting}
                                    className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-500 disabled:opacity-50"
                                >
                                    {submitting ? 'Logging...' : 'Log Expense'}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

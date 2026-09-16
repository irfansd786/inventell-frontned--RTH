import React from 'react';
import Card from '../common/Card';
import Badge from '../common/Badge';

export default function TransactionTable({ transactions = [], onSelectTransaction }) {
  return (
    <Card title="Recent POS Transactions" subtitle="Click any invoice row to inspect complete billing breakdown">
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-slate-100 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
              <th className="pb-3 font-semibold">Invoice ID</th>
              <th className="pb-3 font-semibold">Time</th>
              <th className="pb-3 font-semibold">Customer</th>
              <th className="pb-3 font-semibold text-center">Items</th>
              <th className="pb-3 font-semibold text-center">Amount</th>
              <th className="pb-3 font-semibold text-center">Payment</th>
              <th className="pb-3 font-semibold text-right">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 text-xs">
            {(transactions || []).map((tx) => (
              <tr
                key={tx.id}
                onClick={() => onSelectTransaction(tx)}
                className="hover:bg-slate-50 cursor-pointer transition-colors"
              >
                <td className="py-3 font-mono font-bold text-slate-900">{tx.id}</td>
                <td className="py-3 text-slate-500 font-mono text-[11px]">{tx.time}</td>
                <td className="py-3 font-semibold text-slate-700">{tx.customer}</td>
                <td className="py-3 text-center font-semibold text-slate-800">{tx.itemsCount} items</td>
                <td className="py-3 text-center font-black text-emerald-600">{tx.amount}</td>
                <td className="py-3 text-center">
                  <Badge variant="neutral" size="sm">
                    {tx.paymentMethod}
                  </Badge>
                </td>
                <td className="py-3 text-right">
                  <Badge variant="emerald" size="sm" dot>
                    {tx.status}
                  </Badge>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Card>
  );
}

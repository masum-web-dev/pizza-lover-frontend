"use client";

import React, { useEffect, useState, useCallback } from "react";
import { Loader2, Receipt } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

interface TransactionRecord {
  _id?: string;
  id?: string;
  vendorName?: string;
  vendorEmail?: string;
  vendorId?: string;
  plan?: string;
  amount?: number;
  currency?: string;
  status?: string;
  createdAt?: string;
}

export default function AdminTransactionsPage() {
  const [transactions, setTransactions] = useState<TransactionRecord[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const backendUrl =
    process.env.NEXT_PUBLIC_API_URL ||
    process.env.NEXT_PUBLIC_BACKEND_URL ||
    "http://localhost:8000";

  const fetchTransactions = useCallback(async () => {
    try {
      setIsLoading(true);
      const res = await fetch(`${backendUrl}/api/admin/transactions`, {
        credentials: "include",
      });

      if (!res.ok) {
        setTransactions([]);
        return;
      }

      const data = await res.json();
      setTransactions(Array.isArray(data) ? data : data.transactions || []);
    } catch {
      setTransactions([]);
    } finally {
      setIsLoading(false);
    }
  }, [backendUrl]);

  useEffect(() => {
    fetchTransactions();
  }, [fetchTransactions]);

  return (
    <div className="space-y-6">
      <div className="rounded-2xl border border-orange-200 bg-white p-5 md:p-6 shadow-sm">
        <h2 className="text-xl md:text-2xl font-extrabold text-gray-900">
          Transactions
        </h2>
        <p className="text-sm text-gray-600">
          View vendor subscription payment records. Payment history is
          read-only and cannot be modified.
        </p>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center py-16">
          <Loader2 className="h-8 w-8 animate-spin text-[#B91C1C]" />
        </div>
      ) : transactions.length === 0 ? (
        <Card className="rounded-2xl border-orange-200/80 bg-white shadow-sm">
          <CardHeader className="text-center py-12">
            <Receipt className="h-8 w-8 text-gray-400 mx-auto mb-2" />
            <CardTitle className="text-lg font-extrabold text-gray-900">
              No Transactions Yet
            </CardTitle>
            <CardDescription>
              Vendor subscription payments will appear here once completed.
            </CardDescription>
          </CardHeader>
        </Card>
      ) : (
        <div className="space-y-3">
          {transactions.map((txn) => (
            <Card
              key={String(txn._id || txn.id)}
              className="rounded-2xl border-orange-200/80 bg-white shadow-sm"
            >
              <CardContent className="p-4 md:p-5 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                <div className="space-y-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <h3 className="text-base font-extrabold text-gray-900">
                      {txn.vendorName || txn.vendorEmail || txn.vendorId || "Vendor"}
                    </h3>
                    <Badge className="bg-amber-100 text-amber-900 hover:bg-amber-100 border-0 font-bold capitalize">
                      {txn.plan || "premium"}
                    </Badge>
                    <Badge className="bg-emerald-100 text-emerald-800 hover:bg-emerald-100 border-0 font-bold capitalize">
                      {txn.status || "paid"}
                    </Badge>
                  </div>
                  <p className="text-xs text-gray-500">
                    Date:{" "}
                    {txn.createdAt
                      ? new Date(txn.createdAt).toLocaleDateString()
                      : "N/A"}
                  </p>
                </div>

                <div className="text-base font-extrabold text-[#B91C1C]">
                  {String(txn.currency || "USD").toUpperCase()}{" "}
                  {Number(txn.amount || 0).toFixed(2)}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
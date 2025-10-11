import React, { useState, useEffect } from "react";
import { base44 } from "../api/base44Client";
import { useNavigate } from "react-router-dom";
import { createPageUrl } from "../utils";
import { useQuery } from "@tanstack/react-query";
import { Calendar, FileText, ArrowRight, Trash2 } from "lucide-react";
import { format } from "date-fns";
import { Skeleton } from "../components/ui/skeleton";

export default function History() {
  const navigate = useNavigate();

  const { data: history, isLoading } = useQuery({
    queryKey: ['upload-history'],
    queryFn: () => base44.entities.UploadHistory.list('-created_date'),
    initialData: [],
  });

  const handleView = (id) => {
    navigate(createPageUrl(`Results?id=${id}`));
  };

  const handleDelete = async (id, e) => {
    e.stopPropagation();
    if (confirm("Delete this record?")) {
      await base44.entities.UploadHistory.delete(id);
      window.location.reload();
    }
  };

  return (
    <div className="min-h-screen px-6 py-16">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-12">
          <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-white to-cyan-400 bg-clip-text text-transparent mb-4">
            Your History
          </h1>
          <p className="text-xl text-slate-400">
            {history.length} {history.length === 1 ? 'conversion' : 'conversions'} saved
          </p>
        </div>

        {/* Grid */}
        {isLoading ? (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3, 4, 5, 6].map(i => (
              <Skeleton key={i} className="h-80 bg-white/5 rounded-3xl" />
            ))}
          </div>
        ) : history.length === 0 ? (
          <div className="text-center py-32">
            <div className="inline-flex p-8 rounded-full bg-white/5 mb-6">
              <FileText className="w-16 h-16 text-slate-600" />
            </div>
            <h3 className="text-2xl font-bold text-white mb-4">No conversions yet</h3>
            <p className="text-slate-400 mb-8">Upload your first image to get started</p>
            <button
              onClick={() => navigate(createPageUrl("Upload"))}
              className="px-8 py-4 bg-gradient-to-r from-cyan-500 to-amber-500 rounded-2xl text-white font-semibold text-lg transition-all duration-300 hover:scale-105"
            >
              Start Converting
            </button>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {history.map((item, index) => (
              <HistoryCard
                key={item.id}
                item={item}
                index={index}
                onView={() => handleView(item.id)}
                onDelete={(e) => handleDelete(item.id, e)}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function HistoryCard({ item, index, onView, onDelete }) {
  return (
    <div
      className="group relative rounded-3xl bg-gradient-to-br from-cyan-500/10 to-amber-500/10 border border-white/10 backdrop-blur-sm overflow-hidden hover:border-white/20 transition-all duration-500 hover:-translate-y-2 hover:shadow-2xl hover:shadow-cyan-500/20 cursor-pointer animate-fade-in-up"
      style={{ animationDelay: `${index * 50}ms` }}
      onClick={onView}
    >
      <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />

      <div className="relative z-10 p-6 space-y-4">
        {/* Image Preview */}
        <div className="relative rounded-2xl overflow-hidden bg-slate-900/50 h-48">
          <img
            src={item.image_url}
            alt={item.original_filename}
            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-transparent opacity-60" />
        </div>

        {/* Info */}
        <div className="space-y-3">
          <h3 className="text-lg font-bold text-white truncate">
            {item.original_filename}
          </h3>
          
          <div className="flex items-center gap-2 text-sm text-slate-400">
            <Calendar className="w-4 h-4" />
            {format(new Date(item.created_date), "MMM d, yyyy • h:mm a")}
          </div>

          <div className="flex items-center justify-between pt-4 border-t border-white/5">
            <div className="flex items-center gap-2 text-sm">
              <div className="px-3 py-1 rounded-lg bg-cyan-500/20 text-cyan-400 font-medium">
                {item.confidence_data?.overall || 0}% confident
              </div>
            </div>
            
            <div className="flex items-center gap-2">
              <button
                onClick={onDelete}
                className="p-2 rounded-lg text-red-400 hover:bg-red-500/10 transition-colors"
              >
                <Trash2 className="w-4 h-4" />
              </button>
              <button className="flex items-center gap-1 text-cyan-400 group-hover:gap-2 transition-all">
                View
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </div>

    </div>
  );
}
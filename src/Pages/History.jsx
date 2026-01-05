import React, { useState, useEffect, useMemo } from "react";
import { base44 } from "../api/base44Client";
import { useNavigate } from "react-router-dom";
import { createPageUrl } from "../utils";
import { useQuery } from "@tanstack/react-query";
import { Calendar, FileText, ArrowRight, Trash2, Search, Filter, X, Tag } from "lucide-react";
import { format } from "date-fns";
import { Skeleton } from "../components/ui/skeleton";
import toast from "react-hot-toast";

export default function History() {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");
  const [filterType, setFilterType] = useState("all"); // all, image, pdf
  const [sortBy, setSortBy] = useState("date"); // date, name, confidence
  const [sortOrder, setSortOrder] = useState("desc"); // asc, desc
  const [selectedTags, setSelectedTags] = useState([]);
  const [showFilters, setShowFilters] = useState(false);
  const [minConfidence, setMinConfidence] = useState(0);
  const [dateRange, setDateRange] = useState({ start: null, end: null });

  const { data: history, isLoading } = useQuery({
    queryKey: ['upload-history'],
    queryFn: () => base44.entities.UploadHistory.list('-created_date'),
    initialData: [],
  });

  // Filter and search logic
  const filteredHistory = useMemo(() => {
    let filtered = [...history];

    // Search by filename or text content
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(item => 
        item.original_filename?.toLowerCase().includes(query) ||
        item.extracted_text?.toLowerCase().includes(query)
      );
    }

    // Filter by file type
    if (filterType !== "all") {
      filtered = filtered.filter(item => {
        if (filterType === "image") {
          return item.file_type?.startsWith("image/") || !item.file_type;
        } else if (filterType === "pdf") {
          return item.file_type === "application/pdf";
        }
        return true;
      });
    }

    // Filter by confidence
    filtered = filtered.filter(item => 
      (item.confidence_data?.overall || 0) >= minConfidence
    );

    // Filter by date range
    if (dateRange.start) {
      filtered = filtered.filter(item => 
        new Date(item.created_date) >= new Date(dateRange.start)
      );
    }
    if (dateRange.end) {
      filtered = filtered.filter(item => 
        new Date(item.created_date) <= new Date(dateRange.end)
      );
    }

    // Sort
    filtered.sort((a, b) => {
      let comparison = 0;
      switch (sortBy) {
        case "name":
          comparison = (a.original_filename || "").localeCompare(b.original_filename || "");
          break;
        case "confidence":
          comparison = (a.confidence_data?.overall || 0) - (b.confidence_data?.overall || 0);
          break;
        case "date":
        default:
          comparison = new Date(a.created_date) - new Date(b.created_date);
          break;
      }
      return sortOrder === "asc" ? comparison : -comparison;
    });

    return filtered;
  }, [history, searchQuery, filterType, sortBy, sortOrder, minConfidence, dateRange]);

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

  const clearFilters = () => {
    setSearchQuery("");
    setFilterType("all");
    setSortBy("date");
    setSortOrder("desc");
    setMinConfidence(0);
    setDateRange({ start: null, end: null });
  };

  return (
    <div className="min-h-screen px-6 py-16">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-12">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
            <div>
              <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-white to-cyan-400 bg-clip-text text-transparent mb-4">
                Your History
              </h1>
              <p className="text-xl text-slate-400">
                {filteredHistory.length} of {history.length} {history.length === 1 ? 'conversion' : 'conversions'}
              </p>
            </div>
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="flex items-center gap-2 px-4 py-2 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl text-white transition-all"
            >
              <Filter className="w-4 h-4" />
              Filters
            </button>
          </div>

          {/* Search Bar */}
          <div className="relative mb-6">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-slate-400" />
            <input
              type="text"
              placeholder="Search by filename or content..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-12 pr-4 py-3 bg-slate-800/50 border border-white/10 rounded-xl text-white placeholder-slate-400 focus:outline-none focus:border-cyan-500/50 focus:ring-2 focus:ring-cyan-500/20 transition-all"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery("")}
                className="absolute right-4 top-1/2 transform -translate-y-1/2 text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            )}
          </div>

          {/* Filters Panel */}
          {showFilters && (
            <div className="mb-6 p-6 bg-slate-800/30 border border-white/10 rounded-2xl">
              <div className="grid md:grid-cols-3 gap-4 mb-4">
                <div>
                  <label className="block text-white font-medium mb-2">File Type</label>
                  <select
                    value={filterType}
                    onChange={(e) => setFilterType(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-700 border border-white/10 rounded-lg text-white focus:outline-none focus:border-cyan-500"
                  >
                    <option value="all">All Types</option>
                    <option value="image">Images</option>
                    <option value="pdf">PDFs</option>
                  </select>
                </div>
                <div>
                  <label className="block text-white font-medium mb-2">Sort By</label>
                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-700 border border-white/10 rounded-lg text-white focus:outline-none focus:border-cyan-500"
                  >
                    <option value="date">Date</option>
                    <option value="name">Name</option>
                    <option value="confidence">Confidence</option>
                  </select>
                </div>
                <div>
                  <label className="block text-white font-medium mb-2">Order</label>
                  <select
                    value={sortOrder}
                    onChange={(e) => setSortOrder(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-700 border border-white/10 rounded-lg text-white focus:outline-none focus:border-cyan-500"
                  >
                    <option value="desc">Newest First</option>
                    <option value="asc">Oldest First</option>
                  </select>
                </div>
              </div>
              <div className="grid md:grid-cols-2 gap-4 mb-4">
                <div>
                  <label className="block text-white font-medium mb-2">
                    Min Confidence: {minConfidence}%
                  </label>
                  <input
                    type="range"
                    min="0"
                    max="100"
                    value={minConfidence}
                    onChange={(e) => setMinConfidence(Number(e.target.value))}
                    className="w-full"
                  />
                </div>
                <div>
                  <label className="block text-white font-medium mb-2">Date Range</label>
                  <div className="flex gap-2">
                    <input
                      type="date"
                      value={dateRange.start || ""}
                      onChange={(e) => setDateRange({ ...dateRange, start: e.target.value })}
                      className="flex-1 px-3 py-2 bg-slate-700 border border-white/10 rounded-lg text-white focus:outline-none focus:border-cyan-500"
                    />
                    <input
                      type="date"
                      value={dateRange.end || ""}
                      onChange={(e) => setDateRange({ ...dateRange, end: e.target.value })}
                      className="flex-1 px-3 py-2 bg-slate-700 border border-white/10 rounded-lg text-white focus:outline-none focus:border-cyan-500"
                    />
                  </div>
                </div>
              </div>
              <button
                onClick={clearFilters}
                className="px-4 py-2 bg-red-500/20 hover:bg-red-500/30 border border-red-500/30 rounded-lg text-red-400 transition-colors"
              >
                Clear All Filters
              </button>
            </div>
          )}
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
        ) : filteredHistory.length === 0 ? (
          <div className="text-center py-32">
            <div className="inline-flex p-8 rounded-full bg-white/5 mb-6">
              <Search className="w-16 h-16 text-slate-600" />
            </div>
            <h3 className="text-2xl font-bold text-white mb-4">No results found</h3>
            <p className="text-slate-400 mb-8">Try adjusting your search or filters</p>
            <button
              onClick={clearFilters}
              className="px-8 py-4 bg-gradient-to-r from-cyan-500 to-amber-500 rounded-2xl text-white font-semibold text-lg transition-all duration-300 hover:scale-105"
            >
              Clear Filters
            </button>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredHistory.map((item, index) => (
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

import React from 'react';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import type { SearchFilters } from '@/types/opportunity';

const categories = [
  'Environment',
  'Education',
  'Health',
  'Community',
  'Animals',
  'Arts & Culture',
];

interface SearchFiltersProps {
  filters: SearchFilters;
  onFilterChange: (filters: SearchFilters) => void;
}

export function SearchFilters({ filters, onFilterChange }: SearchFiltersProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
      <Input
        placeholder="Search by location..."
        value={filters.location || ''}
        onChange={(e) => onFilterChange({ ...filters, location: e.target.value })}
      />
      <Select
        value={filters.category || 'all'}
        onValueChange={(value) => onFilterChange({ ...filters, category: value })}
      >
        <SelectTrigger>
          <SelectValue placeholder="Select category" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All Categories</SelectItem>
          {categories.map((category) => (
            <SelectItem key={category} value={category}>
              {category}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      <Input
        type="date"
        value={filters.date || ''}
        onChange={(e) => onFilterChange({ ...filters, date: e.target.value })}
      />
    </div>
  );
}

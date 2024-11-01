import { Search } from 'lucide-react';

interface SearchBarProps {
  searchTerm: string;
  onSearch: (value: string) => void;
  placeholder: string;
  className?: string;
}

export const SearchBar = ({ searchTerm, onSearch, placeholder, className }: SearchBarProps) => (
  <div className={`flex items-center h-10 gap-2 px-4 py-2 bg-white rounded-lg mb-8 border ${searchTerm ? 'border-blue-500' : 'border-gray-300'} focus-within:border-blue-500 ${className}`}>
    <Search className="w-6 h-6 text-gray-400" />
    <input
      type="text"
      className="focus:outline-none w-full"
      placeholder={placeholder}
      value={searchTerm}
      onChange={e => onSearch(e.target.value)}
    />
  </div>
);

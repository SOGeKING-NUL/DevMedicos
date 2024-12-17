import { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { useDebounce } from './useDebounce';

interface AutocompleteHookResult {
  suggestions: string[];
  selectedIndex: number;
  setSelectedIndex: (index: number) => void;
  isLoading: boolean;
  handleKeyDown: (e: React.KeyboardEvent<HTMLInputElement>) => void;
  handleInputChange: (value: string) => void;
  handleSuggestionClick: (suggestion: string) => void;
  highlightedText: (text: string) => string;
  isValidSelection: boolean;
  selectedMRP: number | null;
}

export const useAutocomplete = (
  value: string,
  onChange: (value: string, mrp?: number) => void
): AutocompleteHookResult => {
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const [isLoading, setIsLoading] = useState(false);
  const [allItems, setAllItems] = useState<string[]>([]);
  const [isValidSelection, setIsValidSelection] = useState(false);
  const [selectedMRP, setSelectedMRP] = useState<number | null>(null);
  
  const debouncedValue = useDebounce(value, 300);

  const fetchMRP = async (item: string) => {
    try {
      const response = await axios.get(`http://localhost:3500/api/items/showmrp`, {
        params: { item }
      });
      const mrp = response.data[0];
      setSelectedMRP(mrp);
      return mrp;
    } catch (error) {
      console.error('Error fetching MRP:', error);
      setSelectedMRP(null);
      return null;
    }
  };

  useEffect(() => {
    const fetchItems = async () => {
      try {
        const response = await axios.get('http://localhost:3500/api/items/showitems');
        setAllItems(response.data);
      } catch (error) {
        console.error('Error fetching items:', error);
      }
    };

    fetchItems();
  }, []);

  useEffect(() => {
    if (debouncedValue) {
      setIsLoading(true);
      const searchTerm = debouncedValue.toLowerCase();
      const filtered = allItems
        .filter(item => item.toLowerCase().includes(searchTerm))
        .sort((a, b) => {
          const aStartsWith = a.toLowerCase().startsWith(searchTerm);
          const bStartsWith = b.toLowerCase().startsWith(searchTerm);
          if (aStartsWith && !bStartsWith) return -1;
          if (!aStartsWith && bStartsWith) return 1;
          return a.localeCompare(b);
        })
        .slice(0, 5);
      
      setSuggestions(filtered);
      setSelectedIndex(-1);
      setIsLoading(false);
      
      // Check if current value exactly matches an item
      const exactMatch = allItems.find(
        item => item.toLowerCase() === debouncedValue.toLowerCase()
      );
      setIsValidSelection(!!exactMatch);
    } else {
      setSuggestions([]);
      setIsValidSelection(false);
    }
  }, [debouncedValue, allItems]);

  const handleKeyDown = useCallback(
    async (e: React.KeyboardEvent<HTMLInputElement>) => {
      if (!suggestions.length) return;

      switch (e.key) {
        case 'ArrowDown':
          e.preventDefault();
          setSelectedIndex(prev => 
            prev < suggestions.length - 1 ? prev + 1 : prev
          );
          break;

        case 'ArrowUp':
          e.preventDefault();
          setSelectedIndex(prev => (prev > 0 ? prev - 1 : prev));
          break;

        case 'Enter':
          e.preventDefault();
          if (selectedIndex >= 0) {
            const selectedItem = suggestions[selectedIndex];
            const mrp = await fetchMRP(selectedItem);
            onChange(selectedItem, mrp);
            setSuggestions([]);
            setIsValidSelection(true);
          }
          break;

        case 'Escape':
          setSuggestions([]);
          setSelectedIndex(-1);
          break;

        case 'Tab':
          if (suggestions.length > 0) {
            e.preventDefault();
            const selectedItem = suggestions[0];
            const mrp = await fetchMRP(selectedItem);
            onChange(selectedItem, mrp);
            setSuggestions([]);
            setIsValidSelection(true);
          }
          break;
      }
    },
    [suggestions, selectedIndex, onChange]
  );

  const handleInputChange = (value: string) => {
    onChange(value);
    setIsValidSelection(false);
    setSelectedMRP(null);
  };

  const handleSuggestionClick = async (suggestion: string) => {
    const mrp = await fetchMRP(suggestion);
    onChange(suggestion, mrp);
    setSuggestions([]);
    setIsValidSelection(true);
  };

  const highlightedText = (text: string) => {
    if (!value) return text;
    const regex = new RegExp(`(${value})`, 'gi');
    return text.replace(regex, '<mark class="bg-green-100 text-green-800 font-normal">$1</mark>');
  };

  return {
    suggestions,
    selectedIndex,
    setSelectedIndex,
    isLoading,
    handleKeyDown,
    handleInputChange,
    handleSuggestionClick,
    highlightedText,
    isValidSelection,
    selectedMRP
  };
};
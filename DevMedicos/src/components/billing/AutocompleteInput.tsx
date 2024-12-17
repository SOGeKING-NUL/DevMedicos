import React, { useState, useRef, useEffect } from 'react';
import { useAutocomplete } from '../../hooks/useAutocomplete';

interface AutocompleteInputProps {
  value: string;
  onChange: (value: string, mrp?: number) => void;
  onKeyDown: (e: React.KeyboardEvent<HTMLInputElement>) => void;
  error?: string;
  placeholder?: string;
  className?: string;
  inputRef?: React.RefObject<HTMLInputElement>;
  onValidSelection?: (isValid: boolean) => void;
}

const AutocompleteInput: React.FC<AutocompleteInputProps> = ({
  value,
  onChange,
  onKeyDown,
  error,
  placeholder,
  className,
  inputRef: externalRef,
  onValidSelection,
}) => {
  const localInputRef = useRef<HTMLInputElement>(null);
  const inputRef = externalRef || localInputRef;
  const [isFocused, setIsFocused] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const {
    suggestions,
    selectedIndex,
    setSelectedIndex,
    highlightedText,
    handleKeyDown: handleAutocompleteKeyDown,
    handleInputChange,
    handleSuggestionClick,
    isLoading,
    isValidSelection,
    // selectedMRP
  } = useAutocomplete(value, onChange);

  useEffect(() => {
    if (onValidSelection) {
      onValidSelection(isValidSelection);
    }
  }, [isValidSelection, onValidSelection]);

  const handleKeyDownWrapper = (e: React.KeyboardEvent<HTMLInputElement>) => {
    handleAutocompleteKeyDown(e);
    if (isValidSelection || e.key !== 'Enter') {
      onKeyDown(e);
    }
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        inputRef.current && 
        !inputRef.current.contains(event.target as Node) &&
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsFocused(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [inputRef]);

  useEffect(() => {
    if (inputRef.current && dropdownRef.current && isFocused) {
      const inputRect = inputRef.current.getBoundingClientRect();
      dropdownRef.current.style.width = `${inputRect.width}px`;
      dropdownRef.current.style.top = `${inputRect.bottom + window.scrollY + 4}px`;
      dropdownRef.current.style.left = `${inputRect.left + window.scrollX}px`;
    }
  }, [isFocused, suggestions]);

  const shouldShowDropdown = isFocused && value && !isValidSelection && (suggestions.length > 0 || isLoading);

  return (
    <div className="relative w-full">
      <input
        ref={inputRef}
        type="text"
        value={value}
        onChange={(e) => handleInputChange(e.target.value)}
        onKeyDown={handleKeyDownWrapper}
        onFocus={() => setIsFocused(true)}
        placeholder={placeholder}
        className={`w-full p-2 border rounded-lg ${
          error ? 'border-red-500 bg-red-50' : isValidSelection ? 'border-green-500 bg-green-50' : 'border-gray-300'
        } ${className}`}
      />

      {error && <p className="text-red-500 text-sm mt-1">{error}</p>}

      {shouldShowDropdown && (
        <div
          ref={dropdownRef}
          className="fixed z-50 bg-white border border-gray-200 rounded-lg shadow-lg max-h-60 overflow-auto"
          style={{ minWidth: '200px' }}
        >
          {isLoading ? (
            <div className="px-4 py-2 text-gray-500">Loading...</div>
          ) : (
            suggestions.map((suggestion, index) => (
              <div
                key={index}
                className={`px-4 py-2 cursor-pointer ${
                  index === selectedIndex
                    ? 'bg-green-50 text-green-700'
                    : 'hover:bg-gray-50'
                }`}
                onClick={() => {
                  handleSuggestionClick(suggestion);
                  setIsFocused(false);
                }}
                onMouseEnter={() => setSelectedIndex(index)}
                dangerouslySetInnerHTML={{ __html: highlightedText(suggestion) }}
              />
            ))
          )}
        </div>
      )}
    </div>
  );
};

export default AutocompleteInput;
import React, { useState, useRef, useEffect } from 'react';

interface CustomDropdownProps {
  options: { value: string; label: string }[];
  selected: string;
  onChange: (value: string) => void;
  placeholder?: string;
}

const CustomDropdown: React.FC<CustomDropdownProps> = ({ options, selected, onChange, placeholder }) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className="relative w-full" ref={dropdownRef}>
      <button
        type="button"
        onClick={() => setIsOpen((open) => !open)}
        className="w-full bg-onyx-600 backdrop-blur-sm border border-onyx-600/30 rounded-xl px-4 py-3 text-white flex justify-between items-center focus:border-giants_orange-500 focus:outline-none transition-colors"
      >
        <span>{selected ? options.find(option => option.value === selected)?.label : placeholder || 'Select an option'}</span>
        <svg className={`w-4 h-4 ml-2 transition-transform ${isOpen ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" /></svg>
      </button>
      {isOpen && (
        <ul className="absolute z-20 w-full bg-onyx-600 border border-onyx-600/30 rounded-xl mt-2 shadow-lg max-h-60 overflow-auto">
          {options.map(option => (
            <li
              key={option.value}
              onClick={() => {
                onChange(option.value);
                setIsOpen(false);
              }}
              className={`px-4 py-3 text-white cursor-pointer transition-colors hover:bg-giants_orange-500 ${selected === option.value ? 'bg-onyx-600/80' : ''}`}
            >
              {option.label}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default CustomDropdown;

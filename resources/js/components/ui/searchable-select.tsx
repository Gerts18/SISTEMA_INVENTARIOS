import React, { useState, useRef, useEffect } from 'react';
import { ChevronDown } from 'lucide-react';

interface Option {
    value: string;
    label: string;
}

interface SearchableSelectProps {
    options: Option[];
    value: string;
    onChange: (value: string) => void;
    placeholder?: string;
    className?: string;
}

export const SearchableSelect: React.FC<SearchableSelectProps> = ({
    options,
    value,
    onChange,
    placeholder = 'Seleccione una opción',
    className = '',
}) => {
    const [isOpen, setIsOpen] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [displayValue, setDisplayValue] = useState('');
    const selectRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const selectedOption = options.find(option => option.value === value);
        setDisplayValue(selectedOption ? selectedOption.label : '');
    }, [value, options]);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (selectRef.current && !selectRef.current.contains(event.target as Node)) {
                setIsOpen(false);
                setSearchTerm('');
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const filteredOptions = options.filter(option =>
        option.label.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const handleSelect = (selectedValue: string) => {
        onChange(selectedValue);
        setIsOpen(false);
        setSearchTerm('');
    };

    return (
        <div className={`relative ${className}`} ref={selectRef}>
            <div
                className="w-full rounded border  px-3 py-2 text-black dark:text-white cursor-pointer flex items-center justify-between"
                onClick={() => setIsOpen(!isOpen)}
            >
                <span className={displayValue ? '' : 'text-gray-500'}>
                    {displayValue || placeholder}
                </span>
                <ChevronDown className={`h-4 w-4 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
            </div>

            {isOpen && (
                <div className="absolute z-50 w-full mt-1 bg-white dark:bg-zinc-900 border rounded shadow-lg">
                    <div className="p-2">
                        <input
                            type="text"
                            className="w-full px-2 py-1 border rounded text-sm bg-white dark:bg-zinc-800 text-black dark:text-white"
                            placeholder="Buscar..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            autoFocus
                        />
                    </div>
                    <div className="max-h-60 overflow-y-auto">
                        {filteredOptions.length === 0 ? (
                            <div className="px-3 py-2 text-gray-500 text-sm">
                                No se encontraron opciones
                            </div>
                        ) : (
                            filteredOptions.map((option) => (
                                <div
                                    key={option.value}
                                    className="px-3 py-2 hover:bg-gray-100 dark:hover:bg-zinc-800 cursor-pointer text-sm"
                                    onClick={() => handleSelect(option.value)}
                                >
                                    {option.label}
                                </div>
                            ))
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};

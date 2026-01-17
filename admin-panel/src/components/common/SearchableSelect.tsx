import { useState, useRef, useEffect } from 'react';

interface Option {
    id: string | number;
    label: string;
}

interface SearchableSelectProps {
    options: Option[];
    value: string | number | undefined;
    onChange: (value: string | number) => void;
    placeholder?: string;
    label?: string;
    disabled?: boolean;
    className?: string;
    required?: boolean;
}

export default function SearchableSelect({
    options,
    value,
    onChange,
    placeholder = 'Select...',
    label,
    disabled = false,
    className = '',
    required = false
}: SearchableSelectProps) {
    const [isOpen, setIsOpen] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const containerRef = useRef<HTMLDivElement>(null);
    const inputRef = useRef<HTMLInputElement>(null);

    const selectedOption = options.find(o => o.id === value);

    // Filter options
    const filteredOptions = options.filter(option =>
        option.label.toLowerCase().includes(searchTerm.toLowerCase())
    );

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const handleSelect = (optionId: string | number) => {
        onChange(optionId);
        setIsOpen(false);
        setSearchTerm('');
    };

    return (
        <div className={`relative ${className}`} ref={containerRef}>
            {label && (
                <label className="block text-sm font-black text-gray-400 uppercase tracking-widest mb-2">
                    {label} {required && <span className="text-red-500">*</span>}
                </label>
            )}

            <div
                className={`w-full px-5 py-3.5 bg-gray-50/50 border hover:border-primary-300 rounded-2xl cursor-pointer transition-all flex items-center justify-between ${isOpen ? 'ring-4 ring-primary-500/10 border-primary-500' : 'border-gray-200'
                    } ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
                onClick={() => {
                    if (!disabled) {
                        setIsOpen(!isOpen);
                        if (!isOpen) setTimeout(() => inputRef.current?.focus(), 100);
                    }
                }}
            >
                <div className="flex-1 truncate font-bold text-gray-900">
                    {selectedOption ? selectedOption.label : <span className="text-gray-400 font-normal">{placeholder}</span>}
                </div>
                <svg
                    className={`w-5 h-5 text-gray-400 transition-transform ${isOpen ? 'rotate-180' : ''}`}
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
            </div>

            {isOpen && (
                <div className="absolute z-50 w-full mt-2 bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden animate-in fade-in zoom-in duration-200">
                    <div className="p-2 border-b border-gray-50">
                        <input
                            ref={inputRef}
                            type="text"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full px-4 py-2 bg-gray-50 rounded-xl border-none focus:ring-2 focus:ring-primary-500/50 outline-none text-sm font-semibold"
                            placeholder="Search..."
                            onClick={(e) => e.stopPropagation()}
                        />
                    </div>
                    <div className="max-h-60 overflow-y-auto">
                        {filteredOptions.length > 0 ? (
                            filteredOptions.map((option) => (
                                <div
                                    key={option.id}
                                    onClick={() => handleSelect(option.id)}
                                    className={`px-5 py-3 cursor-pointer hover:bg-gray-50 transition-colors text-sm font-semibold ${option.id === value ? 'bg-primary-50 text-primary-700' : 'text-gray-700'
                                        }`}
                                >
                                    {option.label}
                                </div>
                            ))
                        ) : (
                            <div className="px-5 py-8 text-center text-gray-400 text-sm font-medium">
                                No options found
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}

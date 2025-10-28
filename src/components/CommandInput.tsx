
import React from 'react';

interface CommandInputProps {
    value: string;
    onChange: (value: string) => void;
}

export const CommandInput: React.FC<CommandInputProps> = ({ value, onChange }) => {
    return (
        <div>
            <label htmlFor="command-input" className="block text-sm font-medium text-gray-400 mb-2">
                Enter `sacman` command:
            </label>
            <div className="flex items-center bg-gray-800 rounded-md p-3 border border-gray-700 focus-within:ring-2 focus-within:ring-green-500 focus-within:border-green-500">
                <span className="text-green-400 mr-2">$</span>
                <input
                    id="command-input"
                    type="text"
                    value={value}
                    onChange={(e) => onChange(e.target.value)}
                    className="w-full bg-transparent text-gray-200 placeholder-gray-500 focus:outline-none"
                    placeholder="e.g. sacman -Sty tlp"
                    autoComplete="off"
                    autoCapitalize="off"
                    autoCorrect="off"
                />
            </div>
        </div>
    );
};

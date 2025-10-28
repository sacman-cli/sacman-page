
import React, { useState, useEffect } from 'react';
import { ClipboardIcon } from './icons/ClipboardIcon';

interface CodeDisplayProps {
    title: string;
    code: string;
}

export const CodeDisplay: React.FC<CodeDisplayProps> = ({ title, code }) => {
    const [copied, setCopied] = useState(false);

    useEffect(() => {
        if (copied) {
            const timer = setTimeout(() => setCopied(false), 2000);
            return () => clearTimeout(timer);
        }
    }, [copied]);

    const handleCopy = () => {
        if (code) {
            navigator.clipboard.writeText(code);
            setCopied(true);
        }
    };
    
    return (
        <div className="bg-gray-800 rounded-md border border-gray-700 p-4">
            <label className="block text-sm font-medium text-gray-400 mb-2">
                {title}
            </label>
            <div className="relative bg-black bg-opacity-50 rounded-md">
                <pre className="text-gray-300 overflow-x-auto p-3 text-xs leading-relaxed" style={{ maxHeight: '400px' }}>
                    <code>{code}</code>
                </pre>
                <button
                    onClick={handleCopy}
                    className="absolute top-2 right-2 p-1.5 rounded-md text-gray-400 hover:bg-gray-700 hover:text-white focus:outline-none focus:ring-2 focus:ring-green-500"
                    aria-label="Copy code"
                >
                    <ClipboardIcon />
                    <span className="absolute -top-8 right-0 bg-gray-900 text-white text-xs px-2 py-1 rounded transition-opacity duration-200" style={{opacity: copied ? 1 : 0}}>
                        Copied!
                    </span>
                </button>
            </div>
        </div>
    );
};

import React, { useState, useEffect } from 'react';
import type { ParseResult } from '../types';
import { ClipboardIcon } from './icons/ClipboardIcon';
import { InfoIcon } from './icons/InfoIcon';


export const CommandOutput: React.FC<{ result: ParseResult | null }> = ({ result }) => {
    const [copied, setCopied] = useState(false);

    useEffect(() => {
        if (copied) {
            const timer = setTimeout(() => setCopied(false), 2000);
            return () => clearTimeout(timer);
        }
    }, [copied]);

    const handleCopy = () => {
        if (result?.command) {
            navigator.clipboard.writeText(result.command);
            setCopied(true);
        }
    };
    
    if (!result) {
        return null;
    }

    const { command, explanation, error, isDryRun, isSystemctlDryRun } = result;

    return (
        <div className="bg-gray-800 rounded-md border border-gray-700 p-4 space-y-4">
            <div>
                <label className="block text-sm font-medium text-gray-400 mb-2">
                    Generated `systemctl` command:
                </label>
                <div className="relative bg-black bg-opacity-50 rounded-md p-3">
                    <pre className="text-green-300 overflow-x-auto">
                        <code>{command || '...'}</code>
                    </pre>
                    {command && (
                        <button
                            onClick={handleCopy}
                            className="absolute top-2 right-2 p-1.5 rounded-md text-gray-400 hover:bg-gray-700 hover:text-white focus:outline-none focus:ring-2 focus:ring-green-500"
                            aria-label="Copy command"
                        >
                            <ClipboardIcon />
                            <span className="absolute -top-8 right-0 bg-gray-900 text-white text-xs px-2 py-1 rounded transition-opacity duration-200" style={{opacity: copied ? 1 : 0}}>
                                Copied!
                            </span>
                        </button>
                    )}
                </div>
            </div>

            {explanation && (
                <div className="text-sm text-gray-400 flex items-start space-x-2">
                    <InfoIcon className="flex-shrink-0 mt-0.5" />
                    <span>{explanation}</span>
                </div>
            )}
            {error && (
                 <div className="text-sm text-red-400 flex items-start space-x-2">
                    <InfoIcon className="flex-shrink-0 mt-0.5 text-red-400" />
                    <span><strong>Error:</strong> {error}</span>
                </div>
            )}
             {isDryRun && (
                <div className="text-sm text-yellow-400 bg-yellow-900 bg-opacity-30 p-3 rounded-md flex items-start space-x-2">
                    <InfoIcon className="flex-shrink-0 mt-0.5 text-yellow-400" />
                    <span>The <strong>-z</strong> flag means this is a sacman dry-run. This web app inherently provides a dry-run for all commands.</span>
                </div>
            )}
            {isSystemctlDryRun && (
                <div className="text-sm text-blue-400 bg-blue-900 bg-opacity-30 p-3 rounded-md flex items-start space-x-2">
                    <InfoIcon className="flex-shrink-0 mt-0.5 text-blue-400" />
                    <span>The <strong>-D</strong> flag enables systemctl's dry-run. The command will be checked for validity, but the unit state will not be changed.</span>
                </div>
            )}
        </div>
    );
};


import React, { useState, useEffect } from 'react';
import { CommandInput } from './components/CommandInput';
import { CommandOutput } from './components/CommandOutput';
import { ReferenceSection } from './components/ReferenceSection';
import { CodeDisplay } from './components/CodeDisplay';
import { parseSacmanCommand } from './services/parser';
import { sacmanPythonScript } from './sacmanScript';
import type { ParseResult } from './types';

const App: React.FC = () => {
    const [inputValue, setInputValue] = useState('sacman -Styuq mpris-proxy');
    const [parseResult, setParseResult] = useState<ParseResult | null>(null);

    useEffect(() => {
        const handler = setTimeout(() => {
            setParseResult(parseSacmanCommand(inputValue));
        }, 200);

        return () => {
            clearTimeout(handler);
        };
    }, [inputValue]);

    return (
        <div className="min-h-screen bg-gray-900 text-gray-200 font-mono p-4 sm:p-6 lg:p-8">
            <div className="max-w-7xl mx-auto">
                <header className="mb-8 text-center">
                    <h1 className="text-4xl sm:text-5xl font-bold text-green-400">sacman online</h1>
                    <p className="mt-2 text-lg text-gray-400">Interactive `systemctl` command generator & implementation</p>
                </header>

                <main className="grid grid-cols-1 lg:grid-cols-2 lg:gap-12">
                    <div className="flex flex-col space-y-6">
                        <CommandInput value={inputValue} onChange={setInputValue} />
                        <CommandOutput result={parseResult} />
                        <CodeDisplay title="Python `sacman` Executable" code={sacmanPythonScript} />
                    </div>
                    <div className="mt-12 lg:mt-0">
                       <ReferenceSection />
                    </div>
                </main>
                
                <footer className="text-center mt-12 text-gray-500 text-sm">
                    <p>Built with React & Tailwind CSS. Based on the sacman-spec.</p>
                </footer>
            </div>
        </div>
    );
};

export default App;

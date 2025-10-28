
import React from 'react';
import { SPEC_DATA } from '../constants';
import type { ReferenceTableData } from '../types';

const ReferenceTable: React.FC<{ data: ReferenceTableData }> = ({ data }) => {
    return (
        <div className="bg-gray-800 border border-gray-700 rounded-lg overflow-hidden not-prose">
            <h3 className="text-lg font-bold text-green-400 p-4 border-b border-gray-700">{data.title}</h3>
            <div className="overflow-x-auto">
                <table className="w-full text-sm text-left">
                    <thead className="bg-gray-700 bg-opacity-50 text-gray-300 uppercase tracking-wider">
                        <tr>
                            {data.headers.map((header) => (
                                <th key={header} scope="col" className="px-4 py-2 font-medium">
                                    {header}
                                </th>
                            ))}
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-700">
                        {data.rows.map((row, index) => (
                            <tr key={index} className="hover:bg-gray-700 transition-colors duration-150">
                                {data.headers.map((header) => (
                                    <td key={header} className="px-4 py-2 whitespace-nowrap">
                                        <span dangerouslySetInnerHTML={{ __html: row[header] || '' }} />
                                    </td>
                                ))}
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export const ReferenceSection: React.FC = () => {
    return (
        <div className="space-y-8">
            <h2 className="text-2xl font-bold text-center text-gray-300">Command Reference</h2>
            {SPEC_DATA.map(table => (
                <ReferenceTable key={table.title} data={table} />
            ))}
        </div>
    );
}

export interface ParseResult {
  command: string;
  explanation: string;
  error?: string;
  isDryRun?: boolean; // sacman dry run (-z)
  isSystemctlDryRun?: boolean; // systemctl dry run (-D)
}

export interface ReferenceTableData {
  title: string;
  headers: string[];
  rows: { [key: string]: string }[];
}

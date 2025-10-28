export const sacmanPythonScript = `#!/usr/bin/env python
import sys
import subprocess

SPEC_DATA = [
    {
        "title": "Main Operations",
        "headers": ["Operation", "Description"],
        "rows": [
            {"Operation": "-S", "Description": "Sync/Start operations (enable, start, etc.)."},
            {"Operation": "-R", "Description": "Remove/Stop operations (disable, stop, etc.)."},
            {"Operation": "-Q", "Description": "Query operations (list units, status, etc.)."},
            {"Operation": "-F", "Description": "File operations (edit unit files)."},
            {"Operation": "-T", "Description": "Test/check operations (is-enabled, etc.)."},
            {"Operation": "-J", "Description": "Job operations (list or cancel jobs)."},
            {"Operation": "-N", "Description": "Environment block operations."},
        ],
    },
    {
        "title": "Query Operations (-Q)",
        "headers": ["Flag", "systemctl command", "Description"],
        "rows": [
            {"Flag": "-Ql", "systemctl command": "list-unit-files", "Description": "List all installed unit files."},
            {"Flag": "-Qy", "systemctl command": "list-units", "Description": "List active units."},
            {"Flag": "-Qi <unit>", "systemctl command": "status <unit>", "Description": "Show the status of a unit."},
            {"Flag": "-Qd <unit>", "systemctl command": "list-dependencies <unit>", "Description": "List dependencies of a unit."},
            {"Flag": "-Qj", "systemctl command": "list-jobs", "Description": "List active jobs."},
            {"Flag": "-Qo", "systemctl command": "list-automounts", "Description": "List automounts."},
        ],
    },
    {
        "title": "Sync/Start Operations (-S)",
        "headers": ["Flag", "systemctl command", "Description"],
        "rows": [
            {"Flag": "-S <unit>", "systemctl command": "enable <unit>", "Description": "Enable a unit to start on boot."},
            {"Flag": "-St <unit>", "systemctl command": "start <unit>", "Description": "Start a unit immediately."},
            {"Flag": "-Sty <unit>", "systemctl command": "restart <unit>", "Description": "Restart a unit."},
            {"Flag": "-Sd <unit>", "systemctl command": "reload <unit>", "Description": "Reload a unit's configuration."},
        ],
    },
    {
        "title": "Other Operations",
        "headers": ["Flag", "systemctl command", "Description"],
        "rows": [
            {"Flag": "-Fe <unit>", "systemctl command": "edit <unit>", "Description": "Edit a unit file."},
            {"Flag": "-Ts <unit>", "systemctl command": "is-enabled <unit>", "Description": "Check if a unit is enabled."},
            {"Flag": "-Jl", "systemctl command": "list-jobs", "Description": "List active jobs."},
            {"Flag": "-Jc [job..]", "systemctl command": "cancel [job..]", "Description": "Cancel one or more jobs."},
        ],
    },
    {
        "title": "Global Modifiers",
        "headers": ["Flag", "systemctl option", "Description"],
        "rows": [
            {"Flag": "u", "systemctl option": "--user", "Description": "Operate on the user's services."},
            {"Flag": "n", "systemctl option": "--now", "Description": "With enable/disable, also starts/stops the unit."},
            {"Flag": "a", "systemctl option": "--all", "Description": "Show all units/properties."},
            {"Flag": "f", "systemctl option": "--force", "Description": "Force the operation."},
            {"Flag": "D", "systemctl option": "--dry-run", "Description": "Enable systemctl's dry-run mode."},
            {"Flag": "z", "systemctl option": "N/A", "Description": "sacman dry-run (print command only)."},
        ],
    },
]

def print_help():
    print("sacman: A pacman-like wrapper for systemctl.")
    print("\\nUsage: sacman <operation> [options...] [targets...]")
    print("\\nExample: sacman -Sty nginx.service")

    for section in SPEC_DATA:
        print(f"\\n{section['title']}:")
        
        # Calculate column widths
        headers = [h.replace('<code>', '').replace('</code>', '') for h in section['headers']]
        col_widths = [len(h) for h in headers]
        
        for row in section['rows']:
            for i, header in enumerate(section['headers']):
                cell_content = row.get(header.replace('<code>', '').replace('</code>', ''), "")
                col_widths[i] = max(col_widths[i], len(cell_content))

        # Print header
        header_line = ""
        for i, header in enumerate(headers):
            header_line += header.ljust(col_widths[i] + 2)
        print(f"  {header_line}")

        # Print rows
        for row in section['rows']:
            row_line = ""
            for i, header in enumerate(headers):
                cell_content = row.get(header, "")
                row_line += cell_content.ljust(col_widths[i] + 2)
            print(f"  {row_line}")

def main():
    args = sys.argv[1:]
    if not args or '-h' in args or '--help' in args:
        print_help()
        sys.exit(0)

    op_arg_str = None
    op_arg_index = -1
    for i, arg in enumerate(args):
        if arg.startswith('-') and not arg.startswith('--'):
            op_arg_str = arg
            op_arg_index = i
            break
    
    if op_arg_index == -1:
        command = ['systemctl'] + args
        print(f"No sacman options detected. Passing through to systemctl:")
        print(f"$ {' '.join(command)}")
        subprocess.run(command)
        return

    main_op = op_arg_str[1]
    modifiers = set(op_arg_str[2:])
    
    non_flag_args = [arg for i, arg in enumerate(args) if i != op_arg_index and not arg.startswith('--')]
    systemctl_passthrough_options = [arg for arg in args if arg.startswith('--')]

    is_dry_run = 'z' in modifiers
    if 'z' in modifiers: modifiers.remove('z')

    systemctl_command = ''
    systemctl_options = []
    
    if 'u' in modifiers: systemctl_options.append('--user')
    if 'n' in modifiers: systemctl_options.append('--now')
    if 'a' in modifiers: systemctl_options.append('--all')
    if 'r' in modifiers: systemctl_options.append('--recursive')
    if 'f' in modifiers: systemctl_options.append('--force')
    if 'D' in modifiers: systemctl_options.append('--dry-run')

    if main_op == 'S':
        if 't' in modifiers:
            if 'y' in modifiers:
                if 'd' in modifiers: systemctl_command = 'reload-or-restart'
                elif 'c' in modifiers: systemctl_command = 'condrestart'
                elif 'q' in modifiers: systemctl_command = 'try-restart'
                else: systemctl_command = 'restart'
            else: systemctl_command = 'start'
        elif 'y' in modifiers: systemctl_command = 'reenable'
        elif 'd' in modifiers: systemctl_command = 'reload'
        elif 'm' in modifiers: systemctl_command = 'unmask'
        elif 'e' in modifiers: systemctl_command = 'thaw'
        else: systemctl_command = 'enable'
    elif main_op == 'R':
        if 'c' in modifiers: systemctl_command = 'clean'
        elif 't' in modifiers: systemctl_command = 'stop'
        elif 'm' in modifiers: systemctl_command = 'mask'
        elif 'k' in modifiers: systemctl_command = 'kill'
        elif 'v' in modifiers: systemctl_command = 'revert'
        elif 'e' in modifiers: systemctl_command = 'freeze'
        else: systemctl_command = 'disable'
    elif main_op == 'Q':
        mappings = {'l':'list-unit-files', 'd':'list-dependencies', 'o':'list-automounts',
                    'm':'list-machines', 't':'list-timers', 'p':'list-paths',
                    'k':'list-sockets', 'y':'list-units', 'j':'list-jobs', 'i':'status'}
        cmd_mod = next((m for m in modifiers if m in mappings), None)
        if cmd_mod: systemctl_command = mappings[cmd_mod]
        else: print("Error: -Q requires a valid modifier."); sys.exit(1)
    elif main_op == 'F':
        if 'e' in modifiers: systemctl_command = 'edit'
        else: print("Error: -F requires a modifier (e.g., -Fe)."); sys.exit(1)
    elif main_op == 'T':
        mappings = {'s':'is-enabled', 'c':'is-system-running', 'e':'is-failed'}
        cmd_mod = next((m for m in modifiers if m in mappings), None)
        if cmd_mod: systemctl_command = mappings[cmd_mod]
        else: print("Error: -T requires a valid modifier."); sys.exit(1)
    elif main_op == 'J':
        systemctl_command = 'cancel' if 'c' in modifiers else 'list-jobs'
    elif main_op == 'N':
        if 's' in modifiers: systemctl_command = 'set-environment'
        elif 'n' in modifiers: systemctl_command = 'unset-environment'
        elif 'i' in modifiers: systemctl_command = 'import-environment'
        else: systemctl_command = 'show-environment'
    else:
        print(f"Error: Unknown main operation '-%s'" % main_op)
        sys.exit(1)

    final_command = (['systemctl'] + systemctl_options + systemctl_passthrough_options + 
                     [systemctl_command] + non_flag_args)
    final_command_str = ' '.join(filter(None, final_command))
    
    print(f"--> Executing: {final_command_str}")

    if is_dry_run:
        print("Dry run enabled (-z). Command not executed.")
        sys.exit(0)
    
    try:
        subprocess.run(final_command, check=True)
    except FileNotFoundError:
        print("Error: 'systemctl' command not found. Please ensure it is in your PATH.")
        sys.exit(127)
    except subprocess.CalledProcessError as e:
        print(f"Error: Command failed with exit code {e.returncode}.")
        sys.exit(e.returncode)

if __name__ == "__main__":
    main()
`;
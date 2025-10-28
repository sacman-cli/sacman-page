import type { ParseResult } from '../types';

export const parseSacmanCommand = (input: string): ParseResult => {
    const trimmedInput = input.trim();
    if (!trimmedInput) {
        return { command: '', explanation: 'Type a sacman command to begin.', error: '' };
    }

    const parts = trimmedInput.split(/\s+/);
    if (parts[0] !== 'sacman') {
        return { command: '', explanation: '', error: 'Command must start with "sacman".' };
    }

    if (parts.length === 1) {
        return { command: '', explanation: 'Please provide options and a unit name.', error: '' };
    }

    const optionsArg = parts.find(p => p.startsWith('-') && !p.startsWith('--'));
    if (!optionsArg) {
        return { command: 'systemctl ' + parts.slice(1).join(' '), explanation: 'No sacman options detected. Passing arguments directly to systemctl.', error: '' };
    }

    const flags = optionsArg.substring(1);
    const mainOp = flags[0];
    const modifiers = new Set(flags.substring(1).split(''));

    const nonFlagArgs = parts.slice(1).filter(p => p !== optionsArg && !p.startsWith('--'));
    const systemctlPassthroughOptions = parts.slice(1).filter(p => p.startsWith('--'));

    let systemctlCommand = '';
    let explanation = '';
    let error = '';

    const systemctlOptions: string[] = [];

    // Global modifiers that don't conflict with sub-commands are handled here
    if (modifiers.has('u')) systemctlOptions.push('--user');
    if (modifiers.has('n')) systemctlOptions.push('--now');
    if (modifiers.has('a')) systemctlOptions.push('--all');
    if (modifiers.has('r')) systemctlOptions.push('--recursive');
    if (modifiers.has('f')) systemctlOptions.push('--force');
    if (modifiers.has('D')) systemctlOptions.push('--dry-run');

    switch (mainOp) {
        case 'S':
            if (modifiers.has('t')) {
                if (modifiers.has('y')) {
                    if (modifiers.has('d')) {
                        systemctlCommand = modifiers.has('q') ? 'try-reload-or-restart' : 'reload-or-restart';
                        explanation = `Try to reload or restart ${nonFlagArgs.join(' ')}.`;
                    } else if (modifiers.has('c')) {
                        systemctlCommand = 'condrestart';
                        explanation = `Conditionally restart ${nonFlagArgs.join(' ')}.`;
                    } else if (modifiers.has('q')) {
                        systemctlCommand = 'try-restart';
                        explanation = `Try to restart ${nonFlagArgs.join(' ')}.`;
                    } else {
                        systemctlCommand = 'restart';
                        explanation = `Restart ${nonFlagArgs.join(' ')}.`;
                    }
                } else {
                    systemctlCommand = 'start';
                    explanation = `Start ${nonFlagArgs.join(' ')}.`;
                }
            } else if (modifiers.has('y')) {
                systemctlCommand = 'reenable';
                explanation = `Re-enable ${nonFlagArgs.join(' ')}.`;
            } else if (modifiers.has('d')) {
                systemctlCommand = 'reload';
                explanation = `Reload ${nonFlagArgs.join(' ')}.`;
            } else if (modifiers.has('m')) {
                systemctlCommand = 'unmask';
                explanation = `Unmask ${nonFlagArgs.join(' ')}.`;
            } else if (modifiers.has('e')) {
                systemctlCommand = 'thaw';
                explanation = `Thaw (resume) ${nonFlagArgs.join(' ')}.`;
            } else {
                systemctlCommand = 'enable';
                explanation = `Enable ${nonFlagArgs.join(' ')}.`;
            }
            break;
        case 'R':
            if (modifiers.has('c')) {
                systemctlCommand = 'clean';
                explanation = `Clean ${nonFlagArgs.join(' ')}.`;
            } else if (modifiers.has('t')) {
                systemctlCommand = 'stop';
                explanation = `Stop ${nonFlagArgs.join(' ')}.`;
            } else if (modifiers.has('m')) {
                systemctlCommand = 'mask';
                explanation = `Mask ${nonFlagArgs.join(' ')}.`;
            } else if (modifiers.has('k')) {
                systemctlCommand = 'kill';
                explanation = `Kill ${nonFlagArgs.join(' ')}.`;
            } else if (modifiers.has('v')) {
                systemctlCommand = 'revert';
                explanation = `Revert ${nonFlagArgs.join(' ')}.`;
            } else if (modifiers.has('e')) {
                systemctlCommand = 'freeze';
                explanation = `Freeze (pause) ${nonFlagArgs.join(' ')}.`;
            } else {
                systemctlCommand = 'disable';
                explanation = `Disable ${nonFlagArgs.join(' ')}.`;
            }
            break;
        case 'Q': {
            const mappings: { [key: string]: [string, string] } = {
                'l': ['list-unit-files', 'List unit files.'],
                'd': ['list-dependencies', `List dependencies for ${nonFlagArgs.join(' ')}.`],
                'o': ['list-automounts', 'List automounts.'],
                'm': ['list-machines', 'List machines.'],
                't': ['list-timers', 'List timers.'],
                'p': ['list-paths', 'List paths.'],
                'k': ['list-sockets', 'List sockets.'],
                'y': ['list-units', 'List units.'],
                'j': ['list-jobs', 'List jobs.'],
                'i': ['status', `Check status of ${nonFlagArgs.join(' ')}.`],
            };
            const cmdModifiers = Array.from(modifiers).filter(m => Object.keys(mappings).includes(m));

            if (cmdModifiers.length > 1) {
                error = `Operation -Q accepts only one command modifier (found: ${cmdModifiers.join(', ')}).`;
            } else if (cmdModifiers.length === 0) {
                error = `Operation -Q requires a command modifier (e.g., -Ql, -Qi, -Qy).`;
            } else {
                [systemctlCommand, explanation] = mappings[cmdModifiers[0]];
            }
            break;
        }
        case 'F':
            if (modifiers.has('e')) {
                systemctlCommand = 'edit';
                explanation = `Edit unit file for ${nonFlagArgs.join(' ')}.`;
            } else {
                error = `Operation -F requires a modifier (e.g., -Fe).`;
            }
            break;
        case 'T': {
            const mappings: { [key: string]: [string, string] } = {
                's': ['is-enabled', `Check if ${nonFlagArgs.join(' ')} is enabled.`],
                'c': ['is-system-running', 'Check if system is running.'],
                'e': ['is-failed', `Check if ${nonFlagArgs.join(' ')} has failed.`]
            };
            const cmdModifiers = Array.from(modifiers).filter(m => Object.keys(mappings).includes(m));

            if (cmdModifiers.length > 1) {
                error = `Operation -T accepts only one command modifier (found: ${cmdModifiers.join(', ')}).`;
            } else if (cmdModifiers.length === 0) {
                error = `Operation -T requires a command modifier (e.g., -Ts, -Tc).`;
            } else {
                [systemctlCommand, explanation] = mappings[cmdModifiers[0]];
            }
            break;
        }
        case 'J':
            systemctlCommand = modifiers.has('c') ? 'cancel' : 'list-jobs';
            explanation = modifiers.has('c') ? `Cancel job(s) ${nonFlagArgs.join(' ')}.` : 'List jobs.';
            break;
        case 'N':
            if (modifiers.has('s')) {
                systemctlCommand = 'set-environment';
                explanation = `Set environment variables: ${nonFlagArgs.join(' ')}.`;
            } else if (modifiers.has('n')) {
                systemctlCommand = 'unset-environment';
                explanation = `Unset environment variables: ${nonFlagArgs.join(' ')}.`;
            } else if (modifiers.has('i')) {
                systemctlCommand = 'import-environment';
                explanation = 'Import environment variables.';
            } else {
                systemctlCommand = 'show-environment';
                explanation = 'Show environment.';
            }
            break;
        default:
            error = `Unknown main operation: -${mainOp}`;
    }

    if (error) {
        return { command: '', explanation: '', error };
    }

    const finalCommand = [
        'systemctl',
        ...systemctlOptions,
        ...systemctlPassthroughOptions,
        systemctlCommand,
        ...nonFlagArgs,
    ].filter(Boolean).join(' ');

    const isDryRun = modifiers.has('z');
    const isSystemctlDryRun = modifiers.has('D');

    return {
        command: finalCommand,
        explanation,
        error,
        isDryRun,
        isSystemctlDryRun
    };
};
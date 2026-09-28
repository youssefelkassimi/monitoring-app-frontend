import React, { useState } from 'react';
import {
  Terminal,
  Play,
  Loader2,
  ChevronDown,
  ChevronRight,
  Clock,
  Send,
  CheckCircle2,
  XCircle,
  Timer,
  ShieldX,
  Copy,
  Check,
  AlertTriangle,
} from 'lucide-react';
import { useAgentCommands } from '../hooks/useCommands'
import { useAuth } from './AuthContext';
import {
  COMMAND_STATUS_STYLES,
  ALLOWED_COMMANDS,
} from '../service/constants/command';

const STATUS_ICON = {
  PENDING: Clock,
  SENT: Send,
  SUCCESS: CheckCircle2,
  ERROR: XCircle,
  TIMEOUT: Timer,
  REJECTED: ShieldX,
};

export default function CommandPanel({ agentId }) {
  const { isAdmin } = useAuth();
  const { commands, send, sending, error } = useAgentCommands(agentId);
  if (!isAdmin) {
    return (
      <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-4 text-sm text-slate-400">
        Commands are available to administrators only.
      </div>
    );
  }
  const [selected, setSelected] = useState(ALLOWED_COMMANDS[0]);
  const [timeout, setTimeoutSec] = useState(30);

  const handleRun = async () => {
    try {
      await send({
        command: selected.name,
        args: selected.args,
        timeout: Number(timeout),
      });
    } catch {
      /* handled in hook */
    }
  };

  return (
    <div className="rounded-xl bg-slate-900/60 border border-slate-800 p-4 backdrop-blur">
      {/* Header */}
      <div className="flex items-center gap-2 mb-4">
        <div className="p-1.5 rounded-lg bg-emerald-500/10 border border-emerald-500/30">
          <Terminal className="w-4 h-4 text-emerald-400" />
        </div>
        <h3 className="text-sm font-semibold text-white">Commands</h3>
        {commands.length > 0 && (
          <span className="ml-auto text-[10px] text-slate-500">
            {commands.length} in history
          </span>
        )}
      </div>

      {/* Command picker */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 mb-3">
        <select
          value={selected.name}
          onChange={(e) =>
            setSelected(ALLOWED_COMMANDS.find((c) => c.name === e.target.value))
          }
          className="sm:col-span-2 text-xs bg-slate-800/60 border border-slate-700 text-slate-200 rounded-md px-2.5 py-2 focus:outline-none focus:border-emerald-500/50"
        >
          {ALLOWED_COMMANDS.map((c) => (
            <option key={c.name} value={c.name}>
              {c.label} — {c.name} {c.args.join(' ')}
            </option>
          ))}
        </select>

        <div className="flex items-center gap-1 bg-slate-800/60 border border-slate-700 rounded-md px-2.5">
          <input
            type="number"
            min={1}
            max={300}
            value={timeout}
            onChange={(e) => setTimeoutSec(e.target.value)}
            className="flex-1 bg-transparent text-xs text-slate-200 outline-none py-2 w-full"
            title="Timeout (seconds)"
          />
          <span className="text-[10px] text-slate-500">s</span>
        </div>
      </div>

      {/* Preview + run */}
      <div className="flex items-center gap-2 mb-3">
        <code className="flex-1 text-[11px] font-mono text-slate-400 bg-slate-950/60 border border-slate-800 rounded-md px-2.5 py-1.5 truncate">
          $ {selected.name} {selected.args.join(' ')}
        </code>
        <button
          onClick={handleRun}
          disabled={sending}
          className={`flex items-center gap-1.5 text-xs font-semibold px-3 py-2 rounded-md transition-colors ${
            sending
              ? 'bg-slate-800 text-slate-500 cursor-not-allowed'
              : 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-lg shadow-emerald-500/20'
          }`}
        >
          {sending ? (
            <Loader2 className="w-3.5 h-3.5 animate-spin" />
          ) : (
            <Play className="w-3.5 h-3.5" />
          )}
          {sending ? 'Sending…' : 'Run'}
        </button>
      </div>

      {error && (
        <div className="mb-3 px-2.5 py-1.5 rounded-md bg-red-500/10 border border-red-500/30 text-[11px] text-red-300">
          {error}
        </div>
      )}

      {/* History */}
      {commands.length === 0 ? (
        <p className="text-[11px] text-slate-500 text-center py-6">
          No commands executed yet
        </p>
      ) : (
        <div className="space-y-2 max-h-[400px] overflow-y-auto pr-1">
          {commands.map((cmd) => (
            <CommandRow key={cmd.id} cmd={cmd} />
          ))}
        </div>
      )}
    </div>
  );
}

/* ---------- one command row ---------- */
function CommandRow({ cmd }) {
  const meta = COMMAND_STATUS_STYLES[cmd.status] ?? COMMAND_STATUS_STYLES.PENDING;
  const Icon = STATUS_ICON[cmd.status] ?? Clock;
  const [open, setOpen] = useState(cmd.status === 'PENDING' || cmd.status === 'SENT');
  const [copied, setCopied] = useState(null);

  const args = safeParseArgs(cmd.argsJson);
  const isPending = cmd.status === 'PENDING' || cmd.status === 'SENT';

  const duration =
    cmd.sentAt && cmd.executedAt
      ? (new Date(cmd.executedAt) - new Date(cmd.sentAt)) / 1000
      : null;

  const copy = async (text, which) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(which);
      setTimeout(() => setCopied(null), 1200);
    } catch {}
  };

  return (
    <div className={`rounded-lg border ${meta.border} ${meta.bg} overflow-hidden`}>
      {/* head */}
      <button
        onClick={() => setOpen((v) => !v)}
        className="w-full flex items-center gap-2 px-2.5 py-2 hover:bg-white/[0.02] transition-colors"
      >
        {open ? (
          <ChevronDown className="w-3.5 h-3.5 text-slate-500 flex-shrink-0" />
        ) : (
          <ChevronRight className="w-3.5 h-3.5 text-slate-500 flex-shrink-0" />
        )}

        <div className="relative flex-shrink-0">
          <Icon className={`w-3.5 h-3.5 ${meta.color}`} />
          {meta.pulse && (
            <span
              className={`absolute inset-0 rounded-full animate-ping opacity-40 ${meta.color.replace('text-', 'bg-')}`}
            />
          )}
        </div>

        <code className="text-[11px] font-mono text-slate-200 truncate">
          {cmd.command} {args.join(' ')}
        </code>

        <div className="ml-auto flex items-center gap-2 flex-shrink-0">
          {duration !== null && (
            <span className="text-[10px] text-slate-500 font-mono">
              {duration.toFixed(2)}s
            </span>
          )}
          <span
            className={`text-[10px] font-semibold uppercase tracking-wider ${meta.color}`}
          >
            {meta.label}
          </span>
        </div>
      </button>

      {/* body */}
      {open && (
        <div className="border-t border-white/5 px-2.5 py-2 bg-slate-950/40 space-y-2">
          {/* timing / metadata */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-[10px] text-slate-500">
            <Meta label="Created" value={fmtTime(cmd.createdAt)} />
            <Meta label="Sent"    value={fmtTime(cmd.sentAt)} />
            <Meta label="Executed" value={fmtTime(cmd.executedAt)} />
            <Meta label="Exit code" value={cmd.exitCode ?? '—'} />
          </div>

          {isPending && (
            <div className="flex items-center gap-2 text-[11px] text-blue-400">
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
              {cmd.status === 'PENDING'
                ? 'Waiting for the agent to pick up…'
                : 'Agent is executing…'}
            </div>
          )}

          {/* stdout */}
          {cmd.stdout && (
            <OutputBlock
              title="stdout"
              tone="emerald"
              text={cmd.stdout}
              copied={copied === 'out'}
              onCopy={() => copy(cmd.stdout, 'out')}
            />
          )}

          {/* stderr */}
          {cmd.stderr && (
            <OutputBlock
              title="stderr"
              tone="red"
              text={cmd.stderr}
              copied={copied === 'err'}
              onCopy={() => copy(cmd.stderr, 'err')}
            />
          )}

          {/* error status w/o stderr */}
          {cmd.status === 'ERROR' && !cmd.stderr && !cmd.stdout && (
            <div className="flex items-start gap-2 text-[11px] text-red-300">
              <AlertTriangle className="w-3.5 h-3.5 mt-0.5 flex-shrink-0" />
              Command failed without output
            </div>
          )}

          {cmd.status === 'TIMEOUT' && (
            <div className="flex items-start gap-2 text-[11px] text-amber-300">
              <Timer className="w-3.5 h-3.5 mt-0.5 flex-shrink-0" />
              Timed out after {cmd.timeout ?? 30}s
            </div>
          )}

          {cmd.status === 'REJECTED' && (
            <div className="flex items-start gap-2 text-[11px] text-red-300">
              <ShieldX className="w-3.5 h-3.5 mt-0.5 flex-shrink-0" />
              Command was rejected by the agent
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function OutputBlock({ title, tone, text, copied, onCopy }) {
  const tones = {
    emerald: 'text-emerald-300 bg-emerald-500/5 border-emerald-500/20',
    red: 'text-red-300 bg-red-500/5 border-red-500/20',
  };
  return (
    <div className={`rounded-md border ${tones[tone]} overflow-hidden`}>
      <div className="flex items-center justify-between px-2 py-1 border-b border-current/10">
        <span className="text-[10px] font-semibold uppercase tracking-wider">
          {title}
        </span>
        <button
          onClick={onCopy}
          className="p-1 rounded text-slate-400 hover:text-white hover:bg-white/5 transition-colors"
          title={`Copy ${title}`}
        >
          {copied ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
        </button>
      </div>
      <pre className="px-2 py-1.5 text-[10.5px] font-mono whitespace-pre-wrap break-all max-h-48 overflow-auto leading-relaxed">
        {text}
      </pre>
    </div>
  );
}

function Meta({ label, value }) {
  return (
    <div>
      <p className="uppercase tracking-wider">{label}</p>
      <p className="text-slate-300 font-mono truncate">{value ?? '—'}</p>
    </div>
  );
}

/* ---------- utils ---------- */
function safeParseArgs(argsJson) {
  if (!argsJson) return [];
  if (Array.isArray(argsJson)) return argsJson;
  try {
    const parsed = JSON.parse(argsJson);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function fmtTime(iso) {
  if (!iso) return '—';
  return new Date(iso).toLocaleTimeString();
}
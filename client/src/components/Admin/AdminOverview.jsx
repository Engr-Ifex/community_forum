import { icons } from "../common/ui";

const UsersIcon = icons.users;
const GridIcon = icons.grid;
const ChatIcon = icons.chat;
const FlagIcon = icons.flag;
const ShieldIcon = icons.shield;

/**
 * A single summary number.
 *
 * `tone` picks the icon chip colour; `hint` carries the secondary breakdown so
 * the card can show "12 total · 3 moderators" without a second widget.
 */
const StatCard = ({ label, value, hint, icon: Icon, tone = "slate" }) => {
  const toneClass = {
    slate: "bg-slate-100 text-slate-600",
    blue: "bg-blue-50 text-blue-600",
    emerald: "bg-emerald-50 text-emerald-600",
    amber: "bg-amber-50 text-amber-600",
    red: "bg-red-50 text-red-600",
  }[tone] ?? "bg-slate-100 text-slate-600";

  return (
    <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex items-start justify-between gap-3">
        <p className="text-sm font-medium text-slate-500">{label}</p>

        {Icon ? (
          <span className={`grid h-9 w-9 shrink-0 place-items-center rounded-lg ${toneClass}`}>
            <Icon className="h-4.5 w-4.5" />
          </span>
        ) : null}
      </div>

      <p className="mt-2 text-3xl font-bold tracking-tight text-slate-900">
        {value ?? 0}
      </p>

      {hint ? <p className="mt-1 text-xs text-slate-500">{hint}</p> : null}
    </div>
  );
};

const BreakdownRow = ({ label, value, tone = "slate" }) => {
  const toneClass = {
    slate: "text-slate-900",
    amber: "text-amber-700",
    emerald: "text-emerald-700",
    red: "text-red-700",
  }[tone] ?? "text-slate-900";

  return (
    <div className="flex items-center justify-between py-1.5">
      <dt className="text-sm text-slate-600">{label}</dt>
      <dd className={`text-sm font-semibold ${toneClass}`}>{value ?? 0}</dd>
    </div>
  );
};

/**
 * Section 1 - Overview.
 *
 * Purely a read of GET /admin/dashboard. The backend already computes every
 * number here, so no counts are derived in the client and the two can never
 * disagree. No charts: the endpoint returns counters, not time series.
 */
const AdminOverview = ({ stats }) => {
  if (!stats) {
    return (
      <p className="rounded-xl border border-slate-200 bg-white p-6 text-slate-600">
        No dashboard data available.
      </p>
    );
  }

  const { users = {}, categories = {}, discussions = {}, reports = {}, moderation = {} } = stats;

  return (
    <div className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          label="Total users"
          value={users.total}
          hint={`${users.moderators ?? 0} moderator${users.moderators === 1 ? "" : "s"}`}
          icon={UsersIcon}
          tone="blue"
        />
        <StatCard
          label="Active users"
          value={users.active}
          hint="accounts currently enabled"
          icon={icons.check}
          tone="emerald"
        />
        <StatCard
          label="Inactive users"
          value={users.inactive}
          hint="deactivated accounts"
          icon={UsersIcon}
          tone="slate"
        />
        <StatCard
          label="Moderators"
          value={users.moderators}
          hint="excludes admins"
          icon={ShieldIcon}
          tone="amber"
        />
        <StatCard
          label="Categories"
          value={categories.total}
          icon={GridIcon}
          tone="slate"
        />
        <StatCard
          label="Discussions"
          value={discussions.total}
          hint={`${discussions.active ?? 0} active`}
          icon={ChatIcon}
          tone="blue"
        />
        <StatCard
          label="Reports"
          value={reports.total}
          hint={`${reports.pending ?? 0} pending`}
          icon={FlagIcon}
          tone="red"
        />
        <StatCard
          label="Moderation actions"
          value={moderation.totalActions}
          hint="recorded in the audit log"
          icon={icons.trash}
          tone="slate"
        />
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
          <h3 className="text-sm font-semibold text-slate-900">Discussions</h3>

          <dl className="mt-3 divide-y divide-slate-100">
            <BreakdownRow label="Active" value={discussions.active} />
            <BreakdownRow label="Locked" value={discussions.locked} tone="amber" />
            <BreakdownRow label="Removed" value={discussions.removed} tone="red" />
            <BreakdownRow label="Total" value={discussions.total} />
          </dl>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
          <h3 className="text-sm font-semibold text-slate-900">Reports</h3>

          <dl className="mt-3 divide-y divide-slate-100">
            <BreakdownRow label="Pending" value={reports.pending} tone="amber" />
            <BreakdownRow label="Resolved" value={reports.resolved} tone="emerald" />
            <BreakdownRow label="Dismissed" value={reports.dismissed} />
            <BreakdownRow label="Total" value={reports.total} />
          </dl>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
          <h3 className="text-sm font-semibold text-slate-900">Moderation</h3>

          <dl className="mt-3 divide-y divide-slate-100">
            <BreakdownRow label="Recorded actions" value={moderation.totalActions} />
          </dl>

          <p className="mt-3 text-xs text-slate-500">
            Every lock, removal, and report outcome is logged with the acting
            moderator.
          </p>
        </div>
      </div>
    </div>
  );
};

export default AdminOverview;

import { useNotificationStore } from '../../stores/notificationStore'
import { X, CheckCircle, Info, AlertTriangle, AlertCircle } from 'lucide-react'

const iconMap = {
  success: <CheckCircle size={16} className="text-os-success" />,
  info: <Info size={16} className="text-os-info" />,
  warning: <AlertTriangle size={16} className="text-os-warning" />,
  error: <AlertCircle size={16} className="text-os-error" />,
}

const borderMap = {
  success: 'border-l-os-success',
  info: 'border-l-os-info',
  warning: 'border-l-os-warning',
  error: 'border-l-os-error',
}

export function NotificationToast() {
  const notifications = useNotificationStore((s) => s.notifications)
  const dismiss = useNotificationStore((s) => s.dismiss)

  return (
    <div className="fixed top-4 right-4 z-[10000] flex flex-col gap-2 pointer-events-none max-w-sm">
      {notifications.map((n) => (
        <div
          key={n.id}
          className={`pointer-events-auto bg-os-surface border border-os-border border-l-2 ${borderMap[n.type]} rounded-lg shadow-xl p-3 animate-slide-in-right`}
        >
          <div className="flex items-start gap-2">
            <div className="shrink-0 mt-0.5">{iconMap[n.type]}</div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium">{n.title}</p>
              <p className="text-xs text-os-text-secondary mt-0.5">{n.message}</p>
            </div>
            <button
              onClick={() => dismiss(n.id)}
              className="shrink-0 p-0.5 hover:bg-os-surface-hover rounded text-os-text-muted"
            >
              <X size={14} />
            </button>
          </div>
        </div>
      ))}
    </div>
  )
}

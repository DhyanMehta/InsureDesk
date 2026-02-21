'use client'

/**
 * Stat Card Component
 * Compact card for displaying statistics
 */
export default function StatCard({ 
  title, 
  value, 
  icon, 
  color = 'blue',
  subtitle
}) {
  const colorClasses = {
    blue: 'bg-blue-50 text-blue-600',
    purple: 'bg-purple-50 text-purple-600',
    green: 'bg-green-50 text-green-600',
    red: 'bg-red-50 text-red-600',
    yellow: 'bg-yellow-50 text-yellow-600'
  }
  
  return (
    <div className="premium-card flex items-center justify-between">
      <div className="flex-1">
        <p className="text-text-secondary text-sm font-medium mb-1">{title}</p>
        <p className="text-3xl font-bold text-text-primary">{value}</p>
        {subtitle && (
          <p className="text-text-muted text-xs mt-1">{subtitle}</p>
        )}
      </div>
      <div className={`w-14 h-14 rounded-xl ${colorClasses[color]} flex items-center justify-center text-2xl flex-shrink-0`}>
        {icon}
      </div>
    </div>
  )
}

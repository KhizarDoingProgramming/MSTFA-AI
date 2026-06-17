'use client'

import { useState } from 'react'

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string
  error?: string
  icon?: React.ReactNode
}

export default function PastelInput({ label, error, icon, className = '', ...props }: InputProps) {
  const [focused, setFocused] = useState(false)

  return (
    <div className="w-full">
      {label && (
        <label className="block text-sm font-semibold text-purple-700/80 dark:text-purple-300/80 mb-1.5 pl-1">
          {label}
        </label>
      )}
      <div className="relative">
        {icon && (
          <div className="absolute left-3 top-1/2 -translate-y-1/2 text-purple-300 dark:text-purple-500">
            {icon}
          </div>
        )}
        <input
          className={`glass-input w-full py-3 px-4 text-sm text-purple-900 dark:text-purple-100 placeholder-purple-300/60 dark:placeholder-purple-500/50 font-medium ${icon ? 'pl-10' : ''} ${error ? 'border-red-300 dark:border-red-600 focus:border-red-400' : ''} ${className}`}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          {...props}
        />
      </div>
      {error && <p className="text-red-400 text-xs mt-1 pl-1">{error}</p>}
    </div>
  )
}

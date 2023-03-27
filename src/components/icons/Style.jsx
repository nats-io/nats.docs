import clsx from 'clsx'

const gradients = {
    blue: [
      { stopColor: '#0EA5E9' },
      { stopColor: '#22D3EE', offset: '.527' },
      { stopColor: '#818CF8', offset: 1 },
    ],
    amber: [
      { stopColor: '#FDE68A', offset: '.08' },
      { stopColor: '#F59E0B', offset: '.837' },
    ],
  }
  
  export function Gradient({ color = 'blue', ...props }) {
    return (
      <radialGradient
        cx={0}
        cy={0}
        r={1}
        gradientUnits="userSpaceOnUse"
        {...props}
      >
        {gradients[color].map((stop, stopIndex) => (
          <stop key={stopIndex} {...stop} />
        ))}
      </radialGradient>
    )
  }
  
  export function LightMode({ className, ...props }) {
    return <g className={clsx('dark:hidden', className)} {...props} />
  }
  
  export function DarkMode({ className, ...props }) {
    return <g className={clsx('hidden dark:inline', className)} {...props} />
  }
  
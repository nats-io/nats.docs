import { Fragment, useState } from 'react'
import Highlight, { defaultProps } from 'prism-react-renderer'
import { CopyToClipboard } from 'react-copy-to-clipboard'

export function Fence({ children, language }) {
  let [copied, setCopied] = useState(false)

  return (
    <div className="relative group">
      <Highlight
        {...defaultProps}
        code={children.trimEnd()}
        language={language}
        theme={undefined}
      >
        {({ className, style, tokens, getTokenProps }) => (
          <pre className={className} style={style}>
            <code className='pr-16 peer'>
              {tokens.map((line, lineIndex) => (
                <Fragment key={lineIndex}>
                  {line
                    .filter((token) => !token.empty)
                    .map((token, tokenIndex) => (
                      <span key={tokenIndex} {...getTokenProps({ token })} />
                    ))}
                  {'\n'}
                </Fragment>
              ))}
            </code>
          </pre>
        )}
      </Highlight>
      <CopyToClipboard text={children.trimEnd()} onCopy={() => setCopied(true)}>
        <button className='invisible group-hover:visible absolute top-0 right-0 px-4 py-2 text-xs bg-gray-800 rounded-lg text-sky-500'>
          {copied ? "🎉 Copied!" : "Copy"}
        </button>
      </CopyToClipboard>
    </div>
  )
}

import React from 'react'
import { motion } from 'framer-motion'
import ReactMarkdown from 'react-markdown'

const MessageBubble = ({ country, flag, color, text, timestamp, round }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 18 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, ease: 'easeOut' }}
      className="flex items-start gap-3 transition-all duration-300 hover:scale-[1.01]"
    >
      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-slate-800 text-lg">
        {flag}
      </div>

      <div className="max-w-[75%] rounded-2xl border border-slate-700 bg-gradient-to-br from-slate-800 to-slate-900 p-4 shadow-lg backdrop-blur-md">
        <div className="mb-1 flex flex-wrap items-center gap-2 text-xs text-gray-400">
          <span>{country}</span>
          <span className="text-slate-600">•</span>
          <span>{timestamp}</span>
          <span className="text-slate-600">•</span>
          <span>Round {round}</span>
        </div>

        <div className="mt-3 flex gap-4">
          <div className="w-1 shrink-0 rounded-full" style={{ backgroundColor: color }} />
          <div className="min-w-0 break-words text-sm leading-relaxed text-gray-200">
            <ReactMarkdown
              components={{
                h1: ({ node, ...props }) => <h1 className="mb-2 text-lg font-semibold text-white" {...props} />,
                h2: ({ node, ...props }) => <h2 className="mb-2 text-base font-semibold text-white" {...props} />,
                h3: ({ node, ...props }) => <h3 className="mb-2 text-sm font-semibold text-white" {...props} />,
                p: ({ node, ...props }) => <p className="mb-2 leading-relaxed text-gray-200" {...props} />,
                strong: ({ node, ...props }) => <span className="font-semibold text-cyan-400" {...props} />,
                ul: ({ node, ...props }) => <ul className="my-2 list-disc pl-5" {...props} />,
                ol: ({ node, ...props }) => <ol className="my-2 list-decimal pl-5" {...props} />,
                li: ({ node, ...props }) => <li className="my-1 text-sm leading-relaxed text-gray-200" {...props} />,
                blockquote: ({ node, ...props }) => (
                  <blockquote className="my-3 border-l-2 border-slate-600 pl-4 text-slate-300" {...props} />
                ),
                code: ({ inline, node, ...props }) =>
                  inline ? (
                    <code className="rounded bg-slate-950 px-1.5 py-0.5 text-xs text-cyan-200" {...props} />
                  ) : (
                    <code className="block overflow-x-auto rounded-xl bg-slate-950 p-3 text-xs text-cyan-200" {...props} />
                  ),
              }}
            >
              {text}
            </ReactMarkdown>
          </div>
        </div>
      </div>
    </motion.div>
  )
}

export default MessageBubble

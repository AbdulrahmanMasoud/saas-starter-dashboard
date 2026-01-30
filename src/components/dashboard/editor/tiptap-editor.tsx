"use client"

import { useEditor, EditorContent } from "@tiptap/react"
import StarterKit from "@tiptap/starter-kit"
import Placeholder from "@tiptap/extension-placeholder"
import Link from "@tiptap/extension-link"
import Image from "@tiptap/extension-image"
import Underline from "@tiptap/extension-underline"
import TextAlign from "@tiptap/extension-text-align"
import Highlight from "@tiptap/extension-highlight"
import { EditorToolbar } from "./editor-toolbar"

interface TiptapEditorProps {
  content?: string
  onChange?: (content: string) => void
  placeholder?: string
}

export function TiptapEditor({
  content = "",
  onChange,
  placeholder = "Start writing your content...",
}: TiptapEditorProps) {
  const editor = useEditor({
    immediatelyRender: false,
    extensions: [
      StarterKit.configure({
        heading: {
          levels: [1, 2, 3],
        },
      }),
      Placeholder.configure({
        placeholder,
      }),
      Link.configure({
        openOnClick: false,
        HTMLAttributes: {
          class: "text-primary underline",
        },
      }),
      Image.configure({
        HTMLAttributes: {
          class: "rounded-lg max-w-full",
        },
      }),
      Underline,
      TextAlign.configure({
        types: ["heading", "paragraph"],
      }),
      Highlight.configure({
        multicolor: true,
      }),
    ],
    content,
    editorProps: {
      attributes: {
        class: "tiptap-editor prose prose-sm dark:prose-invert max-w-none min-h-[300px] p-4 focus:outline-none",
      },
    },
    onUpdate: ({ editor }) => {
      onChange?.(editor.getHTML())
    },
  })

  return (
    <div className="rounded-lg border bg-background">
      <EditorToolbar editor={editor} />
      <EditorContent editor={editor} />
    </div>
  )
}

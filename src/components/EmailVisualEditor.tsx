import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Link from "@tiptap/extension-link";
import Underline from "@tiptap/extension-underline";
import TextAlign from "@tiptap/extension-text-align";
import Placeholder from "@tiptap/extension-placeholder";
import TextStyle from "@tiptap/extension-text-style";
import Color from "@tiptap/extension-color";
import { useState, useEffect, useCallback } from "react";
import {
  Bold, Italic, UnderlineIcon, Link2, List, ListOrdered,
  AlignLeft, AlignCenter, AlignRight, Heading1, Heading2,
  Code2, Palette, User, RotateCcw,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";

interface Props {
  value: string;
  onChange: (html: string) => void;
}

const COLORS = ["#000000", "#1a56db", "#16a34a", "#dc2626", "#d97706", "#7c3aed", "#0891b2", "#374151", "#6b7280"];

export default function EmailVisualEditor({ value, onChange }: Props) {
  const [mode, setMode] = useState<"visual" | "html">("visual");
  const [htmlDraft, setHtmlDraft] = useState(value);
  const [showColors, setShowColors] = useState(false);

  const editor = useEditor({
    extensions: [
      StarterKit,
      Underline,
      TextStyle,
      Color,
      Link.configure({ openOnClick: false }),
      TextAlign.configure({ types: ["heading", "paragraph"] }),
      Placeholder.configure({ placeholder: "Write your email here… use the toolbar to format, or add {{first_name}} to personalise." }),
    ],
    content: value,
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML());
    },
  });

  useEffect(() => {
    if (!editor) return;
    if (mode === "visual") {
      const current = editor.getHTML();
      if (current !== value) {
        editor.commands.setContent(value, false);
      }
    }
  }, [value]);

  const switchToHtml = useCallback(() => {
    if (editor) setHtmlDraft(editor.getHTML());
    setMode("html");
  }, [editor]);

  const switchToVisual = useCallback(() => {
    if (editor) {
      editor.commands.setContent(htmlDraft, false);
      onChange(htmlDraft);
    }
    setMode("visual");
    setShowColors(false);
  }, [editor, htmlDraft, onChange]);

  const addLink = useCallback(() => {
    const url = window.prompt("Enter URL:", "https://");
    if (!url || !editor) return;
    if (editor.state.selection.empty) {
      editor.chain().focus().insertContent(`<a href="${url}">${url}</a>`).run();
    } else {
      editor.chain().focus().setLink({ href: url }).run();
    }
  }, [editor]);

  const insertFirstName = useCallback(() => {
    if (!editor) return;
    editor.chain().focus().insertContent("{{first_name}}").run();
  }, [editor]);

  if (!editor) return null;

  const toolbarBtn = (active: boolean, onClick: () => void, title: string, children: React.ReactNode) => (
    <button
      type="button"
      title={title}
      onClick={onClick}
      className={`p-1.5 rounded transition-colors ${active ? "bg-primary text-primary-foreground" : "hover:bg-muted text-foreground"}`}
    >
      {children}
    </button>
  );

  return (
    <div className="rounded-xl border border-border overflow-hidden">
      <div className="flex items-center justify-between bg-muted/40 border-b border-border px-2 py-1.5 flex-wrap gap-1">
        {mode === "visual" ? (
          <>
            <div className="flex items-center gap-0.5 flex-wrap">
              {toolbarBtn(editor.isActive("bold"), () => editor.chain().focus().toggleBold().run(), "Bold", <Bold className="h-3.5 w-3.5" />)}
              {toolbarBtn(editor.isActive("italic"), () => editor.chain().focus().toggleItalic().run(), "Italic", <Italic className="h-3.5 w-3.5" />)}
              {toolbarBtn(editor.isActive("underline"), () => editor.chain().focus().toggleUnderline().run(), "Underline", <UnderlineIcon className="h-3.5 w-3.5" />)}

              <span className="w-px h-4 bg-border mx-1" />

              {toolbarBtn(editor.isActive("heading", { level: 1 }), () => editor.chain().focus().toggleHeading({ level: 1 }).run(), "Heading 1", <Heading1 className="h-3.5 w-3.5" />)}
              {toolbarBtn(editor.isActive("heading", { level: 2 }), () => editor.chain().focus().toggleHeading({ level: 2 }).run(), "Heading 2", <Heading2 className="h-3.5 w-3.5" />)}

              <span className="w-px h-4 bg-border mx-1" />

              {toolbarBtn(editor.isActive("bulletList"), () => editor.chain().focus().toggleBulletList().run(), "Bullet list", <List className="h-3.5 w-3.5" />)}
              {toolbarBtn(editor.isActive("orderedList"), () => editor.chain().focus().toggleOrderedList().run(), "Numbered list", <ListOrdered className="h-3.5 w-3.5" />)}

              <span className="w-px h-4 bg-border mx-1" />

              {toolbarBtn(editor.isActive({ textAlign: "left" }), () => editor.chain().focus().setTextAlign("left").run(), "Align left", <AlignLeft className="h-3.5 w-3.5" />)}
              {toolbarBtn(editor.isActive({ textAlign: "center" }), () => editor.chain().focus().setTextAlign("center").run(), "Align centre", <AlignCenter className="h-3.5 w-3.5" />)}
              {toolbarBtn(editor.isActive({ textAlign: "right" }), () => editor.chain().focus().setTextAlign("right").run(), "Align right", <AlignRight className="h-3.5 w-3.5" />)}

              <span className="w-px h-4 bg-border mx-1" />

              {toolbarBtn(editor.isActive("link"), addLink, "Insert link", <Link2 className="h-3.5 w-3.5" />)}

              <div className="relative">
                {toolbarBtn(showColors, () => setShowColors(v => !v), "Text colour", <Palette className="h-3.5 w-3.5" />)}
                {showColors && (
                  <div className="absolute top-full left-0 mt-1 z-50 bg-popover border border-border rounded-lg shadow-lg p-2 flex gap-1.5 flex-wrap w-40">
                    {COLORS.map(c => (
                      <button
                        key={c}
                        type="button"
                        title={c}
                        onClick={() => { editor.chain().focus().setColor(c).run(); setShowColors(false); }}
                        className="w-5 h-5 rounded-full border border-border hover:scale-110 transition-transform"
                        style={{ backgroundColor: c }}
                      />
                    ))}
                    <button
                      type="button"
                      onClick={() => { editor.chain().focus().unsetColor().run(); setShowColors(false); }}
                      className="w-5 h-5 rounded-full border border-border bg-background flex items-center justify-center hover:bg-muted"
                      title="Remove colour"
                    >
                      <RotateCcw className="h-2.5 w-2.5" />
                    </button>
                  </div>
                )}
              </div>

              <span className="w-px h-4 bg-border mx-1" />

              <button
                type="button"
                onClick={insertFirstName}
                title="Insert first name personalisation"
                className="flex items-center gap-1 px-2 py-1 rounded text-xs bg-blue-50 text-blue-700 border border-blue-200 hover:bg-blue-100 dark:bg-blue-950/30 dark:text-blue-300 dark:border-blue-800"
              >
                <User className="h-3 w-3" />
                Insert Name
              </button>
            </div>

            <button
              type="button"
              onClick={switchToHtml}
              className="flex items-center gap-1 text-xs px-2 py-1 rounded border border-border text-muted-foreground hover:bg-muted"
            >
              <Code2 className="h-3 w-3" />
              HTML
            </button>
          </>
        ) : (
          <div className="flex items-center justify-between w-full">
            <span className="text-xs font-mono text-muted-foreground">HTML source</span>
            <button
              type="button"
              onClick={switchToVisual}
              className="flex items-center gap-1 text-xs px-2 py-1 rounded border border-border text-muted-foreground hover:bg-muted"
            >
              <AlignLeft className="h-3 w-3" />
              Visual
            </button>
          </div>
        )}
      </div>

      {mode === "visual" ? (
        <div
          className="min-h-56 max-h-96 overflow-y-auto p-4 bg-background prose prose-sm max-w-none focus-within:outline-none [&_.ProseMirror]:outline-none [&_.ProseMirror]:min-h-48"
          onClick={() => editor.commands.focus()}
        >
          <EditorContent editor={editor} />
        </div>
      ) : (
        <Textarea
          className="font-mono text-xs rounded-none border-0 min-h-56 resize-y focus-visible:ring-0"
          value={htmlDraft}
          onChange={e => {
            setHtmlDraft(e.target.value);
            onChange(e.target.value);
          }}
          placeholder="Paste or write HTML here..."
        />
      )}

      <style>{`
        .ProseMirror p.is-editor-empty:first-child::before {
          content: attr(data-placeholder);
          float: left;
          color: #9ca3af;
          pointer-events: none;
          height: 0;
        }
        .ProseMirror h1 { font-size: 1.5rem; font-weight: 700; margin: 0.75rem 0 0.5rem; }
        .ProseMirror h2 { font-size: 1.25rem; font-weight: 600; margin: 0.75rem 0 0.5rem; }
        .ProseMirror ul { list-style-type: disc; padding-left: 1.5rem; margin: 0.5rem 0; }
        .ProseMirror ol { list-style-type: decimal; padding-left: 1.5rem; margin: 0.5rem 0; }
        .ProseMirror a { color: #1a56db; text-decoration: underline; }
        .ProseMirror p { margin: 0.4rem 0; }
        .ProseMirror blockquote { border-left: 3px solid #e5e7eb; padding-left: 1rem; color: #6b7280; margin: 0.5rem 0; }
      `}</style>
    </div>
  );
}

import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Link from "@tiptap/extension-link";
import Image from "@tiptap/extension-image";
import Placeholder from "@tiptap/extension-placeholder";
import {
  Bold, Italic, Strikethrough, List, ListOrdered,
  Heading1, Heading2, Heading3,
  Link as LinkIcon, Unlink, Image as ImageIcon,
  Undo, Redo, Code, Quote, Minus, AlignLeft,
  Pilcrow, RemoveFormatting,
} from "lucide-react";
import { useEffect, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface RichTextEditorProps {
  value: string;
  onChange: (html: string) => void;
  placeholder?: string;
}

export default function RichTextEditor({ value, onChange, placeholder = "Start writing..." }: RichTextEditorProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: { levels: [1, 2, 3] },
        codeBlock: { HTMLAttributes: { class: "rounded-lg bg-muted p-4 font-mono text-sm" } },
        blockquote: { HTMLAttributes: { class: "border-l-4 border-primary/40 pl-4 italic text-muted-foreground" } },
        horizontalRule: { HTMLAttributes: { class: "my-6 border-border" } },
      }),
      Link.configure({
        openOnClick: false,
        HTMLAttributes: { class: "text-primary underline cursor-pointer" },
      }),
      Image.configure({
        HTMLAttributes: { class: "rounded-lg max-w-full h-auto my-4" },
        allowBase64: true,
      }),
      Placeholder.configure({ placeholder }),
    ],
    content: value,
    onUpdate: ({ editor }) => onChange(editor.getHTML()),
    editorProps: {
      attributes: {
        class: "min-h-[300px] p-4 focus:outline-none",
      },
    },
  });

  useEffect(() => {
    if (editor && value !== editor.getHTML()) {
      editor.commands.setContent(value, { emitUpdate: false });
    }
  }, [value]);

  if (!editor) return null;

  const btn = (active: boolean, disabled = false) =>
    `h-8 w-8 flex items-center justify-center rounded transition-colors ${
      disabled
        ? "text-muted-foreground/40 cursor-not-allowed"
        : active
          ? "bg-primary text-primary-foreground shadow-sm"
          : "text-muted-foreground hover:bg-muted hover:text-foreground"
    }`;

  const sep = () => <div className="w-px h-5 bg-border mx-0.5" />;

  const addLink = () => {
    if (editor.isActive("link")) {
      editor.chain().focus().unsetLink().run();
      return;
    }
    const url = prompt("Enter URL:");
    if (url) editor.chain().focus().extendMarkRange("link").setLink({ href: url }).run();
  };

  const addImageUrl = () => {
    const url = prompt("Enter image URL:");
    if (url) editor.chain().focus().setImage({ src: url }).run();
  };

  const uploadImage = async (file: File) => {
    const ext = file.name.split(".").pop();
    const path = `blog/${Date.now()}.${ext}`;
    const { error } = await supabase.storage.from("media").upload(path, file);
    if (error) {
      toast.error("Image upload failed");
      return;
    }
    const { data: { publicUrl } } = supabase.storage.from("media").getPublicUrl(path);
    editor.chain().focus().setImage({ src: publicUrl }).run();
    toast.success("Image inserted");
  };

  return (
    <div className="rounded-lg border bg-card overflow-hidden">
      {/* Toolbar */}
      <div className="flex items-center gap-0.5 px-2 py-1.5 border-b bg-muted/40 flex-wrap">
        {/* Text formatting */}
        <button type="button" title="Bold (Ctrl+B)" className={btn(editor.isActive("bold"))} onClick={() => editor.chain().focus().toggleBold().run()}>
          <Bold className="h-3.5 w-3.5" />
        </button>
        <button type="button" title="Italic (Ctrl+I)" className={btn(editor.isActive("italic"))} onClick={() => editor.chain().focus().toggleItalic().run()}>
          <Italic className="h-3.5 w-3.5" />
        </button>
        <button type="button" title="Strikethrough" className={btn(editor.isActive("strike"))} onClick={() => editor.chain().focus().toggleStrike().run()}>
          <Strikethrough className="h-3.5 w-3.5" />
        </button>
        <button type="button" title="Inline Code" className={btn(editor.isActive("code"))} onClick={() => editor.chain().focus().toggleCode().run()}>
          <Code className="h-3.5 w-3.5" />
        </button>
        <button type="button" title="Clear Formatting" className={btn(false)} onClick={() => editor.chain().focus().unsetAllMarks().clearNodes().run()}>
          <RemoveFormatting className="h-3.5 w-3.5" />
        </button>

        {sep()}

        {/* Headings */}
        <button type="button" title="Heading 1" className={btn(editor.isActive("heading", { level: 1 }))} onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}>
          <Heading1 className="h-3.5 w-3.5" />
        </button>
        <button type="button" title="Heading 2" className={btn(editor.isActive("heading", { level: 2 }))} onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}>
          <Heading2 className="h-3.5 w-3.5" />
        </button>
        <button type="button" title="Heading 3" className={btn(editor.isActive("heading", { level: 3 }))} onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}>
          <Heading3 className="h-3.5 w-3.5" />
        </button>
        <button type="button" title="Paragraph" className={btn(editor.isActive("paragraph"))} onClick={() => editor.chain().focus().setParagraph().run()}>
          <Pilcrow className="h-3.5 w-3.5" />
        </button>

        {sep()}

        {/* Lists */}
        <button type="button" title="Bullet List" className={btn(editor.isActive("bulletList"))} onClick={() => editor.chain().focus().toggleBulletList().run()}>
          <List className="h-3.5 w-3.5" />
        </button>
        <button type="button" title="Numbered List" className={btn(editor.isActive("orderedList"))} onClick={() => editor.chain().focus().toggleOrderedList().run()}>
          <ListOrdered className="h-3.5 w-3.5" />
        </button>

        {sep()}

        {/* Blocks */}
        <button type="button" title="Blockquote" className={btn(editor.isActive("blockquote"))} onClick={() => editor.chain().focus().toggleBlockquote().run()}>
          <Quote className="h-3.5 w-3.5" />
        </button>
        <button type="button" title="Code Block" className={btn(editor.isActive("codeBlock"))} onClick={() => editor.chain().focus().toggleCodeBlock().run()}>
          <AlignLeft className="h-3.5 w-3.5" />
        </button>
        <button type="button" title="Horizontal Rule" className={btn(false)} onClick={() => editor.chain().focus().setHorizontalRule().run()}>
          <Minus className="h-3.5 w-3.5" />
        </button>

        {sep()}

        {/* Links & Images */}
        <button type="button" title={editor.isActive("link") ? "Unlink" : "Add Link"} className={btn(editor.isActive("link"))} onClick={addLink}>
          {editor.isActive("link") ? <Unlink className="h-3.5 w-3.5" /> : <LinkIcon className="h-3.5 w-3.5" />}
        </button>
        <button type="button" title="Insert Image URL" className={btn(false)} onClick={addImageUrl}>
          <ImageIcon className="h-3.5 w-3.5" />
        </button>

        {sep()}

        {/* Undo / Redo */}
        <button type="button" title="Undo (Ctrl+Z)" className={btn(false, !editor.can().undo())} onClick={() => editor.chain().focus().undo().run()} disabled={!editor.can().undo()}>
          <Undo className="h-3.5 w-3.5" />
        </button>
        <button type="button" title="Redo (Ctrl+Shift+Z)" className={btn(false, !editor.can().redo())} onClick={() => editor.chain().focus().redo().run()} disabled={!editor.can().redo()}>
          <Redo className="h-3.5 w-3.5" />
        </button>
      </div>

      {/* Editor area with proper heading/content styles */}
      <style>{`
        .ProseMirror {
          min-height: 300px;
          padding: 1rem;
          outline: none;
        }
        .ProseMirror > * + * { margin-top: 0.75rem; }
        .ProseMirror h1 { font-size: 1.875rem; font-weight: 700; line-height: 1.2; margin-top: 1.5rem; margin-bottom: 0.5rem; color: hsl(var(--foreground)); }
        .ProseMirror h2 { font-size: 1.5rem; font-weight: 700; line-height: 1.3; margin-top: 1.25rem; margin-bottom: 0.5rem; color: hsl(var(--foreground)); }
        .ProseMirror h3 { font-size: 1.25rem; font-weight: 600; line-height: 1.4; margin-top: 1rem; margin-bottom: 0.5rem; color: hsl(var(--foreground)); }
        .ProseMirror p { line-height: 1.7; }
        .ProseMirror ul { list-style-type: disc; padding-left: 1.5rem; }
        .ProseMirror ol { list-style-type: decimal; padding-left: 1.5rem; }
        .ProseMirror li { margin-top: 0.25rem; }
        .ProseMirror li > p { margin: 0; }
        .ProseMirror blockquote { border-left: 4px solid hsl(var(--primary) / 0.4); padding-left: 1rem; font-style: italic; color: hsl(var(--muted-foreground)); margin: 1rem 0; }
        .ProseMirror pre { background: hsl(var(--muted)); border-radius: 0.5rem; padding: 1rem; font-family: 'JetBrains Mono', monospace; font-size: 0.875rem; overflow-x: auto; }
        .ProseMirror code { background: hsl(var(--muted)); padding: 0.125rem 0.375rem; border-radius: 0.25rem; font-family: 'JetBrains Mono', monospace; font-size: 0.875em; }
        .ProseMirror pre code { background: none; padding: 0; border-radius: 0; }
        .ProseMirror hr { border: none; border-top: 2px solid hsl(var(--border)); margin: 1.5rem 0; }
        .ProseMirror a { color: hsl(var(--primary)); text-decoration: underline; cursor: pointer; }
        .ProseMirror img { max-width: 100%; height: auto; border-radius: 0.5rem; margin: 1rem 0; }
        .ProseMirror p.is-editor-empty:first-child::before {
          content: attr(data-placeholder);
          float: left;
          color: hsl(var(--muted-foreground));
          pointer-events: none;
          height: 0;
        }
        .ProseMirror:focus { outline: none; }
      `}</style>

      <EditorContent editor={editor} />

      {/* Hidden file input for image upload */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) uploadImage(file);
          e.target.value = "";
        }}
      />
    </div>
  );
}

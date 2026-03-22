import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Link from "@tiptap/extension-link";
import Image from "@tiptap/extension-image";
import Placeholder from "@tiptap/extension-placeholder";
import { Bold, Italic, List, ListOrdered, Heading1, Heading2, Link as LinkIcon, Image as ImageIcon, Undo, Redo, Code, Quote } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useEffect } from "react";

interface RichTextEditorProps {
  value: string;
  onChange: (html: string) => void;
  placeholder?: string;
}

export default function RichTextEditor({ value, onChange, placeholder = "Start writing..." }: RichTextEditorProps) {
  const editor = useEditor({
    extensions: [
      StarterKit,
      Link.configure({ openOnClick: false }),
      Image,
      Placeholder.configure({ placeholder }),
    ],
    content: value,
    onUpdate: ({ editor }) => onChange(editor.getHTML()),
    editorProps: {
      attributes: { class: "prose prose-sm max-w-none min-h-[200px] p-4 focus:outline-none" },
    },
  });

  useEffect(() => {
    if (editor && value !== editor.getHTML()) {
      editor.commands.setContent(value, { emitUpdate: false });
    }
  }, [value]);

  if (!editor) return null;

  const btnCls = (active: boolean) =>
    `h-8 w-8 flex items-center justify-center rounded-md transition-colors ${active ? "bg-primary/10 text-primary" : "text-muted-foreground hover:bg-muted hover:text-foreground"}`;

  const addLink = () => {
    const url = prompt("Enter URL:");
    if (url) editor.chain().focus().setLink({ href: url }).run();
  };

  const addImage = () => {
    const url = prompt("Enter image URL:");
    if (url) editor.chain().focus().setImage({ src: url }).run();
  };

  return (
    <div className="rounded-lg border bg-card overflow-hidden">
      <div className="flex items-center gap-0.5 px-2 py-1.5 border-b bg-muted/30 flex-wrap">
        <button type="button" className={btnCls(editor.isActive("bold"))} onClick={() => editor.chain().focus().toggleBold().run()}><Bold className="h-3.5 w-3.5" /></button>
        <button type="button" className={btnCls(editor.isActive("italic"))} onClick={() => editor.chain().focus().toggleItalic().run()}><Italic className="h-3.5 w-3.5" /></button>
        <div className="w-px h-5 bg-border mx-1" />
        <button type="button" className={btnCls(editor.isActive("heading", { level: 1 }))} onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}><Heading1 className="h-3.5 w-3.5" /></button>
        <button type="button" className={btnCls(editor.isActive("heading", { level: 2 }))} onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}><Heading2 className="h-3.5 w-3.5" /></button>
        <div className="w-px h-5 bg-border mx-1" />
        <button type="button" className={btnCls(editor.isActive("bulletList"))} onClick={() => editor.chain().focus().toggleBulletList().run()}><List className="h-3.5 w-3.5" /></button>
        <button type="button" className={btnCls(editor.isActive("orderedList"))} onClick={() => editor.chain().focus().toggleOrderedList().run()}><ListOrdered className="h-3.5 w-3.5" /></button>
        <div className="w-px h-5 bg-border mx-1" />
        <button type="button" className={btnCls(editor.isActive("blockquote"))} onClick={() => editor.chain().focus().toggleBlockquote().run()}><Quote className="h-3.5 w-3.5" /></button>
        <button type="button" className={btnCls(editor.isActive("codeBlock"))} onClick={() => editor.chain().focus().toggleCodeBlock().run()}><Code className="h-3.5 w-3.5" /></button>
        <button type="button" className={btnCls(editor.isActive("link"))} onClick={addLink}><LinkIcon className="h-3.5 w-3.5" /></button>
        <button type="button" className={btnCls(false)} onClick={addImage}><ImageIcon className="h-3.5 w-3.5" /></button>
        <div className="w-px h-5 bg-border mx-1" />
        <button type="button" className={btnCls(false)} onClick={() => editor.chain().focus().undo().run()}><Undo className="h-3.5 w-3.5" /></button>
        <button type="button" className={btnCls(false)} onClick={() => editor.chain().focus().redo().run()}><Redo className="h-3.5 w-3.5" /></button>
      </div>
      <EditorContent editor={editor} />
    </div>
  );
}

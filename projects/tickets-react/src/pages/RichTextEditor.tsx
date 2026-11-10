import { useEffect, useMemo, useState } from 'react';
import { CKEditor } from '@ckeditor/ckeditor5-react';
import {
  Bold,
  ClassicEditor,
  type EditorConfig,
  Essentials,
  Italic,
  Link,
  List,
  Paragraph,
  Underline,
} from 'ckeditor5';
import editorStyles from 'ckeditor5/ckeditor5.css?inline';

interface RichTextEditorProps {
  label: string;
  placeholder: string;
  value: string;
  onChange: (value: string) => void;
}

export default function RichTextEditor({ label, placeholder, value, onChange }: RichTextEditorProps) {
  // CKEditor only reads its starting text once. After that it keeps its own copy and reports changes.
  const [initialData] = useState(value);

  const config = useMemo<EditorConfig>(
    () => ({
      licenseKey: 'GPL',
      plugins: [Bold, Essentials, Italic, Link, List, Paragraph, Underline],
      toolbar: ['bold', 'italic', 'underline', 'bulletedList', 'link'],
      label,
      placeholder,
      link: { defaultProtocol: 'https://' },
    }),
    [label, placeholder],
  );

  // CKEditor's own styles (about 270 kB) are added only while the editor is on screen.
  useEffect(() => {
    const style = document.createElement('style');
    style.textContent = editorStyles;
    document.head.append(style);
    return () => style.remove();
  }, []);

  return (
    <div className="rich-text-editor">
      <CKEditor editor={ClassicEditor} config={config} data={initialData} onChange={(_, editor) => onChange(editor.getData())} />
    </div>
  );
}

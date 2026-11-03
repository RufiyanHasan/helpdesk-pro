import { Component, computed, input, ViewEncapsulation } from '@angular/core';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { CKEditorModule } from '@ckeditor/ckeditor5-angular';
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

@Component({
  // CKEditor adds its own elements at runtime, so its styles cannot be scoped to this template.
  encapsulation: ViewEncapsulation.None,
  imports: [CKEditorModule, ReactiveFormsModule],
  selector: 'app-rich-text-editor',
  styleUrl: './rich-text-editor.scss',
  templateUrl: './rich-text-editor.html',
})
export class RichTextEditor {
  readonly control = input.required<FormControl<string>>();
  readonly label = input.required<string>();
  readonly placeholder = input('');

  protected readonly editor = ClassicEditor;

  protected readonly config = computed<EditorConfig>(() => ({
    licenseKey: 'GPL',
    plugins: [Bold, Essentials, Italic, Link, List, Paragraph, Underline],
    toolbar: ['bold', 'italic', 'underline', 'bulletedList', 'link'],
    label: this.label(),
    placeholder: this.placeholder(),
    link: { defaultProtocol: 'https://' },
  }));
}

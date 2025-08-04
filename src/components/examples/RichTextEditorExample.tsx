'use client'

import React, { useState } from 'react'
import { RichTextEditor } from '@/components/ui'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

const RichTextEditorExample: React.FC = () => {
  const [content, setContent] = useState('<h2>Welcome to the Rich Text Editor!</h2><p>This is a <strong>sample content</strong> to demonstrate the editor capabilities.</p>')
  const [readOnlyContent, setReadOnlyContent] = useState('<h3>Read-only Content</h3><p>This content cannot be edited.</p>')

  const handleContentChange = (value: string) => {
    setContent(value)
  }

  return (
    <div className="space-y-6 p-6">
      <div className="space-y-2">
        <h1 className="text-3xl font-bold">Rich Text Editor Examples</h1>
        <p className="text-muted-foreground">
          Examples of how to use the RichTextEditor component in different scenarios.
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Basic Editor */}
        <Card>
          <CardHeader>
            <CardTitle>Basic Editor</CardTitle>
            <CardDescription>
              A standard rich text editor with full toolbar functionality.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <RichTextEditor
              value={content}
              onChange={handleContentChange}
              placeholder="Start writing your content here..."
            />
            <div className="text-sm text-muted-foreground">
              <strong>HTML Output:</strong>
              <pre className="mt-2 p-2 bg-muted rounded text-xs overflow-auto">
                {content}
              </pre>
            </div>
          </CardContent>
        </Card>

        {/* Read-only Editor */}
        <Card>
          <CardHeader>
            <CardTitle>Read-only Editor</CardTitle>
            <CardDescription>
              Display content without editing capabilities.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <RichTextEditor
              value={readOnlyContent}
              onChange={() => {}}
              readOnly={true}
              height="150px"
            />
          </CardContent>
        </Card>

        {/* Minimal Toolbar */}
        <Card>
          <CardHeader>
            <CardTitle>Minimal Toolbar</CardTitle>
            <CardDescription>
              Editor with limited formatting options.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <RichTextEditor
              value="<p>Simple text with basic formatting only.</p>"
              onChange={() => {}}
              modules={{
                toolbar: [
                  ['bold', 'italic', 'underline'],
                  [{ 'list': 'ordered'}, { 'list': 'bullet' }],
                  ['link']
                ]
              }}
              formats={['bold', 'italic', 'underline', 'list', 'bullet', 'link']}
              height="120px"
            />
          </CardContent>
        </Card>

        {/* Error State */}
        <Card>
          <CardHeader>
            <CardTitle>Error State</CardTitle>
            <CardDescription>
              Editor showing validation error styling.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <RichTextEditor
              value=""
              onChange={() => {}}
              error={true}
              placeholder="This field is required..."
              height="120px"
            />
          </CardContent>
        </Card>
      </div>

      {/* Usage Instructions */}
      <Card>
        <CardHeader>
          <CardTitle>How to Use</CardTitle>
          <CardDescription>
            Import and use the RichTextEditor component in your pages.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <h4 className="font-semibold mb-2">Basic Import:</h4>
              <pre className="p-3 bg-muted rounded text-sm overflow-auto">
{`import { RichTextEditor } from '@/components/ui'

const MyComponent = () => {
  const [content, setContent] = useState('')
  
  return (
    <RichTextEditor
      value={content}
      onChange={setContent}
      placeholder="Start writing..."
    />
  )
}`}
              </pre>
            </div>
            
            <div>
              <h4 className="font-semibold mb-2">Available Props:</h4>
              <ul className="list-disc list-inside space-y-1 text-sm text-muted-foreground">
                <li><code>value</code> - The HTML content string</li>
                <li><code>onChange</code> - Callback function when content changes</li>
                <li><code>placeholder</code> - Placeholder text when editor is empty</li>
                <li><code>readOnly</code> - Make editor read-only</li>
                <li><code>disabled</code> - Disable the editor</li>
                <li><code>error</code> - Show error styling</li>
                <li><code>height</code> - Set editor height (string or number)</li>
                <li><code>modules</code> - Customize toolbar and functionality</li>
                <li><code>formats</code> - Specify allowed formatting options</li>
                <li><code>theme</code> - Choose between 'snow' or 'bubble' theme</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

export default RichTextEditorExample 
import { Extension } from '@tiptap/core';
import Document from '@tiptap/extension-document';
import Paragraph from '@tiptap/extension-paragraph';
import Text from '@tiptap/extension-text';
import Heading from '@tiptap/extension-heading';
import Bold from '@tiptap/extension-bold';
import Italic from '@tiptap/extension-italic';
import Strike from '@tiptap/extension-strike';
import Code from '@tiptap/extension-code';
import CodeBlock from '@tiptap/extension-code-block';
import Blockquote from '@tiptap/extension-blockquote';
import BulletList from '@tiptap/extension-bullet-list';
import OrderedList from '@tiptap/extension-ordered-list';
import ListItem from '@tiptap/extension-list-item';
import Link from '@tiptap/extension-link';
import Image from '@tiptap/extension-image';
import History from '@tiptap/extension-history';
import Placeholder from '@tiptap/extension-placeholder';
import TextAlign from '@tiptap/extension-text-align';
import TextStyle from '@tiptap/extension-text-style';
import Color from '@tiptap/extension-color';
import Highlight from '@tiptap/extension-highlight';
import FontFamily from '@tiptap/extension-font-family';

// Enhanced Image extension with resizing and positioning
const EnhancedImage = Image.extend({
  addAttributes() {
    return {
      ...this.parent?.(),
      width: {
        default: null,
        parseHTML: element => element.getAttribute('width'),
        renderHTML: attributes => {
          if (!attributes.width) {
            return {}
          }
          return {
            width: attributes.width,
          }
        },
      },
      height: {
        default: null,
        parseHTML: element => element.getAttribute('height'),
        renderHTML: attributes => {
          if (!attributes.height) {
            return {}
          }
          return {
            height: attributes.height,
          }
        },
      },
      style: {
        default: null,
        parseHTML: element => element.getAttribute('style'),
        renderHTML: attributes => {
          if (!attributes.style) {
            return {}
          }
          return {
            style: attributes.style,
          }
        },
      },
    }
  },

  addNodeView() {
    return ({ node, getPos, editor }) => {
      const container = document.createElement('div');
      container.className = 'image-container relative inline-block group';
      
      const img = document.createElement('img');
      img.src = node.attrs.src;
      img.alt = node.attrs.alt || '';
      img.className = 'rounded-lg max-w-full shadow-md cursor-pointer';
      
      if (node.attrs.width) img.style.width = node.attrs.width + 'px';
      if (node.attrs.height) img.style.height = node.attrs.height + 'px';
      
      // Resize handles
      const resizeHandles = ['nw', 'ne', 'sw', 'se'].map(direction => {
        const handle = document.createElement('div');
        handle.className = `resize-handle resize-${direction} absolute w-3 h-3 bg-blue-500 border border-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity cursor-${direction}-resize`;
        
        // Position handles
        if (direction === 'nw') {
          handle.style.top = '-6px';
          handle.style.left = '-6px';
        } else if (direction === 'ne') {
          handle.style.top = '-6px';
          handle.style.right = '-6px';
        } else if (direction === 'sw') {
          handle.style.bottom = '-6px';
          handle.style.left = '-6px';
        } else if (direction === 'se') {
          handle.style.bottom = '-6px';
          handle.style.right = '-6px';
        }
        
        // Add resize functionality
        let isResizing = false;
        let startX = 0;
        let startY = 0;
        let startWidth = 0;
        let startHeight = 0;
        
        handle.addEventListener('mousedown', (e) => {
          e.preventDefault();
          e.stopPropagation();
          isResizing = true;
          startX = e.clientX;
          startY = e.clientY;
          startWidth = img.offsetWidth;
          startHeight = img.offsetHeight;
          
          const handleMouseMove = (e: MouseEvent) => {
            if (!isResizing) return;
            
            const deltaX = e.clientX - startX;
            const deltaY = e.clientY - startY;
            
            let newWidth = startWidth;
            let newHeight = startHeight;
            
            if (direction.includes('e')) newWidth = startWidth + deltaX;
            if (direction.includes('w')) newWidth = startWidth - deltaX;
            if (direction.includes('s')) newHeight = startHeight + deltaY;
            if (direction.includes('n')) newHeight = startHeight - deltaY;
            
            // Maintain aspect ratio
            const aspectRatio = startWidth / startHeight;
            if (Math.abs(deltaX) > Math.abs(deltaY)) {
              newHeight = newWidth / aspectRatio;
            } else {
              newWidth = newHeight * aspectRatio;
            }
            
            // Apply constraints
            newWidth = Math.max(50, Math.min(800, newWidth));
            newHeight = Math.max(50, Math.min(600, newHeight));
            
            img.style.width = newWidth + 'px';
            img.style.height = newHeight + 'px';
          };
          
          const handleMouseUp = () => {
            if (isResizing && typeof getPos === 'function') {
              const pos = getPos();
              editor.commands.updateAttributes('image', {
                width: img.offsetWidth,
                height: img.offsetHeight,
              });
            }
            isResizing = false;
            document.removeEventListener('mousemove', handleMouseMove);
            document.removeEventListener('mouseup', handleMouseUp);
          };
          
          document.addEventListener('mousemove', handleMouseMove);
          document.addEventListener('mouseup', handleMouseUp);
        });
        
        return handle;
      });
      
      container.appendChild(img);
      resizeHandles.forEach(handle => container.appendChild(handle));
      
      // Make image draggable
      container.draggable = true;
      container.addEventListener('dragstart', (e) => {
        e.dataTransfer?.setData('text/html', container.outerHTML);
      });
      
      return {
        dom: container,
        update: (updatedNode) => {
          if (updatedNode.type.name !== 'image') return false;
          img.src = updatedNode.attrs.src;
          img.alt = updatedNode.attrs.alt || '';
          if (updatedNode.attrs.width) img.style.width = updatedNode.attrs.width + 'px';
          if (updatedNode.attrs.height) img.style.height = updatedNode.attrs.height + 'px';
          return true;
        },
      };
    };
  },
});

export const getEditorExtensions = () => [
  Document,
  Paragraph,
  Text,
  Heading.configure({
    levels: [1, 2, 3],
  }),
  Bold,
  Italic,
  Strike,
  Code,
  CodeBlock.configure({
    HTMLAttributes: {
      class: 'bg-gray-100 rounded-lg p-4 my-4 overflow-x-auto font-mono text-sm',
    },
  }),
  Blockquote.configure({
    HTMLAttributes: {
      class: 'border-l-4 border-primary-400 pl-6 py-3 my-6 bg-primary-50 rounded-r-xl italic text-gray-600',
    },
  }),
  BulletList.configure({
    HTMLAttributes: {
      class: 'list-disc ml-6 mb-4',
    },
  }),
  OrderedList.configure({
    HTMLAttributes: {
      class: 'list-decimal ml-6 mb-4',
    },
  }),
  ListItem.configure({
    HTMLAttributes: {
      class: 'mb-2',
    },
  }),
  Link.configure({
    HTMLAttributes: {
      class: 'text-primary-600 hover:text-primary-700 underline decoration-primary-300 hover:decoration-primary-500 transition-colors',
    },
  }),
  EnhancedImage.configure({
    HTMLAttributes: {
      class: 'rounded-lg max-w-full h-auto my-4 shadow-md',
    },
  }),
  History,
  Placeholder.configure({
    placeholder: ({ node }) => {
      if (node.type.name === 'heading') {
        return 'Heading';
      }
      return 'Start typing or Press @ for Blocks...';
    },
  }),
  TextAlign.configure({
    types: ['heading', 'paragraph'],
  }),
  TextStyle,
  Color,
  Highlight.configure({
    multicolor: true,
  }),
  FontFamily.configure({
    types: ['textStyle'],
  }),
];
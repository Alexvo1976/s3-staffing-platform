import '@testing-library/jest-dom/vitest';
import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { Notice } from './Notice';

describe('Notice', () => {
  it('renders an accessible error alert', () => {
    render(<Notice state={{ type: 'error', message: 'Upload failed' }}/>);
    expect(screen.getByRole('alert')).toHaveTextContent('Upload failed');
  });

  it('renders nothing for an empty state', () => {
    const { container } = render(<Notice state={null}/>);
    expect(container).toBeEmptyDOMElement();
  });
});

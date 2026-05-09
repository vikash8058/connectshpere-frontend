import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import App from './App';
import { BrowserRouter } from 'react-router-dom';

describe('App Component', () => {
  it('should render the main page', () => {
    // We wrap it in BrowserRouter because your app uses routing
    render(<App/>);
  
    const elements = screen.getAllByText(/ConnectSphere/i);
    expect(elements.length).toBeGreaterThan(0); // Make sure at least one exists
    expect(elements[0]).toBeInTheDocument();
  });
});

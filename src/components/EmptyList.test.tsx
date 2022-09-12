import React from 'react';
import { render } from '@testing-library/react';
import { EmptyList } from './EmptyList';

describe('EmptyList', () => {
  test('Does not render', () => {
    const { baseElement, queryByTestId } = render(<EmptyList initialized={true} hasItems={true} bottom={"#fff"} />);
    const message = queryByTestId('message');
    expect(baseElement).toBeDefined();
    expect(message).toBeNull();
  });
  test('Renders empty list', () => {
    const { baseElement, getByTestId } = render(<EmptyList initialized={true} hasItems={false} bottom={"#fff"} />);
    const message = getByTestId('message');
    expect(baseElement).toBeDefined();
    expect(message.textContent).toBe('Click start to begin and your count history will show up here.');
  });
});

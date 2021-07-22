import React, { ReactDOM } from "react";
import TestDriver from '@airtable/blocks-testing';
import { render, screen, waitFor, getByRole } from '@testing-library/react';
import recordListFixture from './fixtures/simple_record_list';
import App from './App';

const testDriver = window.testDriver = new TestDriver(recordListFixture);

describe('App', () => {
  let testDriver;

  beforeEach(() => {
    testDriver = new TestDriver(recordListFixture);

    ReactDOM.render(
        <testDriver.Container>
          <App />
        </testDriver.Container>,
        document.body.appendChild(document.createElement('main')),
    );
  });

  it('renders start text', async () => {
    const startTextElement = screen.getByText(/Last change/i);
    await waitFor(() => expect(startTextElement).toBeInTheDocument());
  });
});
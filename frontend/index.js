/**
 * This starter app is specifically designed to be used with the "Product planning" base in the free Airtable course
 */

import React from 'react';
import { initializeBlock } from '@airtable/blocks/ui';
import App from './App';

// initializeBlock(() => <AirtableBlocksApp/>);
initializeBlock(() => <App />);

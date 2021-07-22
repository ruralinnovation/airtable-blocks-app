/**
 * This starter app is specifically designed to be used with the "Product planning" base in the free Airtable course
 */

import React, { Fragment, useEffect, useState } from 'react';
import {
    Button,
    initializeBlock,
    useBase,
    useLoadable,
    useRecordById, useRecordIds,
    useRecords,
    useWatchable
} from '@airtable/blocks/ui';
import App from './App';

// initializeBlock(() => <AirtableBlocksApp/>);
initializeBlock(() => <App />);

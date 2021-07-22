import { FieldType } from '@airtable/blocks/models';

export default {
    base: {
        id: 'appSMUkYcnivkh3ZL',
        name: 'Product planning',
        tables: [
            {
                id: 'tbltFrUZzyVLjpZTT',
                name: 'App sections',
                description: '',
                fields: [
                    {
                        id: 'flds2kFS5ulaFE146',
                        name: 'Status',
                        description: '',
                        type: FieldType.SINGLE_SELECT,
                        options: {
                            choices: [
                                { name: 'Not started', color: 'redLight2' },
                                { name: 'In Progress', color: 'yellowLight2' },
                                { name: 'Done', color: 'greenLight2' },
                            ]
                        },
                    }
                ],
                views: [],
                records: []
            }
        ]
    }
};

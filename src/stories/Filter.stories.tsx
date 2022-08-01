import React from 'react';
import { ComponentStory, ComponentMeta } from '@storybook/react';

import { Filter } from '../components/Filter';

export default {
    title: 'Taskany/Filter',
    component: Filter,
    args: {},
} as ComponentMeta<typeof Filter>;

const Template: ComponentStory<typeof Filter> = (args) => (
    <Filter {...args}>
        <Filter.Search />
        <Filter.FilterPopup buttonText="test">test popup</Filter.FilterPopup>
    </Filter>
);

export const Default = Template.bind({});

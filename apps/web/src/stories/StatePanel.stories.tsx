import type { Meta, StoryObj } from '@storybook/react';
import { StatePanel } from '../components';

const meta: Meta<typeof StatePanel> = {
  title: 'Composites/StatePanel',
  component: StatePanel,
};

export default meta;
type Story = StoryObj<typeof StatePanel>;

export const Default: Story = { args: { state: 'default' } };
export const Loading: Story = { args: { state: 'loading' } };
export const Empty: Story = { args: { state: 'empty' } };
export const Error: Story = { args: { state: 'error' } };
export const Success: Story = { args: { state: 'success' } };

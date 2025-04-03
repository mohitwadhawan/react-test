import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { Provider } from 'react-redux';
import configureStore from 'redux-mock-store';
import AdvertisingForm from './AdvertisingForm';
import { updateField } from '../../store/platformSlice';
import { setMessageData } from '../../store/messageSlice';

const mockStore = configureStore([]);

describe('AdvertisingForm', () => {
    let store;

    beforeEach(() => {
        store = mockStore({
            platform: {
                platform: 'test-platform',
                configuration: {
                    is_smb: '',
                    is_app_block: '1',
                    show_unify_widget: [],
                    parent_price_class_selector_pdp: '',
                    price_class_selector_pdp: '',
                },
                updatedFields: {}
            },
            message: {
                responseData: {
                    success: '',
                    step: '',
                    message: '',
                }
            }
        });

        store.dispatch = jest.fn();
    });

    const renderComponent = () => {
        return render(
            <Provider store={store}>
                <AdvertisingForm />
            </Provider>
        );
    };

    test('renders AdvertisingForm component', () => {
        renderComponent();
        expect(screen.getByText('Configure Advertising')).toBeInTheDocument();
    });

    test('handles checkbox field changes', () => {
        renderComponent();
        const checkbox = screen.getByLabelText('Product Display Page (PDP)');
        fireEvent.click(checkbox);
        
        expect(store.dispatch).toHaveBeenCalledWith(
            updateField({
                field: 'show_unify_widget',
                value: ['pdp']
            })
        );
    });

    test('handles radio button changes', () => {
        renderComponent();
        const appBlockRadio = screen.getByLabelText('App Block');
        fireEvent.click(appBlockRadio);
        
        expect(store.dispatch).toHaveBeenCalledWith(
            updateField({
                field: 'is_app_block',
                value: '1'
            })
        );
    });

    test('handles text input changes', () => {
        renderComponent();
        const pdpInput = screen.getByLabelText('PDP Element ID');
        fireEvent.change(pdpInput, { target: { value: 'test-id' } });
        
        expect(store.dispatch).toHaveBeenCalledWith(
            updateField({
                field: 'widget_location_on_pdp',
                value: 'test-id'
            })
        );
    });

    test('handles save button click', async () => {
        const mockPostMessage = jest.fn();
        window.parent.postMessage = mockPostMessage;
        
        renderComponent();
        const saveButton = screen.getByText('SAVE & CONTINUE');
        fireEvent.click(saveButton);

        await waitFor(() => {
            expect(mockPostMessage).toHaveBeenCalledWith(
                expect.objectContaining({
                    data: expect.objectContaining({
                        platform: 'test-platform',
                        step: 'step3'
                    })
                }),
                '*'
            );
        });
    });

    test('shows success message when API call succeeds', () => {
        store = mockStore({
            ...store.getState(),
            message: {
                responseData: {
                    success: '1',
                    step: 'step3',
                    message: 'Success!'
                }
            }
        });

        renderComponent();
        expect(screen.getByText('Success!')).toBeInTheDocument();
    });

    test('shows error message when API call fails', () => {
        store = mockStore({
            ...store.getState(),
            message: {
                responseData: {
                    success: '0',
                    step: 'step3',
                    message: 'Error occurred'
                }
            }
        });

        renderComponent();
        expect(screen.getByText('Error occurred')).toBeInTheDocument();
    });

    test('toggles sections correctly', () => {
        renderComponent();
        const advertisingSection = screen.getByText('Configure Advertising').closest('div');
        fireEvent.click(advertisingSection);
        
        // Check if the section expanded
        expect(advertisingSection).not.toHaveClass('container-inactive');
    });

    test('disables publish button when required fields are empty', () => {
        renderComponent();
        const publishButton = screen.getByText('PUBLISH');
        expect(publishButton).toBeDisabled();
    });
});

import React from 'react';
import { render, screen, fireEvent, act } from '@testing-library/react';
import { Provider } from 'react-redux';
import configureStore from 'redux-mock-store';
import thunk from 'redux-thunk';
import AdvertisingForm from './AdvertisingForm'; // Adjust the path if needed

jest.useFakeTimers();

const middlewares = [thunk];
const mockStore = configureStore(middlewares);

describe('AdvertisingForm Component', () => {
  it('renders without crashing', () => {
    const store = mockStore({
      platform: {
        platform: {},
        configuration: {
          show_unify_widget: [],
          tag_rules: "",
        },
        updatedFields: {},
      },
      message: {
        responseData: {},
      },
    });

    render(
      <Provider store={store}>
        <AdvertisingForm />
      </Provider>
    );

    expect(screen.getByText('Advertising Options')).toBeInTheDocument();
  });

  it('dispatches updateField on input change', () => {
    const store = mockStore({
      platform: {
        platform: {},
        configuration: {
          show_unify_widget: [],
          tag_rules: "",
        },
        updatedFields: {},
      },
      message: {
        responseData: {},
      },
    });

    render(
      <Provider store={store}>
        <AdvertisingForm />
      </Provider>
    );

    const input = screen.getByPlaceholderText('Ex: pdp-price-section');
    fireEvent.change(input, { target: { value: 'new-id' } });

    const actions = store.getActions();
    expect(actions).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          type: 'platform/updateField',
          payload: expect.objectContaining({
            field: 'parent_price_class_selector_pdp',
            value: 'new-id',
          }),
        }),
      ])
    );
  });

  it('toggles advertising section and resets adv success flag', () => {
    const store = mockStore({
      platform: {
        platform: {},
        configuration: {
          show_unify_widget: ['pdp'],
          tag_rules: '',
        },
        updatedFields: {},
      },
      message: {
        responseData: {},
      },
    });

    render(
      <Provider store={store}>
        <AdvertisingForm />
      </Provider>
    );

    const advHeader = screen.getAllByText(/Page Options/i)[0];
    act(() => {
      fireEvent.click(advHeader);
    });

    expect(screen.getByText(/Page Options/i)).toBeInTheDocument();
  });

  it('sets states correctly based on responseData.step and success', () => {
    const store = mockStore({
      platform: {
        platform: {},
        configuration: {
          show_unify_widget: [],
          tag_rules: "",
        },
        updatedFields: {},
      },
      message: {
        responseData: {
          success: "1",
          step: "step3",
          live_smb_partner_id: "abc123",
          message: "Saved",
        },
      },
    });

    render(
      <Provider store={store}>
        <AdvertisingForm />
      </Provider>
    );

    expect(screen.getByText('Saved')).toBeInTheDocument();
    expect(screen.getByText(/SAVE & CONTINUE/i)).toBeInTheDocument();
  });

  it('does not render Synchrony Promotions for SMB partner', () => {
    const store = mockStore({
      platform: {
        platform: {},
        configuration: {
          is_smb: "1",
          show_unify_widget: [],
        },
        updatedFields: {},
      },
      message: {
        responseData: {},
      },
    });

    render(
      <Provider store={store}>
        <AdvertisingForm />
      </Provider>
    );

    expect(screen.queryByText(/Enable Synchrony Promotions/i)).toBeNull();
  });

  it('renders embed fields when is_app_block is 0', () => {
    const store = mockStore({
      platform: {
        platform: {},
        configuration: {
          is_app_block: "0",
          show_unify_widget: [],
        },
        updatedFields: {},
      },
      message: {
        responseData: {},
      },
    });

    render(
      <Provider store={store}>
        <AdvertisingForm />
      </Provider>
    );

    expect(screen.getByPlaceholderText(/PDP Element ID/i)).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/PLP Element ID/i)).toBeInTheDocument();
  });

  it('dispatches setMessageData after timeout', () => {
    const store = mockStore({
      platform: {
        platform: {},
        configuration: {
          show_unify_widget: [],
        },
        updatedFields: {},
      },
      message: {
        responseData: {
          success: "0",
          step: "step4",
          live_smb_partner_id: "",
        },
      },
    });

    render(
      <Provider store={store}>
        <AdvertisingForm />
      </Provider>
    );

    act(() => {
      jest.advanceTimersByTime(5000);
    });

    const actions = store.getActions();
    expect(actions).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          type: 'message/setMessageData',
        }),
      ])
    );
  });
});

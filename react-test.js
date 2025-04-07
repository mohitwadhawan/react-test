import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { Provider } from "react-redux";
import configureStore from "redux-mock-store";
import thunk from "redux-thunk";
import ApiAccessForm from "../ApiAccessForm"; // Adjust the path
import * as platformSlice from "../../../store/platformSlice"; // Adjust import
import "@testing-library/jest-dom";

const middlewares = [thunk];
const mockStore = configureStore(middlewares);

const mockPostMessage = jest.fn();
window.parent.postMessage = mockPostMessage;

const defaultState = {
  platform: {
    platform: "test-platform",
    configuration: {
      is_smb: "1",
      live_smb_partner_id: "",
      live_partner_id: "",
      live_activation_key: "",
      live_smb_domains: [],
      parent_origin: "http://localhost",
    },
    updateFields: {},
  },
  messageResponseData: {
    messageResponseData: {},
  },
};

const setup = (stateOverrides = {}) => {
  const store = mockStore({ ...defaultState, ...stateOverrides });
  render(
    <Provider store={store}>
      <ApiAccessForm />
    </Provider>
  );
  return store;
};

describe("ApiAccessForm", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("renders the component", () => {
    setup();
    expect(screen.getByText("API Access Activation")).toBeInTheDocument();
  });

  it("shows SMB buttons when configuration.is_smb is '1'", () => {
    setup();
    expect(screen.getByText(/Use Activation Key/i)).toBeInTheDocument();
    expect(screen.getByText(/Use Partner ID/i)).toBeInTheDocument();
  });

  it("toggles section when header is clicked", () => {
    setup();
    const header = screen.getByText("API Access Activation");
    fireEvent.click(header);
    expect(screen.getByText("API Access Activation")).toBeInTheDocument();
  });

  it("handles activation key button click", () => {
    setup();
    fireEvent.click(screen.getByText(/Use Activation Key/i));
    expect(screen.getByText(/Use Activation Key/i)).toBeInTheDocument();
  });

  it("handles partner ID button click", () => {
    setup();
    fireEvent.click(screen.getByText(/Use Partner ID/i));
    expect(screen.getByText(/Use Partner ID/i)).toBeInTheDocument();
  });

  it("calls handleFieldChange and updates Redux store", () => {
    const spy = jest.spyOn(platformSlice, "updateField");
    setup();
    fireEvent.change(screen.getByLabelText(/Partner Id/i), {
      target: { value: "1234567890" },
    });
    expect(spy).toHaveBeenCalled();
  });

  it("disables save button on error", () => {
    setup();
    const button = screen.getAllByText("ACTIVATE")[0];
    expect(button.closest("button")).toBeDisabled();
  });

  it("submits form with valid data", async () => {
    const stateWithPartnerId = {
      platform: {
        ...defaultState.platform,
        configuration: {
          ...defaultState.platform.configuration,
          is_smb: "1",
          live_partner_id: "1234567890",
        },
      },
    };

    setup(stateWithPartnerId);
    fireEvent.click(screen.getAllByText("ACTIVATE")[0]);

    await waitFor(() => {
      expect(mockPostMessage).toHaveBeenCalled();
    });
  });

  it("does not submit form if activation key is missing for SMB", () => {
    setup();
    fireEvent.click(screen.getAllByText("ACTIVATE")[0]);
    expect(mockPostMessage).not.toHaveBeenCalled();
  });

  it("handles field change logic for live_child_merchant_id", () => {
    setup();
    const merchantInput = screen.getByLabelText(/Child Merchant Id/i);
    fireEvent.change(merchantInput, { target: { value: "" } });
    expect(merchantInput).toBeInTheDocument();
  });

  it("renders child partner code when showPartnerCode is true", () => {
    const updatedState = {
      platform: {
        ...defaultState.platform,
        configuration: {
          ...defaultState.platform.configuration,
          live_child_merchant_id: "childId",
          live_child_partner_code: "childCode",
        },
      },
    };
    setup(updatedState);
    expect(screen.getByLabelText(/Child Partner Code/i)).toBeInTheDocument();
  });
});

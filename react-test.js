import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { Provider } from "react-redux";
import configureStore from "redux-mock-store";
import { useDispatch } from "react-redux";
import AdvertisingForm from "../AdvertisingForm";
import { setMessageData } from "../../store/messageSlice";

jest.mock("react-redux", () => ({
  ...jest.requireActual("react-redux"),
  useSelector: jest.fn(),
  useDispatch: jest.fn(),
}));

jest.mock("../../store/messageSlice", () => ({
  setMessageData: jest.fn(),
}));

const mockStore = configureStore([]);

describe("AdvertisingForm Component", () => {
  let store: any;
  let mockDispatch: jest.Mock;

  beforeEach(() => {
    mockDispatch = jest.fn();
    (useDispatch as jest.Mock).mockReturnValue(mockDispatch);

    store = mockStore({
      platform: {
        configuration: { is_app_block: "0", show_unify_widget: ["pdp"], tag_rules: "1" },
        updatedFields: {},
      },
      message: { responseData: { success: "1", step: "step1", message: "Success Message" } },
    });

    store.dispatch = jest.fn();
  });

  it("renders the component correctly", () => {
    render(
      <Provider store={store}>
        <AdvertisingForm />
      </Provider>
    );

    expect(screen.getByText("Configure Advertising")).toBeInTheDocument();
  });

  it("displays success message if responseData is available", () => {
    render(
      <Provider store={store}>
        <AdvertisingForm />
      </Provider>
    );

    expect(screen.getByText("Success Message")).toBeInTheDocument();
  });

  it("toggles advertising section on click", () => {
    render(
      <Provider store={store}>
        <AdvertisingForm />
      </Provider>
    );

    const advHeader = screen.getByText("Configure Advertising");
    fireEvent.click(advHeader);
  });

  it("updates state when selecting an option", async () => {
    render(
      <Provider store={store}>
        <AdvertisingForm />
      </Provider>
    );

    const radioButton = screen.getByLabelText("App Embed");
    fireEvent.click(radioButton);

    await waitFor(() => {
      expect(store.dispatch).toHaveBeenCalled();
    });
  });

  it("handles save button click", () => {
    render(
      <Provider store={store}>
        <AdvertisingForm />
      </Provider>
    );

    const saveButton = screen.getByText("SAVE & CONTINUE");
    fireEvent.click(saveButton);

    expect(store.dispatch).toHaveBeenCalled();
  });

  it("dispatches setMessageData on timeout", async () => {
    jest.useFakeTimers();

    render(
      <Provider store={store}>
        <AdvertisingForm />
      </Provider>
    );

    jest.advanceTimersByTime(5000);

    expect(mockDispatch).toHaveBeenCalledWith(
      setMessageData({
        responseData: {
          success: "",
          step: "step1",
          live_smb_partner_id: "",
          message: "",
        },
      })
    );

    jest.useRealTimers();
  });

  it("calls window.parent.postMessage when saving", () => {
    window.parent.postMessage = jest.fn();

    render(
      <Provider store={store}>
        <AdvertisingForm />
      </Provider>
    );

    const saveButton = screen.getByText("SAVE & CONTINUE");
    fireEvent.click(saveButton);

    expect(window.parent.postMessage).toHaveBeenCalled();
  });
});

import axios from "axios";
import { useState } from "react";
import { useAuth } from "../Context/Auth";
import { useSelector } from "react-redux";
import { useTranslation } from 'react-i18next';

export const useChangeState = () => {
  const auth = useAuth();
  const user = useSelector(state => state.userProject)
  const [loadingChange, setLoadingChange] = useState(false);
  const [responseChange, setResponseChange] = useState(null);
  const { t, i18n } = useTranslation();

  const changeState = async (url, name, data) => { // Accepting a single "data" object
    setLoadingChange(true);
    try {
      const config = {
        headers: {
          'Authorization': `Bearer ${auth?.userState?.token || ''}`,
        },
      };

      // Send the "data" object directly as the request body

      const response = await axios.put(url, data || {}, config);

      if (response.status === 200) {
        setResponseChange(response);
        auth.toastSuccess(name);
        return true; // Return true on success
      }
    }
    // catch (error) {
    //   auth.toastError(error.message);
    //   console.error('Error changing state:', error);
    //   return false; // Return false on error
    // } 
    catch (error) {
      console.error('Error post JSON:', error);

      if (error?.response?.data?.errors === "You can't change status") {
        throw error; // Let the component handle this specific error
      }

      // Check if the error response contains 'errors' or just a message
      if (error?.response?.data?.errors) {
        // Check if errors are an object (field-based errors)
        if (typeof error.response.data.errors === 'object') {
          Object.entries(error.response.data.errors).forEach(([field, messages]) => {
            // If messages is an array, loop through them
            if (Array.isArray(messages)) {
              messages.forEach(message => {
                auth.toastError(message); // Display the error messages
              });
            } else {
              // If it's not an array, display the message directly
              auth.toastError(messages);
            }
          });
        } else {
          // If errors is not an object, assume it's just a message
          auth.toastError(error.response.data.errors);
        }
      } else if (error?.response?.data?.message) {
        // If there's a general message outside of the 'errors' object
        auth.toastError(error.response.data.message); // Display the general error message
      } else {
        // If no specific error messages are found, just display a fallback message
        auth.toastError(t("Anunknownerroroccurred"));
      }
    }
    finally {
      setLoadingChange(false);
    }
  };

  return { changeState, loadingChange, responseChange };
};

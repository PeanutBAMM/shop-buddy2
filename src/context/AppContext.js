import React, { createContext, useContext, useReducer, useEffect } from "react";
import { authService } from "../../app/services/auth";
import { apiService } from "../../app/services/api";
import { errorHandler } from "../../app/utils/errorHandler";

const AppContext = createContext();

const initialState = {
  user: null,
  isAuthenticated: false,
  loading: true,
  shoppingLists: [],
  currentList: null,
  error: null,
};

const appReducer = (state, action) => {
  switch (action.type) {
    case "SET_USER":
      return {
        ...state,
        user: action.payload,
        isAuthenticated: !!action.payload,
        loading: false,
      };

    case "SET_LOADING":
      return { ...state, loading: action.payload };

    case "SET_ERROR":
      return { ...state, error: action.payload };

    case "SET_SHOPPING_LISTS":
      return { ...state, shoppingLists: action.payload };

    case "SET_CURRENT_LIST":
      return { ...state, currentList: action.payload };

    case "ADD_LIST":
      return {
        ...state,
        shoppingLists: [...state.shoppingLists, action.payload],
      };

    case "UPDATE_LIST":
      return {
        ...state,
        shoppingLists: state.shoppingLists.map((list) =>
          list.id === action.payload.id ? action.payload : list,
        ),
        currentList:
          state.currentList?.id === action.payload.id
            ? action.payload
            : state.currentList,
      };

    case "DELETE_LIST":
      return {
        ...state,
        shoppingLists: state.shoppingLists.filter(
          (list) => list.id !== action.payload,
        ),
        currentList:
          state.currentList?.id === action.payload ? null : state.currentList,
      };

    case "LOGOUT":
      return { ...initialState, loading: false };

    default:
      return state;
  }
};

export const AppProvider = ({ children }) => {
  const [state, dispatch] = useReducer(appReducer, initialState);

  // Check authentication on app start
  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    try {
      const user = await authService.getCurrentUser();
      dispatch({ type: "SET_USER", payload: user });
    } catch (error) {
      console.error("Auth check error:", error);
      dispatch({ type: "SET_USER", payload: null });
      dispatch({ type: "SET_LOADING", payload: false });
    }
  };

  // Fetch shopping lists when user is authenticated
  useEffect(() => {
    if (state.isAuthenticated) {
      fetchShoppingLists();
    }
  }, [state.isAuthenticated]);

  const fetchShoppingLists = async () => {
    try {
      const response = await apiService.lists.getAll();
      dispatch({ type: "SET_SHOPPING_LISTS", payload: response.data || [] });
    } catch (error) {
      console.error("Error fetching shopping lists:", error);
      const errorMessage = errorHandler.network(error);
      dispatch({ type: "SET_ERROR", payload: errorMessage });
      dispatch({ type: "SET_SHOPPING_LISTS", payload: [] });
    }
  };

  const value = {
    ...state,
    dispatch,
    // Helper functions
    login: async (email, password) => {
      try {
        const result = await authService.login(email, password);
        if (result.success) {
          dispatch({ type: "SET_USER", payload: result.user });
        }
        return result;
      } catch (error) {
        console.error("Login error:", error);
        return { success: false, error: error.message };
      }
    },
    logout: async () => {
      try {
        await authService.logout();
        dispatch({ type: "LOGOUT" });
      } catch (error) {
        console.error("Logout error:", error);
        dispatch({ type: "LOGOUT" });
      }
    },
    refreshLists: fetchShoppingLists,
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error("useApp must be used within AppProvider");
  }
  return context;
};

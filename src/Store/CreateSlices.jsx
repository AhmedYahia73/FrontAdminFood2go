import { createSlice } from "@reduxjs/toolkit";
import { useGet } from "../Hooks/useGet";
import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";

const apiUrl = import.meta.env.VITE_API_BASE_URL;
// Initial states
const initialUserState = null;
const initialCategoryState = null;

const initialNewOrders = {
       count: 0,
       orders: [],
};
const initialSoundNotification = { data: null };

const initialOrdersAllState = {
       data: [],
       loading: false,
};
const initialOrdersPendingState = {
       data: [],
       loading: false,
};
const initialOrdersConfirmedState = {
       data: [],
       loading: false,
};
const initialOrdersProcessingState = {
       data: [],
       loading: false,
};
const initialOrdersOutForDeliveryState = {
       data: [],
       loading: false,
};
const initialOrdersDeliveredState = {
       data: [],
       loading: false,
};
const initialOrdersReturnedState = {
       data: [],
       loading: false,
};
const initialOrdersRefundState = {
       data: [],
       loading: false,
};
const initialOrdersFailedState = {
       data: [],
       loading: false,
};
const initialOrdersCanceledState = {
       data: [],
       loading: false,
};
const initialOrdersScheduleState = {
       data: [],
       loading: false,
};

const initialSearchState = {
       query: '',
};

const initialFilterActiveState = {
       active: false,
};

const initialOrderCountsState = {
       orders: 0,
       pending: 0,
       processing: 0,
       out_for_delivery: 0,
       delivered: 0,
       returned: 0,
       refund: 0,
       faild_to_deliver: 0,
       canceled: 0,
       scheduled: 0,
       confirmed: 0,
};

const initialOrderPageState = {
       active: false,
       status: 'unknown', // unknown | success | failed
};

const initialLanguage = { data: [], selected: 'en', }

// New Orders slice
const newOrdersSlice = createSlice({
       name: "newOrders",
       initialState: initialNewOrders,
       reducers: {
              setNewOrders: (state, action) => {
                     return { ...state, ...action.payload }; // Merges payload into the existing state
              },
       },
});
// Sound Notification slice
const soundNotification = createSlice({
       name: "soundNotification",
       initialState: initialSoundNotification,
       reducers: {
              setSoundNotification: (state, action) => {
                     state.data = action.payload;
              },
       },
});

// User slice
const userSlice = createSlice({
       name: "userProject",
       initialState: initialUserState,
       reducers: {
              setUser: (state, action) => {
                     return { ...state, ...action.payload };
              },
              removeUser: () => {
                     return null;
              },
       },
});

// Category slice
const categorySlice = createSlice({
       name: "category",
       initialState: initialCategoryState,
       reducers: {
              setCategory: (state, action) => {
                     return { ...state, ...action.payload };
              },
              removeCategory: () => {
                     return null;
              },
       },
});

// OrdersAll slice
const ordersAllSlice = createSlice({
       name: "ordersAll",
       initialState: initialOrdersAllState,
       reducers: {
              setOrdersAll: (state, action) => {
                     state.data = action.payload; // Update orders data
                     state.loading = false; // Set loading to false when data is set
              },
              setLoading: (state, action) => {
                     state.loading = action.payload; // Update loading state
              },
       },
});
// OrdersPending slice
const ordersPendingSlice = createSlice({
       name: "ordersPending",
       initialState: initialOrdersPendingState,
       reducers: {
              setOrdersPending: (state, action) => {
                     state.data = action.payload; // Update orders data
                     state.loading = false; // Set loading to false when data is set
              },
              setLoading: (state, action) => {
                     state.loading = action.payload; // Update loading state
              },
       },
});
// ordersConfirmed slice
const ordersConfirmedSlice = createSlice({
       name: "ordersConfirmed",
       initialState: initialOrdersConfirmedState,
       reducers: {
              setOrdersConfirmed: (state, action) => {
                     state.data = action.payload; // Update orders data
                     state.loading = false; // Set loading to false when data is set
              },
              setLoading: (state, action) => {
                     state.loading = action.payload; // Update loading state
              },
       },
});
// ordersProcessing slice
const ordersProcessingSlice = createSlice({
       name: "ordersProcessing",
       initialState: initialOrdersProcessingState,
       reducers: {
              setOrdersProcessing: (state, action) => {
                     state.data = action.payload; // Update orders data
                     state.loading = false; // Set loading to false when data is set
              },
              setLoading: (state, action) => {
                     state.loading = action.payload; // Update loading state
              },
       },
});
// ordersOutForDelivery slice
const ordersOutForDeliverySlice = createSlice({
       name: "ordersOutForDelivery",
       initialState: initialOrdersOutForDeliveryState,
       reducers: {
              setOrdersOutForDelivery: (state, action) => {
                     state.data = action.payload; // Update orders data
                     state.loading = false; // Set loading to false when data is set
              },
              setLoading: (state, action) => {
                     state.loading = action.payload; // Update loading state
              },
       },
});
// ordersDelivered slice
const ordersDeliveredSlice = createSlice({
       name: "ordersDelivered",
       initialState: initialOrdersDeliveredState,
       reducers: {
              setOrdersDelivered: (state, action) => {
                     state.data = action.payload; // Update orders data
                     state.loading = false; // Set loading to false when data is set
              },
              setLoading: (state, action) => {
                     state.loading = action.payload; // Update loading state
              },
       },
});
// ordersReturned slice
const ordersReturnedSlice = createSlice({
       name: "ordersReturned",
       initialState: initialOrdersReturnedState,
       reducers: {
              setOrdersReturned: (state, action) => {
                     state.data = action.payload; // Update orders data
                     state.loading = false; // Set loading to false when data is set
              },
              setLoading: (state, action) => {
                     state.loading = action.payload; // Update loading state
              },
       },
});
// ordersRefund slice
const ordersRefundSlice = createSlice({
       name: "ordersRefund",
       initialState: initialOrdersRefundState,
       reducers: {
              setOrdersRefund: (state, action) => {
                     state.data = action.payload; // Update orders data
                     state.loading = false; // Set loading to false when data is set
              },
              setLoading: (state, action) => {
                     state.loading = action.payload; // Update loading state
              },
       },
});
// ordersFailed slice
const ordersFailedSlice = createSlice({
       name: "ordersFailed",
       initialState: initialOrdersFailedState,
       reducers: {
              setOrdersFailed: (state, action) => {
                     state.data = action.payload; // Update orders data
                     state.loading = false; // Set loading to false when data is set
              },
              setLoading: (state, action) => {
                     state.loading = action.payload; // Update loading state
              },
       },
});
// ordersCanceled slice
const ordersCanceledSlice = createSlice({
       name: "ordersCanceled",
       initialState: initialOrdersCanceledState,
       reducers: {
              setOrdersCanceled: (state, action) => {
                     state.data = action.payload; // Update orders data
                     state.loading = false; // Set loading to false when data is set
              },
              setLoading: (state, action) => {
                     state.loading = action.payload; // Update loading state
              },
       },
});
// ordersSchedule slice
const ordersScheduleSlice = createSlice({
       name: "ordersSchedule",
       initialState: initialOrdersScheduleState,
       reducers: {
              setOrdersSchedule: (state, action) => {
                     state.data = action.payload; // Update orders data
                     state.loading = false; // Set loading to false when data is set
              },
              setLoading: (state, action) => {
                     state.loading = action.payload; // Update loading state
              },
       },
});

// Add this with your other initial states
const initialCanceledOrdersState = {
       orders: [], // Array of order IDs
       count: 0,   // Total count for badge
       newOrder: null, // Track current notification
};

// Add this with your other slices
const canceledOrdersSlice = createSlice({
       name: "canceledOrders",
       initialState: initialCanceledOrdersState,
       reducers: {
              addCanceledOrder: (state, action) => {
                     if (!state.orders.includes(action.payload)) {
                            state.orders.push(action.payload);
                            state.count = state.orders.length;
                     }
              },
              removeCanceledOrder: (state, action) => {
                     state.orders = state.orders.filter(id => id !== action.payload);
                     state.count = state.orders.length;
              },
              setNewCanceledOrder: (state, action) => {
                     state.newOrder = action.payload;
              },
              clearCanceledOrders: (state) => {
                     state.orders = [];
                     state.count = 0;
                     state.newOrder = null;
              },
       },
});

// Global Trigger Slice
const initialGlobalTriggerState = {
       value: 0
};

const globalTriggerSlice = createSlice({
       name: "globalTrigger",
       initialState: initialGlobalTriggerState,
       reducers: {
              triggerRefresh: (state) => {
                     state.value += 1;
              }
       }
});

// Search slice
const searchSlice = createSlice({
       name: "search",
       initialState: initialSearchState,
       reducers: {
              setGlobalSearch: (state, action) => {
                     state.query = action.payload;
              },
              clearGlobalSearch: (state) => {
                     state.query = '';
              },
       },
});

/* Languages */
const languageSlice = createSlice({
       name: 'language',
       initialState: initialLanguage,
       reducers: {
              setLanguage: (state, action) => {
                     state.selected = action.payload;
              },
              setLanguageData: (state, action) => {
                     state.data = action.payload;
              }
       }
})

const filterActiveSlice = createSlice({
       name: "filterActive",
       initialState: initialFilterActiveState,
       reducers: {
              setFilterActive: (state, action) => {
                     state.active = action.payload;
              },
       },
});

const orderPageStateSlice = createSlice({
       name: "orderPageState",
       initialState: initialOrderPageState,
       reducers: {
              setOrderPageActive: (state, action) => {
                     state.active = action.payload;
              },
              setOrderPageStatus: (state, action) => {
                     state.status = action.payload;
              },
       },
});

const orderCountsSlice = createSlice({
       name: "orderCounts",
       initialState: initialOrderCountsState,
       reducers: {
              setOrderCounts: (state, action) => {
                     return { ...state, ...action.payload };
              },
       },
});



const role = localStorage.getItem("role"); // قراءة الدور
const primaryOrdersUrl =
       role === "branch"
              ? `${apiUrl}/branch/online_order`
              : `${apiUrl}/admin/order`;

// Fetch and dispatch orders
export const OrdersComponent = () => {
       const dispatch = useDispatch();
       const trigger = useSelector((state) => state.globalTrigger.value);
       const isFilterActive = useSelector((state) => state.filterActive.active);

              const orderPageStatus = useSelector((state) => state.orderPageState?.status || 'unknown');
       const shouldFetchPrimaryOrders = orderPageStatus === 'failed';

       const { refetch: refetchPrimaryOrders, data: primaryOrdersData, loading } = useGet({
              url: primaryOrdersUrl,
              params: {
                     order_status: 'all'
              },
              enabled: shouldFetchPrimaryOrders,
              staleTime: 0,
              gcTime: 0
       });

       useEffect(() => {
              if (shouldFetchPrimaryOrders) {
                     refetchPrimaryOrders();
              }
       }, [refetchPrimaryOrders, trigger, shouldFetchPrimaryOrders]);

       // Log data to debug
       useEffect(() => {
              dispatch(ordersAllSlice.actions.setLoading(loading));
              dispatch(ordersPendingSlice.actions.setLoading(loading));
              dispatch(ordersConfirmedSlice.actions.setLoading(loading));
              dispatch(ordersProcessingSlice.actions.setLoading(loading));
              dispatch(ordersOutForDeliverySlice.actions.setLoading(loading));
              dispatch(ordersDeliveredSlice.actions.setLoading(loading));
              dispatch(ordersReturnedSlice.actions.setLoading(loading));
              dispatch(ordersRefundSlice.actions.setLoading(loading));
              dispatch(ordersFailedSlice.actions.setLoading(loading));
              dispatch(ordersCanceledSlice.actions.setLoading(loading));
              dispatch(ordersScheduleSlice.actions.setLoading(loading));
       }, [loading, dispatch]);

       useEffect(() => {
              if (!isFilterActive && Array.isArray(primaryOrdersData?.orders)) {
                     dispatch(ordersAllSlice.actions.setOrdersAll(primaryOrdersData.orders));
                     dispatch(ordersPendingSlice.actions.setOrdersPending(primaryOrdersData.pending));
                     dispatch(ordersConfirmedSlice.actions.setOrdersConfirmed(primaryOrdersData.confirmed));
                     dispatch(ordersProcessingSlice.actions.setOrdersProcessing(primaryOrdersData.processing));
                     dispatch(ordersOutForDeliverySlice.actions.setOrdersOutForDelivery(primaryOrdersData.out_for_delivery));
                     dispatch(ordersDeliveredSlice.actions.setOrdersDelivered(primaryOrdersData.delivered));
                     dispatch(ordersReturnedSlice.actions.setOrdersReturned(primaryOrdersData.returned));
                     dispatch(ordersRefundSlice.actions.setOrdersRefund(primaryOrdersData.refund));
                     dispatch(ordersFailedSlice.actions.setOrdersFailed(primaryOrdersData.faild_to_deliver));
                     dispatch(ordersCanceledSlice.actions.setOrdersCanceled(primaryOrdersData.canceled));
                     dispatch(ordersScheduleSlice.actions.setOrdersSchedule(primaryOrdersData.scheduled));
              }
       }, [primaryOrdersData, dispatch, isFilterActive]);

       return null; // No UI returned
};

export const { setOrderPageStatus } = orderPageStateSlice.actions;

// Fetch real-time order counts for sidebar badges
export const OrderCountsComponent = () => {
       const dispatch = useDispatch();
       const trigger = useSelector((state) => state.globalTrigger.value);
       const role = localStorage.getItem("role");
       const countUrl =
              role === "branch"
                     ? `${apiUrl}/branch/online_order/count`
                     : `${apiUrl}/admin/order/count`;

       const { refetch: refetchCounts, data: countsData } = useGet({ 
              url: countUrl,
              staleTime: 0,
              gcTime: 0
       });

       useEffect(() => {
              refetchCounts();
       }, [refetchCounts, trigger]);

       useEffect(() => {
              if (countsData) {
                     dispatch(orderCountsSlice.actions.setOrderCounts(countsData));
              }
       }, [countsData, dispatch]);

       return null;
};

// Export actions
export const { setNewOrders } = newOrdersSlice.actions;
export const { setSoundNotification } = soundNotification.actions;

export const { setUser, removeUser } = userSlice.actions;
export const { setCategory, removeCategory } = categorySlice.actions;
export const { setOrdersAll } = ordersAllSlice.actions;
export const { setOrdersPending } = ordersPendingSlice.actions;
export const { setOrdersConfirmed } = ordersConfirmedSlice.actions;
export const { setOrdersProcessing } = ordersProcessingSlice.actions;
export const { setOrdersOutForDelivery } = ordersOutForDeliverySlice.actions;
export const { setOrdersDelivered } = ordersDeliveredSlice.actions;
export const { setOrdersReturned } = ordersReturnedSlice.actions;
export const { setOrdersRefund } = ordersRefundSlice.actions;
export const { setOrdersFailed } = ordersFailedSlice.actions;
export const { setOrdersCanceled } = ordersCanceledSlice.actions;
export const { setOrdersSchedule } = ordersScheduleSlice.actions;
export const { setLanguage, setLanguageData } = languageSlice.actions;
export const { setGlobalSearch, clearGlobalSearch } = searchSlice.actions;
export const { triggerRefresh } = globalTriggerSlice.actions;
export const { setFilterActive } = filterActiveSlice.actions;
export const { setOrderCounts } = orderCountsSlice.actions;
export const orderPageStateReducer = orderPageStateSlice.reducer;

// Export reducers
export const newOrdersReducer = newOrdersSlice.reducer;
export const soundNotificationReducer = soundNotification.reducer;

export const userReducer = userSlice.reducer;
export const categoryReducer = categorySlice.reducer;
export const ordersAllReducer = ordersAllSlice.reducer;
export const ordersPendingReducer = ordersPendingSlice.reducer;
export const ordersConfirmedReducer = ordersConfirmedSlice.reducer;
export const ordersProcessingReducer = ordersProcessingSlice.reducer;
export const ordersOutForDeliveryReducer = ordersOutForDeliverySlice.reducer;
export const ordersDeliveredReducer = ordersDeliveredSlice.reducer;
export const ordersReturnedReducer = ordersReturnedSlice.reducer;
export const ordersRefundReducer = ordersRefundSlice.reducer;
export const ordersFailedReducer = ordersFailedSlice.reducer;
export const ordersCanceledReducer = ordersCanceledSlice.reducer;
export const ordersScheduleReducer = ordersScheduleSlice.reducer;
export const languageReducer = languageSlice.reducer;
export const searchReducer = searchSlice.reducer;
export const globalTriggerReducer = globalTriggerSlice.reducer;
export const filterActiveReducer = filterActiveSlice.reducer;
export const orderCountsReducer = orderCountsSlice.reducer;


// Add to your exports
export const { addCanceledOrder, removeCanceledOrder, clearCanceledOrders, setNewCanceledOrder } = canceledOrdersSlice.actions;
export const canceledOrdersReducer = canceledOrdersSlice.reducer;
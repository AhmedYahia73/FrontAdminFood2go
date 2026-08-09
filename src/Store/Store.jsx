import { configureStore } from "@reduxjs/toolkit";
import { persistStore, persistReducer } from 'redux-persist';
import storage from 'redux-persist/lib/storage';
import { userReducer, categoryReducer, ordersAllReducer, ordersPendingReducer, ordersConfirmedReducer, ordersProcessingReducer, ordersOutForDeliveryReducer, ordersDeliveredReducer, ordersReturnedReducer, ordersRefundReducer, ordersFailedReducer, ordersCanceledReducer, ordersScheduleReducer, newOrdersReducer, soundNotificationReducer, languageReducer, searchReducer, globalTriggerReducer, filterActiveReducer, orderCountsReducer, orderPageStateReducer } from "./CreateSlices";
import { combineReducers } from 'redux';
import { canceledOrdersReducer } from "./CreateSlices";

// All reducers
const reducers = combineReducers({
       newOrders: newOrdersReducer,
       soundNotification: soundNotificationReducer,
       category: categoryReducer,
       ordersAll: ordersAllReducer,
       ordersPending: ordersPendingReducer,
       ordersConfirmed: ordersConfirmedReducer,
       ordersProcessing: ordersProcessingReducer,
       ordersOutForDelivery: ordersOutForDeliveryReducer,
       ordersDelivered: ordersDeliveredReducer,
       ordersReturned: ordersReturnedReducer,
       ordersRefund: ordersRefundReducer,
       ordersFailed: ordersFailedReducer,
       ordersCanceled: ordersCanceledReducer,
       ordersSchedule: ordersScheduleReducer,
       userProject: userReducer,  // Add user reducer here
       language: languageReducer,
       search: searchReducer,

       canceledOrders: canceledOrdersReducer,
       globalTrigger: globalTriggerReducer,
       filterActive: filterActiveReducer,
       orderCounts: orderCountsReducer,
       orderPageState: orderPageStateReducer,
});

// Persist configuration
const persistConfig = {
       key: 'root',
       storage,
       whitelist: ['userProject', 'canceledOrders', 'language'], // Add canceledOrders and language to persisted state
};

const persistedReducer = persistReducer(persistConfig, reducers);

export const StoreApp = configureStore({
       reducer: persistedReducer,
       middleware: (getDefaultMiddleware) =>
              getDefaultMiddleware({
                     serializableCheck: false,
              }),
});

export const persistor = persistStore(StoreApp);

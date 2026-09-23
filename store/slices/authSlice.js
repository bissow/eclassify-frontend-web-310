import { createSelector, createSlice } from "@reduxjs/toolkit";
import { store } from "../storeRef";

const initialState = {
    data: null,
};

export const authSlice = createSlice({
    name: "UserSignup",
    initialState,
    reducers: {

        updateDataSuccess: (usersignup, action) => {
            usersignup.data = action.payload;
        },
        userUpdateData: (usersignup, action) => {
            usersignup.data.data = action.payload.data;
        },
        userLogout: (usersignup) => {
            usersignup.data = null; // Clear data when user logs out
        },
        decreaseFollowingCount: (state) => {
            if (
                state?.data?.data &&
                typeof state.data.data.following_count === "number" &&
                state.data.data.following_count > 0
            ) {
                state.data.data.following_count -= 1;
            }
        },
        decreaseUnreadChatCount: (state, action) => {
            const { isSelling, amount } = action.payload;
            const key = isSelling ? "total_seller_unread_chat_count" : "total_buyer_unread_chat_count";
            const data = state?.data?.data;
            if (data && typeof data[key] === "number") {
                data[key] = Math.max(0, data[key] - amount);
            }
        },
        increaseUnreadChatCount: (state, action) => {
            const { isSelling, amount = 1 } = action.payload;
            const key = isSelling ? "total_seller_unread_chat_count" : "total_buyer_unread_chat_count";
            const data = state?.data?.data;
            if (data && typeof data[key] === "number") {
                data[key] += amount;
            }
        },
        setUnreadChatCount: (state, action) => {
            const { isSelling, count } = action.payload;
            const key = isSelling ? "total_seller_unread_chat_count" : "total_buyer_unread_chat_count";
            if (state?.data?.data) {
                state.data.data[key] = count;
            }
        }
    },
});

export const { updateDataSuccess, userUpdateData, userLogout, decreaseFollowingCount, decreaseUnreadChatCount, increaseUnreadChatCount, setUnreadChatCount } = authSlice.actions;
export default authSlice.reducer;

export const loadUpdateData = (data) => {
    store?.dispatch(updateDataSuccess(data));
};
export const loadUpdateUserData = (data) => {
    store?.dispatch(userUpdateData({ data }));
};
export const logoutSuccess = () => {
    store?.dispatch(userLogout());
};

export const decreaseFollowing = () => {
    store?.dispatch(decreaseFollowingCount());
};

export const userSignUpData = createSelector(
    (state) => state.UserSignup,
    (UserSignup) => UserSignup?.data?.data
);

export const getIsLoggedIn = createSelector(
    (state) => state.UserSignup,
    (UserSignup) => UserSignup?.data?.token
);

export const getStoredFcmId = createSelector(
    (state) => state.UserSignup,
    (UserSignup) => UserSignup?.data?.data?.fcm_id || ""
);

export const getUnreadChatCounts = createSelector(
    (state) => state.UserSignup,
    (UserSignup) => ({
        selling: UserSignup?.data?.data?.total_seller_unread_chat_count || 0,
        buying: UserSignup?.data?.data?.total_buyer_unread_chat_count || 0,
    })
);







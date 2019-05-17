import axios from "axios";
import setAuthToken from "../utils/setAuthToken";
import { setErrors } from "./errorActions";
import { SET_TODOLISTS, TODOLISTS_LOADING, REMOVE_TODOLIST } from "./types";

// Get TodoLists
export const getTodoLists = () => dispatch => {
    const token = localStorage.jwtToken
    dispatch({
        type: TODOLISTS_LOADING
    })
    setAuthToken(token)
    axios
        .get("/api/todolists")
        .then(res => {
            // console.log(res.data)
            // res.data = Contains Collection of TodoLists
            dispatch({
                type: SET_TODOLISTS,
                payload: res.data
            })
        })
        .catch(err => {
            // console.log(err)
            dispatch(setErrors(err.response.data))
        });
};

// Delete a TodoList
export const deleteTodoList = (todoListId) => dispatch => {
    const token = localStorage.jwtToken
    setAuthToken(token)
    axios
        .delete("/api/todolists/" + todoListId)
        .then(res => {
            // console.log(res.data)
            // Remove Todo List from current lists of todolists
            dispatch({
                type: REMOVE_TODOLIST,
                payload: todoListId
            })
        })
        .catch(err => {
            // console.log(err)
            dispatch(setErrors(err.response.data))
        });
};


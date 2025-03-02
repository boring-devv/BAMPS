import { createContext, useContext, useEffect, useReducer, useRef } from 'react';
import PropTypes from 'prop-types';
import { getAuth, signInWithEmailAndPassword } from "firebase/auth";
import { auth } from 'src/Firebase.config';
import { toast } from 'react-toastify';

const HANDLERS = {
  INITIALIZE: 'INITIALIZE',
  SIGN_IN: 'SIGN_IN',
  SIGN_OUT: 'SIGN_OUT'
};

const initialState = {
  isAuthenticated: false,
  isLoading: true,
  user: null
};

const handlers = {
  [HANDLERS.INITIALIZE]: (state, action) => {
    const user = action.payload;

    return {
      ...state,
      ...(
        // if payload (user) is provided, then is authenticated
        user
          ? ({
            isAuthenticated: true,
            isLoading: false,
            user
          })
          : ({
            isLoading: false
          })
      )
    };
  },
  [HANDLERS.SIGN_IN]: (state, action) => {
    const user = action.payload;

    return {
      ...state,
      isAuthenticated: true,
      user
    };
  },
  [HANDLERS.SIGN_OUT]: (state) => {
    return {
      ...state,
      isAuthenticated: false,
      user: null
    };
  }
};

const reducer = (state, action) => (
  handlers[action.type] ? handlers[action.type](state, action) : state
);

// The role of this context is to propagate authentication state through the App tree.

export const AuthContext = createContext({ undefined });

export const AuthProvider = (props) => {
  const { children } = props;
  const [state, dispatch] = useReducer(reducer, initialState);
  const initialized = useRef(false);

  const initialize = async () => {
    // Prevent from calling twice in development mode with React.StrictMode enabled
    if (initialized.current) {
      return;
    }

    initialized.current = true;

    let isAuthenticated = false;

    try {
      isAuthenticated = window.sessionStorage.getItem('authenticated') === 'true';
    } catch (err) {
      console.error(err);
    }

    if (isAuthenticated) {
      const user = auth.currentUser

      dispatch({
        type: HANDLERS.INITIALIZE,
        payload: user
      });
    } else {
      dispatch({
        type: HANDLERS.INITIALIZE
      });
    }
  };

  useEffect(
    () => {
      initialize();
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    []
  );

  const signIn = async (email, password) => {
    try {
      await signInWithEmailAndPassword(auth,email, password).then(()=>{
        window.sessionStorage.setItem('authenticated', 'true');
        const user = auth.currentUser
        toast.success('Welcome!')
        dispatch({
          type: HANDLERS.SIGN_IN,
          payload: user
        });
      }).catch((error)=>{
        switch (error?.code) {
          case 'auth/invalid-email':
            toast.error('Invalid email address!')
            break;
          case 'auth/user-disabled':
            toast.error('Account has been disabled!')
            break;
          case 'auth/user-not-found':
            toast.error('User not found!')
            break;
          case 'auth/wrong-password':
            toast.error('Invalid or wrong password!')
            break;
          case 'auth/email-already-in-use':
            toast.error('Email address is already in use.')
            break;
          case 'auth/weak-password':
            toast.error('Password too weak')
            break;
          // Add more cases for other possible error codes
      
          default:
            toast.error('An error occured!')
            break;
        }
      })
      
    } catch (err) {
      toast.error('An error occured!')
    }
  };

  const signOut = () => {
    dispatch({
      type: HANDLERS.SIGN_OUT
    });
  };

  return (
    <AuthContext.Provider
      value={{
        ...state,
        signIn,
        signOut
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

AuthProvider.propTypes = {
  children: PropTypes.node
};

export const AuthConsumer = AuthContext.Consumer;

export const useAuthContext = () => useContext(AuthContext);

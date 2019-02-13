import React, { Component } from "react";
import { BrowserRouter as Router, Route } from "react-router-dom";
import { Provider } from "react-redux";
import jwt_decode from "jwt-decode";
import { setAuthTokenHeader } from "./utils/authTokenHeader";
import { setCurrentUser } from "./actions/authActions";
import store from "./store";
import Navbar from "./components/layout/Navbar";
import Footer from "./components/layout/Footer";
import Landing from "./components/layout/Landing";
import "./App.css";
import Register from "./components/auth/Register";
import Login from "./components/auth/Login";

class App extends Component {
  render() {
    if (localStorage.jwtToken) {
      setAuthTokenHeader(localStorage.jwtToken);
      const decode = jwt_decode(localStorage.jwtToken);
      store.dispatch(setCurrentUser(decode));

      const currentTime = Date.now() / 1000;
      if(decode.exp < currentTime) {
        store.dispatch(setCurrentUser());
        window.location.href = '/login';
      }
    }

    return (
      <Provider store={store}>
        <Router>
          <div className="App">
            <Navbar />
            <Route exact path="/" component={Landing} />
            <Route exact path="/register" component={Register} />
            <Route exact path="/login" component={Login} />
            <Footer />
          </div>
        </Router>
      </Provider>
    );
  }
}

export default App;
